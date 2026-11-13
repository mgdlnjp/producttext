import { PaywallModal } from '../components/billing/PaywallModal';
import { PlanBadge } from '../components/billing/PlanBadge';
import { Pricing } from '../components/billing/Pricing';
import { Faq } from '../components/landing/Faq';
import { FinalCta } from '../components/landing/FinalCta';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { UseCases } from '../components/landing/UseCases';
import { ProductForm } from '../components/form/ProductForm';
import { ModeBadge } from '../components/result/ModeBadge';
import { ResultPanel } from '../components/result/ResultPanel';
import { Eyebrow } from '../components/ui';
import { useBilling } from '../hooks/useBilling';
import { useListingGenerator } from '../hooks/useListingGenerator';

export function HomePage() {
  const billing = useBilling();
  const { status, result, error, fieldErrors, serverMode, variant, access, quotaExceeded, generate, regenerate, retry, clearFieldError } =
    useListingGenerator({ onQuotaExceeded: billing.openPaywall });
  // Les droits renvoyés par la dernière génération priment sur ceux lus au chargement.
  const currentAccess = access ?? billing.access;

  return (
    <>
      <Hero />
      <UseCases />

      <section id="creer" aria-labelledby="creer-titre" className="relative scroll-mt-16 py-20 sm:py-24">
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Atelier</Eyebrow>
              <h2 id="creer-titre" className="mt-4 font-serif text-[2.1rem] leading-[1.08] font-medium tracking-[-0.02em] text-ink-950 sm:text-[2.9rem]">
                Créer ma fiche produit
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {billing.enabled && (
                <PlanBadge access={currentAccess} redirecting={billing.redirecting} onUpgrade={billing.openPaywall} onManage={billing.manage} />
              )}
              <ModeBadge mode={serverMode} />
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
            <ProductForm onSubmit={generate} onFieldChange={clearFieldError} fieldErrors={fieldErrors} loading={status === 'loading'} />
            <div className="lg:sticky lg:top-20 lg:self-start" aria-live="polite">
              <ResultPanel status={status} result={result} error={error} variant={variant} onRegenerate={regenerate} onRetry={retry} />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Pricing config={billing.config} />
      <Faq />
      <FinalCta />
      <PaywallModal
        open={billing.paywallOpen}
        config={billing.config}
        quotaReached={quotaExceeded}
        redirecting={billing.redirecting}
        error={billing.billingError}
        onClose={billing.closePaywall}
        onUpgrade={billing.upgrade}
      />
    </>
  );
}
