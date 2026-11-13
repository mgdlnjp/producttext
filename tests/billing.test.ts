import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { BILLING_URLS, billingErrorBody, createApp } from '../server/app';
import { createBillingContext, loadBillingSettings, loadFreePerDay, type BillingSettings } from '../server/billing';
import { BillingUnavailableError, type BillingProvider } from '../server/billing/provider';
import { createFreeQuota } from '../server/billing/quota';
import { ACCESS_TOKEN_TTL_MS, signAccessToken, verifyAccessToken } from '../server/billing/token';
import { GenerationError, type ListingGenerator } from '../server/generation';
import { formatPrice } from '../shared/billing';
import { FULL_INPUT } from './fixtures';

const SECRET = 'x'.repeat(40);
const SESSION = 'cs_test_a1B2c3D4e5F6g7H8';
const SETTINGS: BillingSettings = {
  stripeSecretKey: 'sk_test_x',
  stripePriceId: 'price_x',
  tokenSecret: SECRET,
  appUrl: 'https://producttext.example',
};

function fakeProvider(overrides: Partial<BillingProvider> = {}): BillingProvider {
  return {
    getPrice: async () => ({ amount: 490, currency: 'eur', interval: 'month', intervalCount: 1 }),
    createCheckout: vi.fn(async () => 'https://checkout.stripe.test/s'),
    resolveCheckout: async (id) => (id === SESSION ? { subscriptionId: 'sub_1', customerId: 'cus_1' } : null),
    isSubscriptionActive: async (id) => id === 'sub_1',
    createPortal: async ({ customerId }) => `https://billing.stripe.test/${customerId}`,
    ...overrides,
  };
}

function app(opts: { settings?: BillingSettings | null; provider?: BillingProvider | null; generator?: ListingGenerator } = {}) {
  const billing = createBillingContext({
    settings: opts.settings === undefined ? SETTINGS : opts.settings,
    freePerDay: 2,
    urls: BILLING_URLS,
    errorBody: billingErrorBody,
    provider: opts.provider === undefined ? fakeProvider() : opts.provider,
    log: () => {},
  });
  return createApp({ generator: opts.generator ?? null, billing, rateLimit: { windowMs: 60_000, max: 1_000 } });
}

const proToken = (now = Date.now()) => signAccessToken({ sub: 'sub_1', cus: 'cus_1' }, SECRET, now);
const generate = (a: ReturnType<typeof app>, token?: string) => {
  const req = request(a).post('/api/generate');
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req.send({ input: FULL_INPUT });
};

describe('jeton et quota', () => {
  it('vérifie, refuse les jetons falsifiés et signale l’expiration', () => {
    const token = proToken();
    expect(verifyAccessToken(token, SECRET).ok).toBe(true);
    expect(verifyAccessToken(token, 'y'.repeat(40)).ok).toBe(false);
    const expired = verifyAccessToken(proToken(Date.now() - ACCESS_TOKEN_TTL_MS - 1), SECRET);
    expect(expired.ok && expired.expired).toBe(true);
  });

  it('limite, rembourse et se renouvelle après 24 h', () => {
    let t = 0;
    const quota = createFreeQuota(2, () => t);
    quota.consume('ip');
    quota.consume('ip');
    expect(quota.consume('ip').allowed).toBe(false);
    quota.refund('ip');
    expect(quota.peek('ip')).toBe(1);
    t = 24 * 60 * 60 * 1000 + 1;
    expect(quota.peek('ip')).toBe(2);
  });
});

describe('configuration', () => {
  it('désactive la facturation sans Stripe et exige un secret robuste sinon', () => {
    expect(loadBillingSettings({})).toBeNull();
    expect(() => loadBillingSettings({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_ID: 'p' })).toThrow(/ACCESS_TOKEN_SECRET/);
    expect(() =>
      loadBillingSettings({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_ID: 'p', ACCESS_TOKEN_SECRET: SECRET, APP_URL: 'ftp://x' }),
    ).toThrow(/APP_URL/);
    expect(loadFreePerDay({})).toBe(3);
    expect(loadFreePerDay({ FREE_USES_PER_DAY: '5' })).toBe(5);
  });

  it('formate le prix', () => {
    expect(formatPrice({ amount: 490, currency: 'eur', interval: 'month', intervalCount: 1 })).toMatch(/4,90\s€ \/ mois/);
  });
});

