import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, FileWarning } from 'lucide-react';
import { Eyebrow } from '../components/ui';
import { btn } from '../lib/cn';

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="relative overflow-hidden border-b border-ink-200/70 bg-white">
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_80%_0%,#000_10%,transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20">
          <a href="#/" className="inline-flex items-center gap-1.5 text-[13px] text-ink-500 transition-colors hover:text-ink-950">
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Retour à l’accueil
          </a>
          <div className="mt-8">
            <Eyebrow>Informations légales</Eyebrow>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-ink-950 sm:text-5xl">{title}</h1>
        </div>
      </div>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-300/50">
          <FileWarning aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>Modèle à compléter et à faire valider avant toute commercialisation. Les éléments entre crochets sont à remplacer.</span>
        </p>
        <div className="mt-4 text-[16px] leading-relaxed text-ink-700 [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-ink-200/70 [&_h2]:pt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-ink-950 [&_p]:mt-3">
          {children}
        </div>
        <div className="mt-16 flex flex-col gap-4 rounded-2xl bg-ink-900 p-6 text-paper sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px]">
            Rédigez votre prochaine fiche en quelques minutes. <span className="text-ink-300">Sans compte.</span>
          </p>
          <a href="#creer" className={btn('primary', 'md', 'shrink-0')}>
            Créer ma fiche <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </article>
    </>
  );
}

export function LegalNotice() {
  return (
    <LegalLayout title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          [Nom ou raison sociale] — [forme juridique, capital] — [adresse] — [SIREN/RCS] — [e-mail de contact].
          Directeur ou directrice de la publication : [nom].
        </p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>[Nom de l’hébergeur] — [adresse] — [téléphone].</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes générés à partir de vos informations vous appartiennent. Vous restez responsable de leur vérification
          et de leur publication.
        </p>
      </section>
      <section>
        <h2>Responsabilité</h2>
        <p>
          ProductText est une aide à la rédaction. Les textes proposés doivent être relus ; aucun résultat commercial n’est
          garanti.
        </p>
      </section>
    </LegalLayout>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <section>
        <h2>Données traitées</h2>
        <p>
          Les informations saisies dans le formulaire (description du produit) sont utilisées uniquement pour générer la
          fiche demandée. ProductText ne propose pas de compte et n’enregistre pas les fiches dans une base de données.
        </p>
      </section>
      <section>
        <h2>Sous-traitant IA</h2>
        <p>
          En mode IA, votre saisie est transmise à [fournisseur d’IA, ex. Anthropic] pour produire le texte, selon ses
          conditions de traitement des données. N’indiquez pas de données personnelles dans le formulaire.
        </p>
      </section>
      <section>
        <h2>Journaux techniques</h2>
        <p>
          Le serveur peut conserver temporairement l’adresse IP pour limiter les abus (limitation du nombre de requêtes).
          [Préciser la durée de conservation et l’hébergeur.]
        </p>
      </section>
      <section>
        <h2>Abonnement et paiement</h2>
        <p>
          L’abonnement Pro est souscrit sur une page de paiement hébergée par Stripe, qui traite votre adresse e-mail et vos
          informations de paiement en tant que prestataire de paiement. ProductText ne reçoit ni ne conserve vos
          coordonnées bancaires.
        </p>
        <p>
          Après le paiement, un jeton d’accès est enregistré dans le stockage local de votre navigateur. Il ne contient que
          des identifiants techniques d’abonnement Stripe, signés par notre serveur, et sert à vérifier que l’abonnement
          est actif.
        </p>
        <p>
          Pour appliquer la limite de générations gratuites, l’adresse IP est conservée en mémoire avec l’heure de chaque
          génération pendant 24 heures au maximum, sans lien avec le contenu saisi. [Préciser la base légale de la
          facturation, la durée de conservation des factures et la politique de remboursement.]
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          ProductText n’utilise pas de cookie de suivi ni d’outil de mesure d’audience. La page de paiement Stripe, hébergée
          sur le domaine de Stripe, applique sa propre politique de cookies. [À mettre à jour si besoin.]
        </p>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD, vous pouvez exercer vos droits d’accès, de rectification et d’effacement en écrivant à
          [e-mail de contact]. Vous pouvez également saisir la CNIL.
        </p>
      </section>
    </LegalLayout>
  );
}
