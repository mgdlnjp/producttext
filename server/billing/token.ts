import crypto from "node:crypto";

/**
 * Jeton d'accès Pro : HMAC-SHA256 (format JWT compact), signé côté serveur.
 * Il ne contient que des identifiants Stripe opaques, aucune donnée personnelle.
 */
export interface AccessTokenPayload {
  /** Identifiant d'abonnement Stripe. */
  sub: string;
  /** Identifiant client Stripe (portail de gestion). */
  cus: string;
  /** Expiration (ms epoch). */
  exp: number;
  /** Émission (ms epoch). */
  iat: number;
}

export const ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Un jeton expiré reste utilisable pour être renouvelé pendant cette durée. */
export const REFRESH_GRACE_MS = 60 * 24 * 60 * 60 * 1000;

const HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function signAccessToken(
  claims: { sub: string; cus: string },
  secret: string,
  now = Date.now(),
): string {
  const payload: AccessTokenPayload = { ...claims, iat: now, exp: now + ACCESS_TOKEN_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${HEADER}.${body}.${sign(`${HEADER}.${body}`, secret)}`;
}

export type VerifyResult =
  | { ok: true; payload: AccessTokenPayload; expired: boolean }
  | { ok: false };

/** Vérifie la signature (comparaison à temps constant) puis la structure. */
export function verifyAccessToken(token: string, secret: string, now = Date.now()): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== HEADER) return { ok: false };
  const [header, body, signature] = parts as [string, string, string];
  const expected = Buffer.from(sign(`${header}.${body}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return { ok: false };
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AccessTokenPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.cus !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number"
    ) {
      return { ok: false };
    }
    return { ok: true, payload, expired: payload.exp <= now };
  } catch {
    return { ok: false };
  }
}

export function bearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 && token.length < 2_048 ? token : null;
}