describe('génération et quota', () => {
  it('laisse l’accès libre si la facturation est désactivée', async () => {
    const a = app({ settings: null, provider: null });
    for (let i = 0; i < 4; i++) expect((await generate(a)).status).toBe(200);
    expect((await request(a).get('/api/billing/config')).body.enabled).toBe(false);
    expect((await request(a).post('/api/billing/checkout')).status).toBe(404);
  });

  it('bloque au-delà du quota gratuit avec une erreur 402 lisible', async () => {
    const a = app();
    expect((await generate(a)).body.access).toEqual({ plan: 'free', remaining: 1, limit: 2 });
    await generate(a);
    const blocked = await generate(a);
    expect(blocked.status).toBe(402);
    expect(blocked.body).toMatchObject({ code: 'QUOTA_EXCEEDED', access: { plan: 'free', remaining: 0, limit: 2 } });
    expect(blocked.body.error).toMatch(/générations gratuites/);
  });

  it('ne consomme pas le quota pour une saisie invalide ni une génération en échec', async () => {
    const failing: ListingGenerator = {
      generate: async () => {
        throw new GenerationError('Indisponible', 503);
      },
    };
    const a = app({ generator: failing });
    await request(a).post('/api/generate').send({ input: { ...FULL_INPUT, productName: '' } });
    expect((await generate(a)).status).toBe(503);
    expect((await request(a).get('/api/billing/status')).body).toEqual({ plan: 'free', remaining: 2, limit: 2 });
  });

  it('donne un accès illimité avec un jeton Pro et ignore un jeton falsifié', async () => {
    const a = app();
    for (let i = 0; i < 4; i++) expect((await generate(a, proToken())).body.access).toEqual({ plan: 'pro' });
    expect((await generate(a, 'faux.jeton.ici')).body.access.plan).toBe('free');
  });

  it('demande un renouvellement pour un jeton expiré', async () => {
    const res = await generate(app(), proToken(Date.now() - ACCESS_TOKEN_TTL_MS - 1_000));
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });
});

describe('parcours d’abonnement', () => {
  it('expose le prix Stripe', async () => {
    const res = await request(app()).get('/api/billing/config');
    expect(res.body).toEqual({ enabled: true, freePerDay: 2, price: { amount: 490, currency: 'eur', interval: 'month', intervalCount: 1 } });
  });

  it('crée la session Checkout avec les URL de retour de l’application', async () => {
    const provider = fakeProvider();
    await request(app({ provider })).post('/api/billing/checkout').set('Host', 'evil.example');
    expect(provider.createCheckout).toHaveBeenCalledWith({
      successUrl: 'https://producttext.example/?session_id={CHECKOUT_SESSION_ID}#abonnement',
      cancelUrl: 'https://producttext.example/#creer',
    });
  });

  it('active après paiement confirmé, refuse sinon', async () => {
    const a = app();
    const ok = await request(a).post('/api/billing/activate').send({ sessionId: SESSION });
    expect((await request(a).get('/api/billing/status').set('Authorization', `Bearer ${ok.body.token}`)).body).toEqual({ plan: 'pro' });
    expect((await request(a).post('/api/billing/activate').send({ sessionId: 'abc' })).status).toBe(400);
    expect((await request(a).post('/api/billing/activate').send({ sessionId: 'cs_test_zzzzzzzzzzzzzzzz' })).status).toBe(402);
  });

  it('renouvelle seulement avec un jeton signé et un abonnement actif', async () => {
    const expired = proToken(Date.now() - ACCESS_TOKEN_TTL_MS - 1_000);
    expect((await request(app()).post('/api/billing/refresh').set('Authorization', `Bearer ${expired}`)).status).toBe(200);
    expect((await request(app()).post('/api/billing/refresh').send({ subscription_id: 'sub_1' })).status).toBe(401);
    const inactive = app({ provider: fakeProvider({ isSubscriptionActive: async () => false }) });
    const res = await request(inactive).post('/api/billing/refresh').set('Authorization', `Bearer ${proToken()}`);
    expect(res.status).toBe(402);
    expect(res.body.code).toBe('SUBSCRIPTION_INACTIVE');
  });

  it('ouvre le portail client et gère l’indisponibilité de Stripe', async () => {
    expect((await request(app()).post('/api/billing/portal').set('Authorization', `Bearer ${proToken()}`)).body.url).toBe(
      'https://billing.stripe.test/cus_1',
    );
    const down = app({
      provider: fakeProvider({
        createCheckout: async () => {
          throw new BillingUnavailableError();
        },
      }),
    });
    const res = await request(down).post('/api/billing/checkout');
    expect(res.status).toBe(503);
    expect(res.body.code).toBe('BILLING_UNAVAILABLE');
  });
});
