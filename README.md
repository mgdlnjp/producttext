# ProductText

> Transformez les caractéristiques de votre produit en une annonce claire et convaincante.

Micro-SaaS pour petites boutiques, vendeurs indépendants et particuliers : à partir des informations saisies, ProductText rédige un **titre**, une **accroche**, une **description détaillée**, **3 à 5 points forts** et les **mots-clés** intégrés. Chaque bloc se copie séparément. Pas de compte, pas de base de données.

## Démarrage rapide

```bash
npm install
cp .env.example .env      # facultatif : ajoutez ANTHROPIC_API_KEY pour la génération IA
npm run dev               # front http://localhost:5173 + API http://localhost:8787
```

Sans clé API, l'application tourne en **mode démonstration** (affiché dans l'interface) : la fiche est assemblée à partir de gabarits et des seules informations saisies.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Vite + API Express en rechargement à chaud |
| `npm run lint` | ESLint |
| `npm test` | Tests Vitest (validation, règles anti-invention, démo, audit, API) |
| `npm run build` | Typecheck + build front (`dist/`) + bundle serveur (`dist-server/`) |
| `npm start` | Serveur de production (sert l'API et le front compilé) |

## Variables d'environnement (serveur uniquement)

| Variable | Défaut | Description |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | — | Clé API Anthropic. Absente → mode démo. |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Modèle Claude utilisé. |
| `ANTHROPIC_EFFORT` | `low` | `low`, `medium` ou `high` (qualité vs coût/latence). |
| `PORT` | `8787` | Port HTTP. |

⚠️ Ne préfixez jamais ces variables par `VITE_` : elles seraient incluses dans le bundle navigateur. La clé n'est lue que par `server/`.

## Architecture

```
shared/            Code commun navigateur + serveur
  types.ts         Types et libellés (états, plateformes, tons)
  validation.ts    Schéma Zod de la saisie, limites de taille, parsing des mots-clés
  prompt.ts        Prompt système (règles anti-invention) + prompt utilisateur
  demo.ts          Générateur démo déterministe (n'utilise que la saisie)
  audit.ts         Contrôles post-génération + nettoyage de la fiche
server/
  generation.ts    Service IA (SDK Anthropic, sortie structurée Zod, gestion d'erreurs)
  app.ts           Express : /api/health, /api/generate, fichiers statiques
  rateLimit.ts     Limiteur de débit en mémoire (12 req/min/IP)
  index.ts         Point d'entrée (lecture des variables d'environnement)
src/
  components/form/     ProductForm, TextField (compteur), OptionGroup
  components/result/   ResultPanel (vide/chargement/erreur/succès), ResultCard, CopyButton, ModeBadge
  components/landing/  Header, Hero, UseCases, HowItWorks, Faq, FinalCta, Footer
  pages/               HomePage, LegalPage (mentions légales, confidentialité)
  hooks/ services/     État de génération, appels API avec timeout
tests/             Tests Vitest
```

### Garde-fous éditoriaux

1. **Prompt système** : interdiction d'inventer marque, matière, taille, compatibilité, garantie, origine, certification ou bénéfice technique ; pas de fausse urgence ni de superlatifs ; respect de l'état ; mots-clés naturels ; données vendeur traitées comme des données et non comme des instructions.
2. **Sortie structurée** : le modèle renvoie un JSON validé (`title`, `hook`, `description`, `highlights`, `keywords`, `missingInfo`).
3. **Audit automatique** (`shared/audit.ts`) : signale à l'utilisateur les formulations d'urgence, les superlatifs, les allégations absentes de la saisie (garantie, origine, bio…), un produit d'occasion présenté comme neuf et le bourrage de mots-clés.
4. **Informations à compléter** : les manques sont listés au lieu d'être supposés.

## Déploiement

Toute plateforme Node ≥ 20 (Render, Railway, Fly.io, VPS…) :

1. Build : `npm ci && npm run build`
2. Démarrage : `npm start`
3. Définir `ANTHROPIC_API_KEY` (et éventuellement `ANTHROPIC_MODEL`, `ANTHROPIC_EFFORT`) dans les variables d'environnement de l'hébergeur ; `PORT` est souvent fourni automatiquement.
4. Vérifier `GET /api/health` → `{"ok":true,"mode":"ai"}`.
5. Avant la commercialisation : compléter les mentions légales et la politique de confidentialité (`src/pages/LegalPage.tsx`), ajouter la balise canonique dans `index.html`, servir en HTTPS.

## Limites du MVP

- Limiteur de débit en mémoire : à remplacer par un store partagé (Redis) en multi-instance ; pas de quota par utilisateur ni de paiement.
- L'audit est heuristique (expressions régulières) : il réduit les risques sans remplacer une relecture humaine.
- Mode démo volontairement basique (gabarits fixes).
- Pas d'historique des fiches (aucun stockage), pas d'export, français uniquement.
- Le front embarque Zod pour la validation partagée (~100 Ko gzip au total) ; optimisable.

## Abonnement (Stripe)

ProductText peut proposer un forfait Pro payant, sur le modèle de Text2Action : quelques générations gratuites, puis abonnement via Stripe Checkout, sans compte utilisateur.

- **Gratuit :** `FREE_USES_PER_DAY` générations (3 par défaut) par IP sur 24 h glissantes, **vérifiées par le serveur**. Une génération en échec n'est pas décomptée.
- **Pro :** après paiement, `/#abonnement` appelle `POST /api/billing/activate`, qui vérifie la session chez Stripe et délivre un jeton HMAC de 7 jours. Le jeton est stocké dans `localStorage` et envoyé en `Authorization: Bearer`.
- **Renouvellement :** automatique via `/api/billing/refresh`, qui exige l'ancien jeton signé et revérifie l'abonnement chez Stripe.
- **Gestion et résiliation :** le bouton « Gérer l'abonnement » ouvre le portail client Stripe.
- **Sans Stripe configuré :** l'outil reste en accès libre.

**Mise en place**
1. Dans Stripe, créez un produit avec un prix récurrent, puis copiez son `price_…`.
2. Activez le portail client : Paramètres → Facturation → Portail client.
3. Renseignez `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `ACCESS_TOKEN_SECRET` (`openssl rand -base64 48`) et `APP_URL`.
4. Testez avec `sk_test_…` et la carte `4242 4242 4242 4242`.

**Limites :** l'accès Pro est lié au navigateur (pas de restauration par email) ; il reste actif jusqu'à 7 jours après une résiliation ; le quota par IP est en mémoire (une seule instance, IP partagées).
