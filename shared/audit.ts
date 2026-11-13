import type { Listing, ProductInput } from './types';
import { parseKeywords } from './validation';

/**
 * Vérifications automatiques après génération (IA ou démo).
 * Elles ne remplacent pas une relecture humaine mais signalent les
 * formulations à risque : fausse urgence, superlatifs, allégations
 * absentes de la saisie, occasion présentée comme neuve, bourrage de mots-clés.
 */

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const URGENCY_PATTERNS: RegExp[] = [
  /derniere piece/,
  /dernier exemplaire/,
  /offre limitee/,
  /stock limite/,
  /quantites? limitees?/,
  /ne tardez pas/,
  /depechez/,
  /plus que \d+/,
  /avant qu.il ne soit trop tard/,
  /\bvite\b/,
  /temps limite/,
];

const SUPERLATIVE_PATTERNS: RegExp[] = [
  /\ble meilleur\b/,
  /\bla meilleure\b/,
  /\bincroyable/,
  /\brevolutionnaire/,
  /\bexceptionnel/,
  /\bparfait/,
  /\b100\s?%/,
  /\bunique au monde/,
];

/** Allégations qui ne doivent apparaître que si le vendeur les a fournies. */
const CLAIM_TERMS: { pattern: RegExp; label: string }[] = [
  { pattern: /garanti/, label: 'garantie' },
  { pattern: /certifi/, label: 'certification' },
  { pattern: /\bmade in\b|fabrique en|fabriquee en|origine/, label: 'origine' },
  { pattern: /\blabel/, label: 'label' },
  { pattern: /\bbio\b|biologique/, label: 'mention bio' },
  { pattern: /ecologique|eco-responsable|ecoresponsable|durable/, label: 'argument écologique' },
  { pattern: /hypoallergenique/, label: 'hypoallergénique' },
  { pattern: /impermeable|waterproof/, label: 'imperméabilité' },
  { pattern: /compatible/, label: 'compatibilité' },
  { pattern: /fait main|artisanal/, label: 'fabrication artisanale' },
];

const NEW_CLAIM_PATTERNS: RegExp[] = [/\bneuf\b/, /\bneuve\b/, /\bneufs\b/, /\bneuves\b/, /jamais (utilise|servi|porte|ouvert)/, /etat neuf/];

export function listingToText(listing: Listing): string {
  return [listing.title, listing.hook, listing.description, ...listing.highlights].join('\n');
}

function inputToText(input: ProductInput): string {
  return normalizeText(
    [input.productName, input.category, input.features, input.audience, input.keywords].join('\n'),
  );
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

export function auditListing(input: ProductInput, listing: Listing): string[] {
  const warnings: string[] = [];
  const output = normalizeText(listingToText(listing));
  const source = inputToText(input);

  if (URGENCY_PATTERNS.some((p) => p.test(output) && !p.test(source))) {
    warnings.push('Formulation d’urgence détectée (ex. « offre limitée »). Supprimez-la si elle ne correspond pas à la réalité.');
  }

  if (SUPERLATIVE_PATTERNS.some((p) => p.test(output) && !p.test(source))) {
    warnings.push('Superlatif détecté (ex. « le meilleur », « parfait »). Préférez un fait vérifiable.');
  }

  for (const claim of CLAIM_TERMS) {
    if (claim.pattern.test(output) && !claim.pattern.test(source)) {
      warnings.push(`Mention de ${claim.label} absente de votre saisie : vérifiez-la ou supprimez-la.`);
    }
  }

  if (input.condition !== 'neuf' && NEW_CLAIM_PATTERNS.some((p) => p.test(output) && !p.test(source))) {
    warnings.push('Le texte suggère un produit neuf alors que l’état indiqué est différent : corrigez-le.');
  }

  const productName = normalizeText(input.productName.trim());
  const nameMentions = countOccurrences(output, productName);
  for (const keyword of parseKeywords(input.keywords)) {
    const needle = normalizeText(keyword);
    // Les mentions du nom du produit ne comptent pas comme du bourrage.
    const fromName = productName.includes(needle) ? nameMentions * countOccurrences(productName, needle) : 0;
    const occurrences = countOccurrences(output, needle) - fromName;
    if (occurrences > 3) {
      warnings.push(`Le mot-clé « ${keyword} » apparaît ${occurrences} fois : allégez pour garder un texte naturel.`);
    }
  }

  return warnings;
}

/** Nettoie et borne une fiche (longueurs, 3 à 5 points forts, doublons). */
export function sanitizeListing(listing: Listing): Listing {
  const clean = (value: string) => value.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  const uniq = (values: string[]) => {
    const seen = new Set<string>();
    return values
      .map(clean)
      .filter((v) => v.length > 0)
      .filter((v) => {
        const key = v.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  return {
    title: clean(listing.title).slice(0, 120),
    hook: clean(listing.hook).slice(0, 240),
    description: clean(listing.description).replace(/\n{3,}/g, '\n\n').slice(0, 3000),
    highlights: uniq(listing.highlights.map((h) => h.replace(/^[-•*]\s*/, ''))).slice(0, 5),
    keywords: uniq(listing.keywords).slice(0, 10),
    missingInfo: uniq(listing.missingInfo).slice(0, 8),
  };
}
