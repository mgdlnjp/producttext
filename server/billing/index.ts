import { Router, type Request, type Response } from "express";
import type { AccessInfo, BillingConfig } from "../../shared/billing";
import { BillingUnavailableError, createStripeProvider, type BillingProvider } from "./provider";
import { createFreeQuota, type FreeQuota } from "./quota";
import { bearerToken, REFRESH_GRACE_MS, signAccessToken, verifyAccessToken } from "./token";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

export interface BillingSettings {
  stripeSecretKey: string;
  stripePriceId: string;
  /** Secret HMAC des jetons d'accès (≥ 32 caractères). */
  tokenSecret: string;
  /** Origine publique de l'app pour les redirections Stripe (sinon déduite de la requête). */
  appUrl: string | null;
}

export function loadBillingSettings(env: NodeJS.ProcessEnv = process.env): BillingSettings | null {
  const stripeSecretKey = env.STRIPE_SECRET_KEY?.trim();
  const stripePriceId = env.STRIPE_PRICE_ID?.trim();
  if (!stripeSecretKey || !stripePriceId) return null;

  const tokenSecret = env.ACCESS_TOKEN_SECRET?.trim() ?? "";
  if (tokenSecret.length < 32) {
    throw new Error(
      "ACCESS_TOKEN_SECRET doit contenir au moins 32 caractères quand Stripe est configuré (ex. : openssl rand -base64 48).",
    );
  }
  const appUrl = env.APP_URL?.trim().replace(/\/+$/, "") || null;
  if (appUrl && !/^https?:\/\/[^/\s]+$/.test(appUrl)) {
    throw new Error("APP_URL doit être une origine du type https://exemple.fr (sans chemin).");
  }
  return { stripeSecretKey, stripePriceId, tokenSecret, appUrl };
}

