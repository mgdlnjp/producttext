import type { NextFunction, Request, Response } from 'express';

/**
 * Limiteur de débit en mémoire, par adresse IP (fenêtre fixe).
 * Suffisant pour un MVP mono-instance ; utiliser un store partagé (Redis…)
 * si l'application tourne sur plusieurs instances.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString());
      res.status(429).json({ error: 'Trop de demandes. Patientez une minute avant de réessayer.' });
      return;
    }
    next();
  };
}
