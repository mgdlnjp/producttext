import type { AccessInfo } from './billing';

/**
 * Types partagés entre le navigateur et le serveur.
 * Aucune donnée sensible ne doit transiter par ces types.
 */

export const CONDITIONS = ['neuf', 'tres-bon-etat', 'bon-etat', 'etat-correct', 'non-precise'] as const;
export const PLATFORMS = ['ecommerce', 'marketplace', 'particuliers'] as const;
export const TONES = ['neutre', 'premium', 'chaleureux', 'dynamique'] as const;

export type Condition = (typeof CONDITIONS)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Tone = (typeof TONES)[number];

export const CONDITION_LABELS: Record<Condition, string> = {
  neuf: 'Neuf',
  'tres-bon-etat': 'Très bon état',
  'bon-etat': 'Bon état',
  'etat-correct': 'État correct',
  'non-precise': 'Non précisé',
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  ecommerce: 'Boutique e-commerce',
  marketplace: 'Marketplace',
  particuliers: 'Annonce entre particuliers',
};

export const TONE_LABELS: Record<Tone, string> = {
  neutre: 'Neutre',
  premium: 'Premium',
  chaleureux: 'Chaleureux',
  dynamique: 'Dynamique',
};

/** Données saisies par le vendeur. */
export interface ProductInput {
  productName: string;
  category: string;
  features: string;
  condition: Condition;
  audience: string;
  platform: Platform;
  tone: Tone;
  keywords: string;
}

/** Fiche produit générée. */
export interface Listing {
  title: string;
  hook: string;
  description: string;
  highlights: string[];
  keywords: string[];
  /** Informations utiles absentes de la saisie, à compléter par le vendeur. */
  missingInfo: string[];
}

export type GenerationMode = 'ai' | 'demo';

export interface GenerateRequest {
  input: ProductInput;
  /** Numéro de version demandé (0 = première génération). */
  variant?: number;
}

export interface GenerateResponse {
  mode: GenerationMode;
  listing: Listing;
  /** Points détectés automatiquement qui méritent une relecture. */
  warnings: string[];
  /** Droits d'accès après cette génération (quota gratuit restant ou Pro). */
  access?: AccessInfo;
}

export interface ApiError {
  error: string;
  code?: string;
  access?: AccessInfo;
  fieldErrors?: Partial<Record<keyof ProductInput, string>>;
}

export interface HealthResponse {
  ok: true;
  mode: GenerationMode;
}
