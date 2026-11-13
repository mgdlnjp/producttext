import { useEffect, useRef } from 'react';
import { AlertCircle, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { formatAmount, formatPrice, type BillingConfig } from '../../../shared/billing';
import { btn } from '../../lib/cn';
import { LogoMark } from '../ui';
import { PRO_FEATURES } from './features';

interface Props {
  open: boolean;
  config: BillingConfig | null;
  quotaReached: boolean;
  redirecting: boolean;
  error: string | null;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PaywallModal({ open, config, quotaReached, redirecting, error, onClose, onUpgrade }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open || !config?.enabled || !config.price) return null;
  const price = config.price;
  const period = formatPrice(price).split(' / ')[1];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-t-[28px] bg-white shadow-lift ring-1 ring-ink-200 sm:rounded-[28px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-950"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="paper-grain border-b border-ink-200/70 bg-paper px-6 pt-7 pb-6 sm:px-8">
          <LogoMark size={36} />
          <h2 id="paywall-title" className="mt-5 font-serif text-[1.75rem] leading-[1.1] font-medium tracking-[-0.02em] text-ink-950">
            {quotaReached ? 'Vos fiches gratuites du jour sont utilisées' : 'Passez à ProductText Pro'}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            {quotaReached
              ? "Pour continuer dès maintenant, passez à l’accès illimité :"
              : 'Rédigez toutes vos fiches produit, sans compter.'}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="flex items-baseline gap-1.5">
            <span className="font-serif text-[2.6rem] leading-none font-medium tracking-tight text-ink-950">{formatAmount(price)}</span>
            <span className="text-ink-500">/ {period}</span>
          </p>
          <ul className="mt-5 space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[15px] text-ink-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vermilion-50 text-vermilion-600">
                  <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-[13px] text-red-800 ring-1 ring-red-200">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="button"
            data-autofocus
            onClick={onUpgrade}
            disabled={redirecting}
            className={btn('primary', 'lg', 'mt-6 w-full')}
          >
            {redirecting ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Redirection vers le paiement…
              </>
            ) : (
              <>
                S’abonner — {formatPrice(price)}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[12px] text-ink-400">
            Paiement sécurisé par Stripe. ProductText n’a jamais accès à vos coordonnées bancaires.
          </p>
        </div>
      </div>
    </div>
  );
}
