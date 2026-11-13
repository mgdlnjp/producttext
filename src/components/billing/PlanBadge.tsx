import { Loader2, Settings2, Sparkles } from 'lucide-react';
import type { AccessInfo } from '../../../shared/billing';

interface Props {
  access: AccessInfo | null;
  redirecting: boolean;
  onUpgrade: () => void;
  onManage: () => void;
}

/** Indicateur de forfait affiché dans l'atelier : quota gratuit restant ou statut Pro. */
export function PlanBadge({ access, redirecting, onUpgrade, onManage }: Props) {
  if (!access || access.plan === 'open') return null;

  if (access.plan === 'pro') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-xs font-semibold text-paper">
          <Sparkles aria-hidden="true" className="h-3 w-3 text-vermilion-300" />
          Pro
        </span>
        <button
          type="button"
          onClick={onManage}
          disabled={redirecting}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-950 disabled:opacity-60"
        >
          {redirecting ? (
            <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Settings2 aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          Gérer l’abonnement
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        onClick={onUpgrade}
        className="inline-flex items-center gap-1 rounded-full bg-vermilion-500 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-vermilion-600"
      >
        <Sparkles aria-hidden="true" className="h-3 w-3" />
        Passer à Pro
      </button>
    </span>
  );
}
