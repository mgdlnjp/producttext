import { z } from 'zod';
import { CONDITIONS, PLATFORMS, TONES, type ProductInput } from './types';

/** Limites de taille des champs (partagées formulaire + serveur). */
export const LIMITS = {
  productName: { min: 2, max: 120 },
  category: { max: 80 },
  features: { max: 1500 },
  audience: { max: 200 },
  keywords: { max: 200, maxCount: 10 },
} as const;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} : ${max} caractères maximum.`)
    .default('');

export const productInputSchema = z.object({
  productName: z
    .string({ error: 'Le nom du produit est requis.' })
    .trim()
    .min(1, 'Le nom du produit est requis.')
    .min(LIMITS.productName.min, `Le nom du produit doit contenir au moins ${LIMITS.productName.min} caractères.`)
    .max(LIMITS.productName.max, `Le nom du produit : ${LIMITS.productName.max} caractères maximum.`),
  category: optionalText(LIMITS.category.max, 'Catégorie'),
  features: optionalText(LIMITS.features.max, 'Caractéristiques'),
  condition: z.enum(CONDITIONS, { error: 'État du produit invalide.' }).default('non-precise'),
  audience: optionalText(LIMITS.audience.max, 'Public cible'),
  platform: z.enum(PLATFORMS, { error: 'Plateforme invalide.' }).default('ecommerce'),
  tone: z.enum(TONES, { error: 'Ton invalide.' }).default('neutre'),
  keywords: optionalText(LIMITS.keywords.max, 'Mots-clés').refine(
    (value) => parseKeywords(value).length <= LIMITS.keywords.maxCount,
    `${LIMITS.keywords.maxCount} mots-clés maximum.`,
  ),
});

export const generateRequestSchema = z.object({
  input: productInputSchema,
  variant: z.number().int().min(0).max(50).default(0),
});

export type FieldErrors = Partial<Record<keyof ProductInput, string>>;

export type ValidationResult =
  | { success: true; data: ProductInput }
  | { success: false; errors: FieldErrors };

export function validateProductInput(raw: unknown): ValidationResult {
  const parsed = productInputSchema.safeParse(raw);
  if (parsed.success) return { success: true, data: parsed.data };

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof ProductInput | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}

/** Découpe une saisie « mot1, mot2 ; mot3 » en liste dédoublonnée. */
export function parseKeywords(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of value.split(/[,;\n]/)) {
    const keyword = part.trim().replace(/\s+/g, ' ');
    const key = keyword.toLowerCase();
    if (keyword && !seen.has(key)) {
      seen.add(key);
      result.push(keyword);
    }
  }
  return result;
}

export const EMPTY_INPUT: ProductInput = {
  productName: '',
  category: '',
  features: '',
  condition: 'non-precise',
  audience: '',
  platform: 'ecommerce',
  tone: 'neutre',
  keywords: '',
};
