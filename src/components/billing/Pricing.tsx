import { ArrowRight, Check } from 'lucide-react';
import { formatAmount, formatPrice, type BillingConfig } from '../../../shared/billing';
import { btn } from '../../lib/cn';
import { SectionHeading } from '../ui';
import { PRO_FEATURES } from './features';

/** Section tarifs : affichée uniquement si l'abonnement Stripe est configuré. */
export function Pricing({ config }: { config: BillingConfig | null }) {
  if (!config?.enabled || !config.price) return null;
  const price = config.price;
  const free = [
    'Essai gratuit, sans inscription',
    'Toutes les plateformes et tous les tons',
    'Sans compte, sans carte bancaire',
  ];

  return (
    <section id="tarifs" aria-labelledby="tarifs-titre" className="scroll-mt-16 border-t border-ink-200/70 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="tarifs-titre"
          eyebrow="Tarifs"
          title={
            <>
              Gratuit pour essayer, <em className="text-vermilion-600">illimité</em> pour vendre.
            </>
          }
          intro="Pas de compte à créer : l’abonnement est activé sur votre navigateur juste après le paiement."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <article className="rounded-[28px] bg-white p-7 shadow-card ring-1 ring-ink-200/80">
            <h3 className="font-serif text-2xl font-medium text-ink-950">Gratuit</h3>
            <p className="mt-4 font-serif text-[2.6rem] leading-none font-medium text-ink-950">0 €</p>
            <ul className="mt-6 space-y-2.5">
              {free.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[15px] text-ink-700">
                  <Check aria-hidden="true" className="h-4 w-4 text-ink-500" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#creer" className={btn('outline', 'lg', 'mt-8 w-full')}>
              Créer ma fiche gratuitement
            </a>
          </article>

          <article className="relative overflow-hidden rounded-[28px] bg-ink-900 p-7 text-paper shadow-lift">
            <span className="absolute top-7 right-7 rounded-full bg-vermilion-500 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
              Pro
            </span>
            <h3 className="font-serif text-2xl font-medium">Illimité</h3>
            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="font-serif text-[2.6rem] leading-none font-medium">{formatAmount(price)}</span>
              <span className="text-paper/60">/ {formatPrice(price).split(' / ')[1]}</span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[15px] text-paper/85">
                  <Check aria-hidden="true" className="h-4 w-4 text-vermilion-300" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#creer" className={btn('primary', 'lg', 'group/cta mt-8 w-full')}>
              Essayer puis passer à Pro
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
            </a>
            <p className="mt-3 text-center text-[12px] text-paper/50">Paiement sécurisé par Stripe</p>
          </article>
        </div>
      </div>
    </section>
  );
}
