import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BILLING_URLS, billingErrorBody, createApp } from './app';
import { createBillingContext, loadBillingSettings, loadFreePerDay } from './billing';
import { createAiGenerator } from './generation';

// Charge .env en local si présent (Node >= 20.12). En production, les variables
// sont fournies par l'hébergeur.
try {
  process.loadEnvFile?.();
} catch {
  // pas de fichier .env : rien à faire
}

const port = Number(process.env.PORT) || 8787;
const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
const model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-opus-5-5';
const effortEnv = process.env.ANTHROPIC_EFFORT?.trim();
const effort = effortEnv === 'medium' || effortEnv === 'high' ? effortEnv : 'low';

const generator = apiKey ? createAiGenerator({ apiKey, model, effort }) : null;

const here = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(here, '../dist');

const billingSettings = loadBillingSettings();
const billing = createBillingContext({
  settings: billingSettings,
  freePerDay: loadFreePerDay(),
  urls: BILLING_URLS,
  errorBody: billingErrorBody,
});

const app = createApp({ generator, billing, staticDir: process.env.NODE_ENV === 'production' ? staticDir : undefined });

app.listen(port, () => {
  console.log(`ProductText API sur http://localhost:${port}`);
  console.log(
    generator
      ? `Mode : génération IA (modèle ${model}, effort ${effort})`
      : 'Mode : DÉMONSTRATION (ANTHROPIC_API_KEY absente) — textes assemblés à partir de gabarits.',
  );
  console.log(billingSettings ? `Abonnement Stripe actif (${billing.freePerDay} générations gratuites / 24 h)` : 'Abonnement : désactivé (accès libre)');
});
