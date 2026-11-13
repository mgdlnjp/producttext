import { useMemo } from 'react';
import { ArrowRight, CircleAlert, Copy, ShieldCheck, Sparkles, UserX } from 'lucide-react';
import { generateDemoListing, splitFeatures } from '../../../shared/demo';
import { CONDITION_LABELS } from '../../../shared/types';
import { btn } from '../../lib/cn';
import { EXAMPLE_INPUT } from '../../lib/example';

const TRUST = [
  { icon: UserX, label: 'Sans compte' },
  { icon: ShieldCheck, label: 'Rien n’est inventé' },
  { icon: Copy, label: 'Chaque bloc se copie' },
];

/** Avant / après : les notes de l'exemple, et la fiche réellement produite par le mode démonstration. */
function BeforeAfter() {
  const listing = useMemo(() => generateDemoListing(EXAMPLE_INPUT, 0), []);
  const notes = splitFeatures(EXAMPLE_INPUT.features);
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Notes brutes */}
      <div className="ruled relative rotate-[-2.5deg] rounded-2xl bg-[#fffdf8] p-5 pt-4 shadow-card ring-1 ring-ink-200/80 sm:w-[78%]">
        <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink-400 uppercase">Vos notes</p>
        <p className="mt-2 font-medium text-ink-900">{EXAMPLE_INPUT.productName}</p>
        <ul className="mt-1 space-y-[5px] font-mono text-[12.5px] leading-[23px] text-ink-600">
          {notes.map((n) => (
            <li key={n}>– {n}</li>
          ))}
          <li>– {CONDITION_LABELS[EXAMPLE_INPUT.condition].toLowerCase()}</li>
        </ul>
      </div>

      {/* Fiche produite */}
      <div className="relative -mt-10 ml-auto rounded-2xl bg-white p-5 shadow-lift ring-1 ring-ink-200/80 sm:-mt-24 sm:w-[82%]">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium tracking-[0.14em] text-vermilion-600 uppercase">
            <Sparkles aria-hidden="true" className="h-3 w-3" /> Votre fiche
          </p>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium text-amber-900 ring-1 ring-amber-200">Exemple · mode démo</span>
        </div>
        <p className="mt-3 font-serif text-[19px] leading-snug font-medium text-ink-950">{listing.title}</p>
        <ul className="mt-3 space-y-1.5 text-[13px] text-ink-700">
          {listing.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex gap-2">
              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-vermilion-500" />
              {h}
            </li>
          ))}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {listing.keywords.map((k) => (
            <li key={k} className="marker text-[12.5px] text-ink-900">
              {k}
            </li>
          ))}
        </ul>
        {listing.missingInfo.length > 0 && (
          <p className="mt-4 flex items-start gap-2 border-t border-dashed border-ink-200 pt-3 text-[12.5px] text-ink-600">
            <CircleAlert aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vermilion-500" />
            <span>
              <span className="font-medium text-ink-800">À compléter :</span> {listing.missingInfo.join(' · ').toLowerCase()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-titre" className="relative overflow-hidden">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,#000_10%,transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-vermilion-200/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div>
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3 pl-1 text-[13px] text-ink-700 shadow-sm ring-1 ring-ink-200">
            <span className="rounded-full bg-ink-900 px-2 py-0.5 font-mono text-[10.5px] font-medium tracking-wide text-paper uppercase">Gratuit</span>
            Pour petites boutiques et particuliers
          </p>
          <h1
            id="hero-titre"
            className="animate-fade-up mt-7 font-serif text-[2.55rem] leading-[1.03] font-medium tracking-[-0.025em] text-balance text-ink-950 [animation-delay:80ms] sm:text-6xl lg:text-[4.2rem]"
          >
            Transformez les caractéristiques de votre produit en une annonce{' '}
            <span className="relative italic text-vermilion-600 sm:whitespace-nowrap">
              claire et convaincante.
              <svg aria-hidden="true" viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 hidden h-3 w-full text-vermilion-400/70 sm:block">
                <path d="M2 9c48-6 98-8 148-6s100 3 148-2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-pretty text-ink-600 [animation-delay:160ms]">
            Indiquez ce que vous savez de votre produit. ProductText rédige un titre, une accroche, une description et des points forts — en
            s’appuyant uniquement sur vos informations, sans rien inventer.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <a href="#creer" className={btn('primary', 'lg', 'group/cta font-semibold')}>
              Rédiger ma fiche produit
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
            </a>
            <a href="#comment-ca-marche" className={btn('outline', 'lg')}>
              Voir comment ça marche
            </a>
          </div>
          <ul className="animate-fade-up mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-600 [animation-delay:320ms]">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon aria-hidden="true" className="h-4 w-4 text-ink-400" /> {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-fade-up [animation-delay:300ms]">
          <BeforeAfter />
        </div>
      </div>
    </section>
  );
}
