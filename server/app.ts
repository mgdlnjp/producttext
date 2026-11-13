import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { auditListing, sanitizeListing } from '../shared/audit';
import { generateDemoListing } from '../shared/demo';
import type { ApiError, GenerateResponse, HealthResponse } from '../shared/types';
import { generateRequestSchema, validateProductInput } from '../shared/validation';
import {
  consumeAccess,
  createBillingContext,
  createBillingRouter,
  type BillingContext,
  type BillingUrls,
} from './billing';
import { GenerationError, type ListingGenerator } from './generation';
import { createRateLimiter } from './rateLimit';

export interface AppOptions {
  /** `null` = mode démo (aucune clé API configurée). */
  generator: ListingGenerator | null;
  /** Dossier du front compilé à servir en production. */
  staticDir?: string;
  rateLimit?: { windowMs: number; max: number };
  /** Abonnement Stripe. Absent = accès libre (facturation désactivée). */
  billing?: BillingContext;
}

/** Routage par hash : le retour Stripe arrive sur #abonnement avec l'identifiant de session en paramètre. */
export const BILLING_URLS: BillingUrls = {
  success: (origin) => `${origin}/?session_id={CHECKOUT_SESSION_ID}#abonnement`,
  cancel: (origin) => `${origin}/#creer`,
  portalReturn: (origin) => `${origin}/#creer`,
};

export const billingErrorBody = (code: string, message: string, extra?: Record<string, unknown>) => ({
  error: message,
  code,
  ...extra,
});

export function createApp({ generator, staticDir, rateLimit, billing: billingOption }: AppOptions) {
  const app = express();
  const mode = generator ? 'ai' : 'demo';
  const billing =
    billingOption ??
    createBillingContext({ settings: null, freePerDay: 0, urls: BILLING_URLS, errorBody: billingErrorBody });

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  app.get('/api/health', (_req, res: Response<HealthResponse>) => {
    res.json({ ok: true, mode });
  });

  const limiter = createRateLimiter(rateLimit ?? { windowMs: 60_000, max: 12 });

  app.post(
    '/api/generate',
    limiter,
    express.json({ limit: '16kb' }),
    async (req: Request, res: Response<GenerateResponse | ApiError>) => {
      const body = generateRequestSchema.shape.variant.safeParse(req.body?.variant);
      const variant = body.success ? body.data : 0;

      const validation = validateProductInput(req.body?.input);
      if (!validation.success) {
        res.status(400).json({ error: 'Certains champs sont invalides.', fieldErrors: validation.errors });
        return;
      }

      const input = validation.data;
      const gate = consumeAccess(
        billing,
        req,
        res,
        () => "Vous avez utilisé vos générations gratuites.",
      );
      if (!gate) return;
      try {
        const raw = generator ? await generator.generate(input, variant) : generateDemoListing(input, variant);
        const listing = sanitizeListing(raw);
        res.json({ mode, listing, warnings: auditListing(input, listing), access: gate.access });
      } catch (error) {
        gate.refund();
        if (error instanceof GenerationError) {
          res.status(error.status).json({ error: error.message });
          return;
        }
        console.error('[api] Erreur inattendue', error);
        res.status(500).json({ error: 'Erreur inattendue. Réessayez.' });
      }
    },
  );

  app.use('/api/billing', express.json({ limit: '4kb' }), createBillingRouter(billing));

  app.use('/api', (_req, res: Response<ApiError>) => {
    res.status(404).json({ error: 'Route introuvable.' });
  });

  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir, { index: false, maxAge: '1h' }));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  // Erreurs de parsing JSON, corps trop volumineux, etc.
  app.use((error: Error & { status?: number; type?: string }, _req: Request, res: Response<ApiError>, next: NextFunction) => {
    if (res.headersSent) return next(error);
    if (error.type === 'entity.too.large') {
      res.status(413).json({ error: 'Votre saisie est trop volumineuse.' });
      return;
    }
    if (error.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Requête invalide.' });
      return;
    }
    console.error('[api] Erreur', error);
    res.status(500).json({ error: 'Erreur inattendue. Réessayez.' });
  });

  return app;
}
