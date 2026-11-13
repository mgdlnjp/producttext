import type { ProductInput } from '../shared/types';
import { EMPTY_INPUT } from '../shared/validation';

export const makeInput = (overrides: Partial<ProductInput> = {}): ProductInput => ({
  ...EMPTY_INPUT,
  productName: 'Lampe de bureau articulée',
  ...overrides,
});

export const FULL_INPUT: ProductInput = {
  productName: 'Lampe de bureau articulée',
  category: 'Luminaire',
  features: 'Métal laqué noir\nBras articulé sur deux axes\nHauteur 45 cm',
  condition: 'bon-etat',
  audience: 'Étudiants et télétravailleurs',
  platform: 'particuliers',
  tone: 'chaleureux',
  keywords: 'lampe de bureau, lampe articulée',
};
