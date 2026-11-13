import { Check, ClipboardCopy, PenLine, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '../ui';

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: PenLine,
    title: 'Décrivez votre produit',
    text: 'Nom, caractéristiques, dimensions, état… Seul le nom est obligatoire, mais chaque détail compte.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Choisissez le contexte',
    text: 'Boutique en ligne, marketplace ou annonce entre particuliers, et le ton qui vous ressemble.',
  },
  {
    icon: ClipboardCopy,
    title: 'Relisez et copiez',
    text: 'Copiez chaque bloc séparément, générez une autre version si besoin et complétez les informations signalées.',
  },
];

const COMMITMENTS = [
  'Aucune caractéristique inventée (marque, matière, taille, garantie…)',
  'L’état réel du produit est respecté',
  'Pas de fausse urgence ni de superlatifs creux',
  'Les informations manquantes vous sont signalées',
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" aria-labelledby="comment-titre" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="comment-titre" eyebrow="Méthode" title="Comment ça marche" intro="Trois étapes, et vous gardez la main sur chaque mot." />
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <span aria-hidden="true" className="absolute top-6 right-[16%] left-[16%] hidden border-t border-dashed border-ink-300 md:block" />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="reveal relative">
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-paper shadow-card">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-vermilion-500 font-mono text-[10px] font-semibold text-white ring-2 ring-paper">
                    {i + 1}
                  </span>
                </span>
                <h3 className="font-serif text-[21px] font-medium tracking-tight text-ink-950 md:mt-4">{title}</h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{text}</p>
            </li>
          ))}
        </ol>

        <div className="reveal relative mt-16 overflow-hidden rounded-3xl bg-ink-900 p-8 text-paper sm:p-10">
          <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-vermilion-300 uppercase">Charte éditoriale</p>
              <h3 className="mt-3 font-serif text-3xl font-medium tracking-tight">
                Nos engagements <span className="italic text-vermilion-300">de rédaction</span>
              </h3>
              <p className="mt-3 text-[15px] text-ink-300">Chaque fiche passe par un contrôle automatique avant de vous être présentée.</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {COMMITMENTS.map((c) => (
                <li key={c} className="flex gap-3 rounded-2xl bg-white/[0.06] p-4 text-[15px] leading-snug ring-1 ring-white/10">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vermilion-500">
                    <Check aria-hidden="true" className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
