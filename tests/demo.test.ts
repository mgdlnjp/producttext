import { describe, expect, it } from 'vitest';
import { auditListing, listingToText, normalizeText } from '../shared/audit';
import { generateDemoListing, splitFeatures } from '../shared/demo';
import { CONDITIONS, PLATFORMS, TONES } from '../shared/types';
import { FULL_INPUT, makeInput } from './fixtures';

describe('générateur de démonstration', () => {
  it('produit tous les blocs avec 3 à 5 points forts', () => {
    const listing = generateDemoListing(FULL_INPUT);
    expect(listing.title).toContain('Lampe de bureau articulée');
    expect(listing.hook.length).toBeGreaterThan(0);
    expect(listing.description.length).toBeGreaterThan(0);
    expect(listing.highlights.length).toBeGreaterThanOrEqual(3);
    expect(listing.highlights.length).toBeLessThanOrEqual(5);
    expect(listing.keywords).toEqual(['lampe de bureau', 'lampe articulée']);
  });

  it('reprend les caractéristiques fournies sans les modifier', () => {
    const text = listingToText(generateDemoListing(FULL_INPUT));
    for (const feature of splitFeatures(FULL_INPUT.features)) expect(text).toContain(feature);
  });

  it('ne déclenche aucune alerte anti-invention, quelle que soit la combinaison', () => {
    for (const condition of CONDITIONS)
      for (const platform of PLATFORMS)
        for (const tone of TONES)
          for (const input of [makeInput({ condition, platform, tone }), { ...FULL_INPUT, condition, platform, tone }]) {
            for (const variant of [0, 1, 2]) {
              const warnings = auditListing(input, generateDemoListing(input, variant));
              expect(warnings, `${condition}/${platform}/${tone}/v${variant}`).toEqual([]);
            }
          }
  });

  it('ne qualifie jamais un produit d’occasion de neuf', () => {
    const text = normalizeText(listingToText(generateDemoListing({ ...FULL_INPUT, condition: 'etat-correct' })));
    expect(text).not.toMatch(/\bneu(f|ve)\b/);
    expect(text).toContain('etat correct');
  });

  it('signale les informations manquantes au lieu de les inventer', () => {
    const listing = generateDemoListing(makeInput());
    expect(listing.missingInfo).toEqual(
      expect.arrayContaining(['Caractéristiques principales', 'État du produit', 'Catégorie']),
    );
    expect(listing.description).toMatch(/à compléter/);
    expect(listing.highlights.some((h) => h.startsWith('À compléter'))).toBe(true);
  });

  it('privilégie les informations pratiques pour les particuliers', () => {
    const listing = generateDemoListing(FULL_INPUT);
    expect(listing.missingInfo).toContain('Défauts éventuels, même mineurs');
    expect(listing.description).toMatch(/questions/);
  });

  it('propose une formulation différente pour une autre version', () => {
    const v1 = generateDemoListing(FULL_INPUT, 0);
    const v2 = generateDemoListing(FULL_INPUT, 1);
    expect(v2.hook).not.toEqual(v1.hook);
    expect(v2.highlights).not.toEqual(v1.highlights);
  });

  it('n’emploie chaque mot-clé qu’une fois dans la description', () => {
    const description = generateDemoListing(FULL_INPUT).description;
    expect(description.split('lampe articulée').length - 1).toBe(1);
  });
});

describe('splitFeatures', () => {
  it('gère lignes, points-virgules, puces et virgules', () => {
    expect(splitFeatures('- Coton\n• Taille M; Bleu.')).toEqual(['Coton', 'Taille M', 'Bleu']);
    expect(splitFeatures('Coton, taille M, bleu')).toEqual(['Coton', 'taille M', 'bleu']);
  });
});
