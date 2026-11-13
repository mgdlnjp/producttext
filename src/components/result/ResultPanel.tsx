import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlignLeft,
  CircleAlert,
  FileText,
  Hash,
  Highlighter,
  ListChecks,
  ListPlus,
  PenLine,
  Quote,
  RefreshCw,
  RotateCcw,
  TriangleAlert,
  Type,
} from 'lucide-react';
import type { GenerateResponse, Listing } from '../../../shared/types';
import type { GeneratorStatus } from '../../hooks/useListingGenerator';
import { btn, cn } from '../../lib/cn';
import { CopyButton } from './CopyButton';
import { DemoNotice, ModeBadge } from './ModeBadge';
import { ResultCard } from './ResultCard';

function listingToPlainText(listing: Listing): string {
  return [
    listing.title,
    '',
    listing.hook,
    '',
    listing.description,
    '',
    'Points forts :',
    ...listing.highlights.map((h) => `- ${h}`),
  ].join('\n');
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Surligne les mots-clés dans un texte (insensible à la casse), sans modifier le texte copié. */
function Highlighted({ text, keywords, enabled }: { text: string; keywords: string[]; enabled: boolean }) {
  const parts = useMemo(() => {
    const terms = keywords
      .map((k) => k.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (!enabled || terms.length === 0) return [text];
    // split() avec groupe capturant : les indices impairs sont les mots-clés trouvés.
    return text.split(new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi'));
  }, [text, keywords, enabled]);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="marker text-inherit">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-3xl bg-paper-2/70 p-2 ring-1 ring-ink-200/70', className)}>{children}</div>;
}

interface ResultPanelProps {
  status: GeneratorStatus;
  result: GenerateResponse | null;
  error: string | null;
  variant: number;
  onRegenerate: () => void;
  onRetry: () => void;
}

export function ResultPanel({ status, result, error, variant, onRegenerate, onRetry }: ResultPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [view, setView] = useState<'blocks' | 'text'>('blocks');
  const [highlight, setHighlight] = useState(true);
  const tabsId = useId();

  useEffect(() => {
    if (status === 'success') headingRef.current?.focus();
  }, [status, result]);

  if (status === 'idle' && !result) {
    return (
      <Shell>
        <div className="ruled flex min-h-[26rem] flex-col items-center justify-center rounded-[1.25rem] border-2 border-dashed border-ink-200 bg-white/70 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-vermilion-500 shadow-card ring-1 ring-ink-200">
            <PenLine aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="mt-5 font-serif text-xl font-medium text-ink-950">Votre fiche apparaîtra ici</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
            Renseignez au moins le nom du produit, puis cliquez sur « Générer ma fiche ». Titre, accroche, description et points forts seront
            présentés dans des blocs à copier séparément.
          </p>
          <ul aria-hidden="true" className="mt-6 flex flex-wrap justify-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] text-ink-400 uppercase">
            {['Titre', 'Accroche', 'Description', 'Points forts', 'Mots-clés'].map((b) => (
              <li key={b} className="rounded-full bg-white px-2.5 py-1 ring-1 ring-ink-200">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    );
  }

  if (status === 'loading') {
    return (
      <Shell>
        <div role="status" aria-live="polite" className="space-y-2">
          <p className="caret px-3 pt-2 pb-1 font-serif text-[17px] text-ink-800">Rédaction de votre fiche en cours</p>
          {[
            ['w-24', 'w-4/5', ''],
            ['w-20', 'w-full', 'w-3/5'],
            ['w-28', 'w-full', 'w-2/3'],
          ].map(([a, b, c], i) => (
            <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-ink-200/70">
              <div className={cn('skeleton mb-4 h-2.5 rounded-full', a)} />
              <div className={cn('skeleton h-3.5 rounded-full', b)} />
              {c && <div className={cn('skeleton mt-2.5 h-3.5 rounded-full', c)} />}
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <div className="space-y-4">
      {status === 'error' && error && (
        <div role="alert" className="animate-fade-up flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-900 ring-1 ring-red-200">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">La fiche n’a pas pu être générée.</p>
            <p className="mt-1">{error}</p>
            <button type="button" onClick={onRetry} className={btn('outline', 'sm', 'mt-3 text-red-900 ring-red-200 hover:bg-red-100')}>
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Réessayer
            </button>
          </div>
        </div>
      )}

      {result && (
        <Shell className="animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-2 pb-3">
            <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-3 font-serif text-2xl font-medium tracking-tight text-ink-950 focus:outline-none">
              Votre fiche
              {variant > 0 && (
                <span className="rounded-full bg-white px-2 py-0.5 font-sans text-[11px] font-normal tracking-normal text-ink-600 ring-1 ring-ink-200">
                  <span className="sr-only">— </span>version {variant + 1}
                </span>
              )}
            </h2>
            <ModeBadge mode={result.mode} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3">
            <div role="tablist" aria-label="Affichage de la fiche" className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink-200">
              {(
                [
                  ['blocks', 'Blocs'],
                  ['text', 'Texte complet'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`${tabsId}-${id}`}
                  aria-selected={view === id}
                  aria-controls={`${tabsId}-panel`}
                  onClick={() => setView(id)}
                  className={cn('h-7 rounded-full px-3 text-[13px] font-medium transition-colors', view === id ? 'bg-ink-900 text-paper' : 'text-ink-600 hover:text-ink-950')}
                >
                  {label}
                </button>
              ))}
            </div>
            {view === 'blocks' && result.listing.keywords.length > 0 && (
              <button
                type="button"
                aria-pressed={highlight}
                onClick={() => setHighlight((h) => !h)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ring-1 ring-inset transition-colors',
                  highlight ? 'bg-marker/60 text-ink-900 ring-amber-300' : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50',
                )}
              >
                <Highlighter aria-hidden="true" className="h-3.5 w-3.5" /> Surligner les mots-clés
              </button>
            )}
          </div>

          <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${view}`} className="space-y-2">
            {result.mode === 'demo' && <DemoNotice />}

            {result.warnings.length > 0 && (
              <ResultCard title="À vérifier avant publication" tone="info" icon={TriangleAlert}>
                <ul className="space-y-1.5 text-sm">
                  {result.warnings.map((w) => (
                    <li key={w} className="flex gap-2">
                      <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-vermilion-500" />
                      {w}
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {view === 'text' ? (
              <ResultCard title="Fiche complète" icon={FileText} copyText={listingToPlainText(result.listing)}>
                <pre className="max-h-[32rem] overflow-auto rounded-xl bg-paper/70 p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink-800 ring-1 ring-ink-200/60">
                  {listingToPlainText(result.listing)}
                </pre>
              </ResultCard>
            ) : (
              <>
                <ResultCard title="Titre" icon={Type} meta={`${[...result.listing.title].length} car.`} copyText={result.listing.title}>
                  <p className="font-serif text-[22px] leading-snug font-medium text-ink-950">{result.listing.title}</p>
                </ResultCard>

                <ResultCard title="Accroche" icon={Quote} copyText={result.listing.hook}>
                  <p className="text-[16px] leading-relaxed text-ink-800 italic">{result.listing.hook}</p>
                </ResultCard>

                <ResultCard title="Description détaillée" icon={AlignLeft} meta={`${[...result.listing.description].length} car.`} copyText={result.listing.description}>
                  <div className="space-y-3 text-[15px] leading-relaxed">
                    {result.listing.description.split(/\n{2,}/).map((paragraph, i) => (
                      <p key={i} className="whitespace-pre-line">
                        <Highlighted text={paragraph} keywords={result.listing.keywords} enabled={highlight} />
                      </p>
                    ))}
                  </div>
                </ResultCard>

                <ResultCard title="Points forts" icon={ListChecks} copyText={result.listing.highlights.map((h) => `- ${h}`).join('\n')}>
                  <ul className="space-y-2 text-[15px]">
                    {result.listing.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span aria-hidden="true" className="mt-[9px] h-1.5 w-3 shrink-0 rounded-full bg-vermilion-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </ResultCard>

                {result.listing.keywords.length > 0 && (
                  <ResultCard title="Mots-clés" icon={Hash} copyText={result.listing.keywords.join(', ')}>
                    <ul className="flex flex-wrap gap-2">
                      {result.listing.keywords.map((k) => (
                        <li key={k} className="rounded-full bg-marker/50 px-3 py-1 text-sm text-ink-900 ring-1 ring-amber-300/70">
                          {k}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
              </>
            )}

            {result.listing.missingInfo.length > 0 && (
              <ResultCard title="Informations à compléter" tone="info" icon={ListPlus}>
                <p className="mb-2 text-sm text-ink-700">Ces informations n’ont pas été fournies : ajoutez-les si vous les connaissez.</p>
                <ul className="space-y-1.5 text-sm">
                  {result.listing.missingInfo.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-vermilion-500" />
                      {m}
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-ink-200/70 sm:flex-row sm:items-center">
            <button type="button" onClick={onRegenerate} className={btn('outline', 'md')}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" /> Générer une autre version
            </button>
            <CopyButton text={listingToPlainText(result.listing)} label="Copier toute la fiche" variant="primary" />
          </div>
          <p className="px-3 pt-3 pb-1 text-xs text-ink-500">Relisez toujours la fiche avant publication : vous restez responsable des informations publiées.</p>
        </Shell>
      )}
    </div>
  );
}
