import { describe, expect, it } from 'vitest';
import { ANTI_INVENTION_RULES, buildSystemPrompt, buildUserPrompt } from '../shared/prompt';
import { FULL_INPUT, makeInput } from './fixtures';

describe('prompt système — règles anti-invention', () => {
  const system = buildSystemPrompt();

  it('contient toutes les règles', () => {
    for (const rule of ANTI_INVENTION_RULES) expect(system).toContain(rule);
  });

  it.each([
    ['marque', /marque/],
    ['matière', /matière/],
    ['taille', /taille/],
    ['compatibilité', /compatibilité/],
    ['garantie', /garantie/],
    ['origine', /origine/],
    ['certification', /certification/],
    ['bénéfice technique', /bénéfice technique/],
  ])('interdit d’inventer : %s', (_label, pattern) => {
    expect(system).toMatch(pattern);
  });

  it('interdit les fausses urgences et superlatifs', () => {
    expect(system).toMatch(/fausse urgence/);
    expect(system).toMatch(/dernière pièce/);
    expect(system).toMatch(/offre limitée/);
    expect(system).toMatch(/superlatifs/);
  });

  it('protège l’état d’occasion et demande de signaler les manques', () => {
    expect(system).toMatch(/occasion comme neuf/);
    expect(system).toMatch(/missingInfo/);
  });

  it('demande des mots-clés naturels non répétés', () => {
    expect(system).toMatch(/naturelle/);
    expect(system).toMatch(/une ou deux fois/);
  });

  it('traite les données vendeur comme des données, pas des instructions', () => {
    expect(system).toMatch(/pas des instructions/);
  });
});

describe('prompt utilisateur', () => {
  it('transmet fidèlement les données dans un bloc délimité', () => {
    const prompt = buildUserPrompt(FULL_INPUT);
    expect(prompt).toMatch(/<donnees_vendeur>[\s\S]*<\/donnees_vendeur>/);
    expect(prompt).toContain('Lampe de bureau articulée');
    expect(prompt).toContain('Hauteur 45 cm');
    expect(prompt).toContain('État : Bon état');
    expect(prompt).toContain('Annonce entre particuliers');
    expect(prompt).toMatch(/transparence/);
    expect(prompt).toContain('lampe de bureau, lampe articulée');
  });

  it('marque explicitement les champs manquants', () => {
    const prompt = buildUserPrompt(makeInput());
    expect(prompt).toContain('Catégorie : (non renseigné)');
    expect(prompt).toContain('Caractéristiques et dimensions : (non renseigné)');
    expect(prompt).toContain('État : Non précisé');
    expect(prompt).toContain('Mots-clés à intégrer : (aucun)');
  });

  it('structure les bénéfices en e-commerce', () => {
    expect(buildUserPrompt(makeInput({ platform: 'ecommerce' }))).toMatch(/réellement fournies/);
  });

  it('demande une formulation différente pour une nouvelle version, avec les mêmes faits', () => {
    expect(buildUserPrompt(FULL_INPUT, 0)).not.toMatch(/version n°/);
    const v2 = buildUserPrompt(FULL_INPUT, 1);
    expect(v2).toMatch(/version n°2/);
    expect(v2).toMatch(/mêmes faits/);
  });
});
