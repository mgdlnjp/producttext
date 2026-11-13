import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../server/app';
import { GenerationError, type ListingGenerator } from '../server/generation';
import { FULL_INPUT } from './fixtures';

const demoApp = () => createApp({ generator: null });

describe('API', () => {
  it('indique le mode démo sans clé', async () => {
    const res = await request(demoApp()).get('/api/health');
    expect(res.body).toEqual({ ok: true, mode: 'demo' });
  });

  it('génère une fiche en mode démo', async () => {
    const res = await request(demoApp()).post('/api/generate').send({ input: FULL_INPUT });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('demo');
    expect(res.body.listing.title).toContain('Lampe');
    expect(res.body.warnings).toEqual([]);
  });

  it('valide les champs requis', async () => {
    const res = await request(demoApp()).post('/api/generate').send({ input: { ...FULL_INPUT, productName: '' } });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors.productName).toBeDefined();
  });

  it('refuse un JSON invalide et un corps trop volumineux', async () => {
    const app = demoApp();
    const bad = await request(app).post('/api/generate').set('Content-Type', 'application/json').send('{oops');
    expect(bad.status).toBe(400);
    const big = await request(app).post('/api/generate').send({ input: { ...FULL_INPUT, features: 'x'.repeat(20_000) } });
    expect(big.status).toBe(413);
  });

  it('utilise le générateur IA, nettoie et audite sa sortie', async () => {
    const generator: ListingGenerator = {
      generate: async () => ({
        title: ' Lampe ',
        hook: 'Offre limitée !',
        description: 'Texte',
        highlights: ['A', 'B', 'C'],
        keywords: [],
        missingInfo: [],
      }),
    };
    const res = await request(createApp({ generator })).post('/api/generate').send({ input: FULL_INPUT, variant: 1 });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('ai');
    expect(res.body.listing.title).toBe('Lampe');
    expect(res.body.warnings.join(' ')).toMatch(/urgence/);
  });

  it('renvoie un message lisible en cas d’erreur de génération', async () => {
    const generator: ListingGenerator = {
      generate: async () => {
        throw new GenerationError('Le service est très sollicité. Réessayez dans un instant.', 503);
      },
    };
    const res = await request(createApp({ generator })).post('/api/generate').send({ input: FULL_INPUT });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/sollicité/);
  });

  it('limite le débit', async () => {
    const app = createApp({ generator: null, rateLimit: { windowMs: 60_000, max: 2 } });
    await request(app).post('/api/generate').send({ input: FULL_INPUT });
    await request(app).post('/api/generate').send({ input: FULL_INPUT });
    const res = await request(app).post('/api/generate').send({ input: FULL_INPUT });
    expect(res.status).toBe(429);
  });
});
