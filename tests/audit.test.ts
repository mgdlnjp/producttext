import { describe, expect, it } from 'vitest';
import { auditListing, sanitizeListing } from '../shared/audit';
import type { Listing } from '../shared/types';
import { makeInput } from './fixtures';

const base: Listing = {
  title: 'Lampe de bureau articulée',
  hook: 'Une lampe pour votre bureau.',
  description: 'Lampe de bureau articulée en bon état.',
  highlights: ['Bras articulé', 'Bon état', 'Pour le bureau'],
  keywords: [],
  missingInfo: [],
};

const withText = (description: string): Listing => ({ ...base, description });

describe('auditListing', () => {
  it('ne signale rien sur une fiche factuelle', () => {
    expect(auditListing(makeInput({ condition: 'bon-etat' }), base)).toEqual([]);
  });

  it('détecte une fausse urgence', () => {
    const warnings = auditListing(makeInput(), withText('Dernière pièce disponible, offre limitée !'));
    expect(warnings.join(' ')).toMatch(/urgence/);
  });

  it('détecte les superlatifs creux', () => {
    expect(auditListing(makeInput(), withText('La meilleure lampe, qualité exceptionnelle.')).join(' ')).toMatch(/Superlatif/);
  });

  it('détecte une garantie ou une origine non fournies', () => {
    const warnings = auditListing(makeInput(), withText('Garantie 2 ans. Fabriqué en France.'));
    expect(warnings.some((w) => w.includes('garantie'))).toBe(true);
    expect(warnings.some((w) => w.includes('origine'))).toBe(true);
  });

  it('accepte une allégation présente dans la saisie', () => {
    const input = makeInput({ features: 'Garantie constructeur 2 ans' });
    expect(auditListing(input, withText('Garantie constructeur 2 ans.'))).toEqual([]);
  });

  it('signale un produit d’occasion présenté comme neuf', () => {
    const warnings = auditListing(makeInput({ condition: 'bon-etat' }), withText('Comme neuf, jamais utilisé.'));
    expect(warnings.join(' ')).toMatch(/neuf/);
  });

  it('accepte « neuf » quand le produit est neuf', () => {
    expect(auditListing(makeInput({ condition: 'neuf' }), withText('Produit neuf.'))).toEqual([]);
  });

  it('détecte le bourrage de mots-clés', () => {
    const listing = withText('lampe vintage, lampe vintage, lampe vintage, lampe vintage.');
    const warnings = auditListing(makeInput({ keywords: 'lampe vintage' }), listing);
    expect(warnings.join(' ')).toMatch(/apparaît 4 fois/);
  });
});

describe('sanitizeListing', () => {
  it('borne les points forts à 5, retire puces et doublons', () => {
    const listing = sanitizeListing({
      ...base,
      highlights: ['- A', '• B', 'b', 'C', 'D', 'E', 'F', '  '],
    });
    expect(listing.highlights).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});
