import { ArrowRight } from 'lucide-react';
import { btn } from '../../lib/cn';

export function FinalCta() {
  return (
    <section aria-labelledby="cta-titre" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-vermilion-500 px-6 py-16 text-center text-white sm:py-20">
        <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-vermilion-300/50 blur-3xl" />
        <div className="relative">
          <h2 id="cta-titre" className="mx-auto max-w-2xl font-serif text-[2.1rem] leading-[1.08] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
            Prêt à rédiger votre <span className="italic">prochaine fiche</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] text-vermilion-50">Quelques informations suffisent. Vous gardez la main sur chaque mot.</p>
          <a href="#creer" className={btn('ink', 'lg', 'group/cta mt-9 font-semibold')}>
            Créer ma fiche gratuitement
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
