import { FlaskConical } from 'lucide-react';
import type { GenerationMode } from '../../../shared/types';

export function ModeBadge({ mode }: { mode: GenerationMode | null }) {
  if (mode === null) return null;
  if (mode === 'ai') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Génération IA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-500/30">
      <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
      Mode démonstration
    </span>
  );
}

export function DemoNotice() {
  return (
    <p className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-950 ring-1 ring-amber-300/50">
      <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <span>
        <strong className="font-semibold">Mode démonstration :</strong> aucune IA n’est connectée. La fiche est assemblée automatiquement à
        partir de vos informations, avec des gabarits simples. Le rendu final avec l’IA sera plus naturel.
      </span>
    </p>
  );
}
