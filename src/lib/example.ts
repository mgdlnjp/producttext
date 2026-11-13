import type { ProductInput } from '../../shared/types';

/** Exemple utilisé par « Remplir avec un exemple » et par l'aperçu du héros. */
export const EXAMPLE_INPUT: ProductInput = {
  productName: 'Lampe de bureau articulée',
  category: 'Luminaire',
  features: 'Métal laqué noir\nBras articulé sur deux axes\nHauteur 45 cm, pied de 15 cm de diamètre\nCulot E27, ampoule non fournie',
  condition: 'tres-bon-etat',
  audience: 'Étudiants et télétravailleurs',
  platform: 'particuliers',
  tone: 'chaleureux',
  keywords: 'lampe de bureau, lampe articulée',
};
