import { useCallback, useEffect, useState } from 'react';
import type { AccessInfo, BillingConfig } from '../../shared/billing';
import { BillingError, fetchAccess, fetchBillingConfig, openBillingPortal, startCheckout } from '../services/billing';

/** Configuration de l'abonnement, droits de l'utilisateur et actions Stripe. */
export function useBilling() {
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchBillingConfig(), fetchAccess()])
      .then(([cfg, acc]) => {
        if (!alive) return;
        setConfig(cfg);
        setAccess(acc);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBillingError(null);
    setRedirecting(true);
    try {
      await fn(); // redirection vers Stripe : on reste en état « redirection »
    } catch (err) {
      setRedirecting(false);
      setBillingError(err instanceof BillingError ? err.message : 'Le paiement est momentanément indisponible.');
    }
  }, []);

  return {
    config,
    access,
    setAccess,
    enabled: !!config?.enabled && !!config.price,
    paywallOpen,
    openPaywall: useCallback(() => setPaywallOpen(true), []),
    closePaywall: useCallback(() => {
      setPaywallOpen(false);
      setBillingError(null);
    }, []),
    redirecting,
    billingError,
    upgrade: useCallback(() => run(startCheckout), [run]),
    manage: useCallback(() => run(openBillingPortal), [run]),
  };
}
