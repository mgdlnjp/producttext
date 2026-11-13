import { CONDITION_LABELS, type Listing, type ProductInput } from './types';
import { parseKeywords } from './validation';

/**
 * Générateur de démonstration, sans IA.
 * Il assemble uniquement les informations saisies dans des gabarits fixes :
 * il ne peut donc rien inventer, mais le style reste volontairement simple.
 */

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const lowerFirst = (value: string) => (value ? value.charAt(0).toLowerCase() + value.slice(1) : value);
const stripEndPunctuation = (value: string) => value.replace(/[.;:!?,\s]+$/, '');

/** Découpe les caractéristiques saisies en éléments factuels. */
export function splitFeatures(features: string): string[] {
  let parts = features
    .split(/\n|;|•/)
    .map((p) => stripEndPunctuation(p.replace(/^\s*[-*–]\s*/, '').trim()))
    .filter(Boolean);

  if (parts.length === 1 && parts[0].includes(',')) {
    parts = parts[0]
      .split(',')
      .map((p) => stripEndPunctuation(p.trim()))
      .filter(Boolean);
  }
  return parts;
}

function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return items;
  const shift = by % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function buildTitle(input: ProductInput): string {
  const parts = [capitalize(input.productName.trim())];
  if (input.category.trim()) parts.push(capitalize(input.category.trim()));
  if (input.condition !== 'non-precise' && (input.condition !== 'neuf' || input.platform !== 'ecommerce')) {
    parts.push(CONDITION_LABELS[input.condition]);
  }
  const title = parts.join(' – ');
  return title.length > 80 ? `${title.slice(0, 79).trimEnd()}…` : title;
}

function buildHook(input: ProductInput, features: string[], variant: number): string {
  const name = input.productName.trim();
  const Name = capitalize(name);
  const first = features[0] ? lowerFirst(features[0]) : '';
  const audience = input.audience.trim();

  const templates: Record<ProductInput['tone'], string[]> = {
    neutre: [
      `${Name}${first ? ` : ${first}` : ''}.`,
      `${Name}${audience ? `, pour ${audience}` : ''} : les informations essentielles ci-dessous.`,
    ],
    premium: [
      `${Name}, présenté avec soin${first ? ` : ${first}` : ''}.`,
      `${Name} : l’essentiel, décrit avec précision${audience ? ` pour ${audience}` : ''}.`,
    ],
    chaleureux: [
      `Voici ${name}${audience ? `, pour ${audience}` : ''} : tout ce qu’il faut savoir avant de vous décider.`,
      `Prenez le temps de découvrir ${name}${first ? ` : ${first}` : ''}.`,
    ],
    dynamique: [
      `${Name} : ${first || 'les infos clés en un coup d’œil'}.`,
      `${Name} en bref : l’essentiel pour vous décider.`,
    ],
  };

  const options = templates[input.tone];
  return options[variant % options.length];
}

function buildDescription(input: ProductInput, features: string[], keywords: string[]): string {
  const name = input.productName.trim();
  const category = input.category.trim();
  const audience = input.audience.trim();
  const paragraphs: string[] = [];

  const intro =
    input.platform === 'particuliers'
      ? `Mise en vente : ${name}${category ? ` (catégorie : ${category})` : ''}.`
      : `${capitalize(name)}${category ? `, dans la catégorie ${category}` : ''}.`;
  paragraphs.push(
    audience ? `${intro} Ce produit s’adresse à : ${audience}.` : intro,
  );

  paragraphs.push(
    features.length
      ? `Caractéristiques indiquées : ${features.join(' ; ')}.`
      : 'Les caractéristiques détaillées restent à compléter.',
  );

  const conditionText: Record<ProductInput['condition'], string> = {
    neuf: 'État : neuf.',
    'tres-bon-etat': 'État : très bon état.',
    'bon-etat': 'État : bon état.',
    'etat-correct': 'État : état correct.',
    'non-precise': 'L’état du produit est à préciser.',
  };
  let practical = conditionText[input.condition];
  if (input.platform === 'particuliers') {
    practical += ' N’hésitez pas à poser vos questions avant l’achat.';
  }
  paragraphs.push(practical);

  if (keywords.length) {
    paragraphs.push(`Cette annonce peut intéresser les personnes qui recherchent : ${keywords.join(', ')}.`);
  }

  return paragraphs.join('\n\n');
}

function buildHighlights(input: ProductInput, features: string[], variant: number): string[] {
  const highlights = rotate(features.map(capitalize), variant).slice(0, 5);
  const extras: string[] = [];
  if (input.condition !== 'non-precise') extras.push(`État : ${CONDITION_LABELS[input.condition].toLowerCase()}`);
  if (input.category.trim()) extras.push(`Catégorie : ${input.category.trim()}`);
  if (input.audience.trim()) extras.push(`Pour ${input.audience.trim()}`);

  for (const extra of extras) {
    if (highlights.length >= 3) break;
    highlights.push(extra);
  }
  while (highlights.length < 3) {
    highlights.push('À compléter : ajoutez une caractéristique distinctive');
  }
  return highlights;
}

export function buildMissingInfo(input: ProductInput, features: string[]): string[] {
  const missing: string[] = [];
  if (features.length === 0) missing.push('Caractéristiques principales');
  else if (!/\d/.test(input.features)) missing.push('Dimensions ou mesures');
  if (input.condition === 'non-precise') missing.push('État du produit');
  if (!input.category.trim()) missing.push('Catégorie');
  if (!input.audience.trim() && input.platform !== 'particuliers') missing.push('Public cible');
  if (input.platform === 'particuliers') {
    if (input.condition !== 'neuf') missing.push('Défauts éventuels, même mineurs');
    missing.push('Modalités de remise ou d’envoi');
  }
  return missing;
}

export function generateDemoListing(input: ProductInput, variant = 0): Listing {
  const features = splitFeatures(input.features);
  const keywords = parseKeywords(input.keywords);

  return {
    title: buildTitle(input),
    hook: buildHook(input, features, variant),
    description: buildDescription(input, features, keywords),
    highlights: buildHighlights(input, features, variant),
    keywords,
    missingInfo: buildMissingInfo(input, features),
  };
}
