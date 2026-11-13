import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { CopyButton } from './CopyButton';

interface ResultCardProps {
  title: string;
  /** Texte brut copié dans le presse-papiers. */
  copyText?: string;
  children: ReactNode;
  tone?: 'default' | 'info';
  icon?: LucideIcon;
  /** Indication discrète à côté du titre (ex. nombre de caractères). */
  meta?: string;
}

export function ResultCard({ title, copyText, children, tone = 'default', icon: Icon, meta }: ResultCardProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        'group/card relative rounded-2xl p-5 transition-[box-shadow,background-color] duration-200',
        tone === 'info' ? 'bg-vermilion-50/70 ring-1 ring-vermilion-200/70' : 'bg-white ring-1 ring-ink-200/70 hover:shadow-card hover:ring-ink-300/70',
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className={cn('flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.14em] uppercase', tone === 'info' ? 'text-vermilion-700' : 'text-ink-500')}>
          {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5" />}
          {title}
          {meta && <span className="font-normal tracking-normal text-ink-400 normal-case">· {meta}</span>}
        </h3>
        {copyText !== undefined && <CopyButton text={copyText} label={`Copier : ${title}`} />}
      </div>
      <div className="text-ink-800">{children}</div>
    </section>
  );
}
