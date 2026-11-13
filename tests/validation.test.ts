import { describe, expect, it } from 'vitest';
import { LIMITS, parseKeywords, validateProductInput } from '../shared/validation';
import { FULL_INPUT, makeInput } from './fixtures';

describe('validateProductInput', () => {
  it('accepte une saisie complète', () => {
    const result = validateProductInput(FULL_INPUT);
    expect(result.success).toBe(true);
  });

  it('exige le nom du produit', () => {
    const result = validateProductInput(makeInput({ productName: '   ' }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.productName).toMatch(/requis/);
  });

  it('refuse un nom absent du corps de requête', () => {
    const result = validateProductInput({ category: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.productName).toBeDefined();
  });

  it('refuse un nom trop court', () => {
    const result = validateProductInput(makeInput({ productName: 'a' }));
    expect(result.success).toBe(false);
  });

  it('applique les limites de longueur', () => {
    const result = validateProductInput(makeInput({ features: 'x'.repeat(LIMITS.features.max + 1) }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.features).toMatch(/maximum/);
  });

  it('refuse un état, une plateforme ou un ton inconnu', () => {
    for (const field of ['condition', 'platform', 'tone'] as const) {
      const result = validateProductInput({ ...makeInput(), [field]: 'inconnu' });
      expect(result.success, field).toBe(false);
    }
  });

  it('limite le nombre de mots-clés', () => {
    const keywords = Array.from({ length: LIMITS.keywords.maxCount + 1 }, (_, i) => `mot${i}`).join(', ');
    const result = validateProductInput(makeInput({ keywords }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.keywords).toBeDefined();
  });

  it('nettoie les espaces et applique les valeurs par défaut', () => {
    const result = validateProductInput({ productName: '  Vélo  ' });
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({ productName: 'Vélo', condition: 'non-precise', platform: 'ecommerce', tone: 'neutre' }),
    });
  });
});

describe('parseKeywords', () => {
  it('découpe et dédoublonne sans tenir compte de la casse', () => {
    expect(parseKeywords('Lampe, lampe ; bureau\n  déco  salon ,')).toEqual(['Lampe', 'bureau', 'déco salon']);
  });
});
