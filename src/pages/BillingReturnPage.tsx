import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { btn } from '../lib/cn';
import { activateSubscription, BillingError } from '../services/billing';

type Status = { kind: 'loading' } | { kind: 'success' } | { kind: 'error'; message: string };

/** Retour de Stripe Checkout : vérifie le paiement côté serveur puis active l'accès Pro. */
export function BillingReturnPage() {
  const [sessionId] = useState(() => new URLSearchParams(window.location.search).get('session_id'));
  const [status, setStatus] = useState<Status>(() =>
    sessionId ? { kind: 'loading' } : { kind: 'error', message: 'Le lien de confirmation est incomplet.' },
  );
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !sessionId) return;
    started.current = true;
    activateSubscription(sessionId)
      .then(() => {
        // Retire l'identifiant de session de la barre d'adresse.
        window.history.replaceState({}, '', `${window.location.pathname}#abonnement`);
        setStatus({ kind: 'success' });
      })
      .catch((err) =>
        setStatus({
          kind: 'error',
          message: err instanceof BillingError ? err.message : 'L’activation a échoué. Réessayez dans un instant.',
        }),
      );
  }, [sessionId]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md text-center" aria-live="polite">
        {status.kind === 'loading' && (
          <>
            <Loader2 aria-hidden="true" className="mx-auto h-10 w-10 animate-spin text-vermilion-500" />
            <h1 className="mt-6 font-serif text-3xl font-medium text-ink-950">Activation de votre abonnement…</h1>
            <p className="mt-2 text-ink-600">Nous vérifions le paiement auprès de Stripe.</p>
          </>
        )}
        {status.kind === 'success' && (
          <>
            <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-vermilion-500" />
            <h1 className="mt-6 font-serif text-[2.2rem] leading-tight font-medium text-ink-950">
              Bienvenue dans ProductText <em className="text-vermilion-600">Pro</em>
            </h1>
            <p className="mt-3 text-ink-600">
              Vos générations sont désormais illimitées sur ce navigateur. Vous pouvez gérer ou résilier l’abonnement à
              tout moment depuis l’atelier.
            </p>
            <a href="#creer" className={btn('primary', 'lg', 'mt-8')}>
              Créer une fiche
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </>
        )}
        {status.kind === 'error' && (
          <>
            <AlertCircle aria-hidden="true" className="mx-auto h-12 w-12 text-red-600" />
            <h1 className="mt-6 font-serif text-3xl font-medium text-ink-950">L’abonnement n’a pas pu être activé</h1>
            <p role="alert" className="mt-3 text-ink-700">
              {status.message}
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Si vous avez été débité, rechargez cette page dans quelques secondes. Si le problème persiste,
              contactez-nous avec votre reçu Stripe.
            </p>
            <a href="#creer" className={btn('outline', 'md', 'mt-8')}>
              Retour à l’atelier
            </a>
          </>
        )}
      </div>
    </section>
  );
}