export function loadFreePerDay(env: NodeJS.ProcessEnv = process.env, fallback = 3): number {
  const n = Number.parseInt(env.FREE_USES_PER_DAY ?? "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 1_000) : fallback;
}

/* ------------------------------------------------------------------ */
/*  Contexte                                                           */
/* ------------------------------------------------------------------ */

export interface BillingUrls {
  /** URL de retour après paiement ; doit contenir `{CHECKOUT_SESSION_ID}`. */
  success: (origin: string) => string;
  cancel: (origin: string) => string;
  portalReturn: (origin: string) => string;
}

export interface BillingContext {
  settings: BillingSettings | null;
  provider: BillingProvider | null;
  quota: FreeQuota;
  freePerDay: number;
  urls: BillingUrls;
  /** Format des erreurs JSON propre à l'application. */
  errorBody: (code: string, message: string, extra?: Record<string, unknown>) => unknown;
  log: (event: Record<string, unknown>) => void;
}

export function createBillingContext(opts: {
  settings: BillingSettings | null;
  freePerDay: number;
  urls: BillingUrls;
  errorBody: BillingContext["errorBody"];
  provider?: BillingProvider | null;
  quota?: FreeQuota;
  log?: BillingContext["log"];
}): BillingContext {
  return {
    settings: opts.settings,
    provider:
      opts.provider !== undefined
        ? opts.provider
        : opts.settings
          ? createStripeProvider({ secretKey: opts.settings.stripeSecretKey, priceId: opts.settings.stripePriceId })
          : null,
    quota: opts.quota ?? createFreeQuota(opts.freePerDay),
    freePerDay: opts.freePerDay,
    urls: opts.urls,
    errorBody: opts.errorBody,
    log: opts.log ?? ((e) => console.info(JSON.stringify(e))),
  };
}

/* ------------------------------------------------------------------ */
/*  Droits d'accès                                                     */
/* ------------------------------------------------------------------ */

export type AccessDecision =
  | { kind: "open" }
  | { kind: "pro" }
  | { kind: "free"; key: string }
  | { kind: "expired" };

/** Détermine les droits d'une requête à partir du jeton `Authorization: Bearer`. */
export function resolveAccess(ctx: BillingContext, req: Request): AccessDecision {
  if (!ctx.settings) return { kind: "open" };
  const token = bearerToken(req.headers.authorization);
  if (token) {
    const result = verifyAccessToken(token, ctx.settings.tokenSecret);
    if (result.ok && !result.expired) return { kind: "pro" };
    if (result.ok && result.expired) return { kind: "expired" };
  }
  return { kind: "free", key: req.ip ?? "unknown" };
}

export function accessInfo(ctx: BillingContext, decision: AccessDecision, remaining?: number): AccessInfo {
  if (decision.kind === "open") return { plan: "open" };
  if (decision.kind === "pro") return { plan: "pro" };
  const left = remaining ?? (decision.kind === "free" ? ctx.quota.peek(decision.key) : 0);
  return { plan: "free", remaining: left, limit: ctx.freePerDay };
}

/**
 * À appeler dans une route payante, après validation de l'entrée.
 * Répond 401/402 et renvoie `null` si l'accès est refusé ; sinon renvoie les infos d'accès
 * et une fonction `refund` à appeler si le traitement échoue.
 */
export function consumeAccess(
  ctx: BillingContext,
  req: Request,
  res: Response,
  quotaMessage: (limit: number) => string,
): { access: AccessInfo; refund: () => void } | null {
  const decision = resolveAccess(ctx, req);
  if (decision.kind === "expired") {
    res.status(401).json(ctx.errorBody("TOKEN_EXPIRED", "Votre accès doit être renouvelé."));
    return null;
  }
  if (decision.kind !== "free") return { access: accessInfo(ctx, decision), refund: () => {} };

  const result = ctx.quota.consume(decision.key);
  if (!result.allowed) {
    res
      .status(402)
      .json(ctx.errorBody("QUOTA_EXCEEDED", quotaMessage(ctx.freePerDay), { access: accessInfo(ctx, decision, 0) }));
    return null;
  }
  return {
    access: accessInfo(ctx, decision, result.remaining),
    refund: () => ctx.quota.refund(decision.key),
  };
}

/* ------------------------------------------------------------------ */
/*  Routes /api/billing                                                */
/* ------------------------------------------------------------------ */

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

type Handler = (req: Request, res: Response, settings: BillingSettings, provider: BillingProvider) => Promise<void>;

export function createBillingRouter(ctx: BillingContext): Router {
  const router = Router();
  const fail = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json(ctx.errorBody(code, message));
  const originOf = (settings: BillingSettings, req: Request) =>
    settings.appUrl ?? `${req.protocol}://${req.get("host")}`;

  router.get("/config", async (_req, res) => {
    const body: BillingConfig = { enabled: false, freePerDay: ctx.freePerDay, price: null };
    if (!ctx.settings || !ctx.provider) {
      res.json(body);
      return;
    }
    try {
      res.json({ ...body, enabled: true, price: await ctx.provider.getPrice() });
    } catch (err) {
      ctx.log({ event: "billing_error", op: "price", name: err instanceof Error ? err.name : "unknown" });
      res.json(body);
    }
  });

  router.get("/status", (req, res) => {
    const decision = resolveAccess(ctx, req);
    if (decision.kind === "expired") {
      fail(res, 401, "TOKEN_EXPIRED", "Votre accès doit être renouvelé.");
      return;
    }
    res.json(accessInfo(ctx, decision));
  });

  const handle = (op: string, fn: Handler) => async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    const { settings, provider } = ctx;
    if (!settings || !provider) {
      fail(res, 404, "BILLING_DISABLED", "Le paiement n'est pas activé sur cette instance.");
      return;
    }
    try {
      await fn(req, res, settings, provider);
    } catch (err) {
      ctx.log({ event: "billing_error", op, name: err instanceof Error ? err.name : "unknown" });
      if (err instanceof BillingUnavailableError) {
        fail(res, 503, "BILLING_UNAVAILABLE", "Le service de paiement est momentanément indisponible.");
      } else {
        fail(res, 500, "INTERNAL", "Une erreur inattendue est survenue.");
      }
    }
  };

  /** Vérifie un jeton signé, même expiré, dans la limite du délai de grâce. */
  const signedPayload = (req: Request, settings: BillingSettings) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) return null;
    const result = verifyAccessToken(token, settings.tokenSecret);
    if (!result.ok || Date.now() - result.payload.exp > REFRESH_GRACE_MS) return null;
    return result.payload;
  };

  router.post(
    "/checkout",
    handle("checkout", async (req, res, settings, provider) => {
      const origin = originOf(settings, req);
      const url = await provider.createCheckout({
        successUrl: ctx.urls.success(origin),
        cancelUrl: ctx.urls.cancel(origin),
      });
      res.json({ url });
    }),
  );

  router.post(
    "/activate",
    handle("activate", async (req, res, settings, provider) => {
      const sessionId = (req.body as { sessionId?: unknown } | undefined)?.sessionId;
      if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) {
        fail(res, 400, "INVALID_SESSION", "Session de paiement invalide.");
        return;
      }
      const resolved = await provider.resolveCheckout(sessionId);
      if (!resolved) {
        fail(res, 402, "PAYMENT_NOT_CONFIRMED", "Le paiement n'est pas encore confirmé.");
        return;
      }
      ctx.log({ event: "billing_activate" });
      res.json({
        token: signAccessToken({ sub: resolved.subscriptionId, cus: resolved.customerId }, settings.tokenSecret),
      });
    }),
  );

  router.post(
    "/refresh",
    handle("refresh", async (req, res, settings, provider) => {
      const payload = signedPayload(req, settings);
      if (!payload) {
        fail(res, 401, "INVALID_TOKEN", "Accès introuvable ou trop ancien.");
        return;
      }
      if (!(await provider.isSubscriptionActive(payload.sub))) {
        fail(res, 402, "SUBSCRIPTION_INACTIVE", "Votre abonnement n'est plus actif.");
        return;
      }
      res.json({ token: signAccessToken({ sub: payload.sub, cus: payload.cus }, settings.tokenSecret) });
    }),
  );

  router.post(
    "/portal",
    handle("portal", async (req, res, settings, provider) => {
      const payload = signedPayload(req, settings);
      if (!payload) {
        fail(res, 401, "INVALID_TOKEN", "Accès introuvable.");
        return;
      }
      const url = await provider.createPortal({
        customerId: payload.cus,
        returnUrl: ctx.urls.portalReturn(originOf(settings, req)),
      });
      res.json({ url });
    }),
  );

  return router;
}
