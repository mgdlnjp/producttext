import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Marque : un « T » typographique suivi du curseur vermillon de l'éditeur. */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className={cn('shrink-0', className)}>
      <rect width="32" height="32" rx="8" fill="#1a1815" />
      <path d="M9.5 9.5h11v2.6h-4.1V23h-2.8V12.1H9.5z" fill="#f7f4ee" />
      <rect x="21.6" y="15" width="2.4" height="8" rx="1.2" fill="#ef4f1a" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-ink-950">
      <LogoMark />
      <span>
        Product<span className="font-serif font-medium italic text-vermilion-600">Text</span>
      </span>
    </span>
  );
}

/** Surtitre de section : numéro / libellé en mono. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase', className)}>
      <span aria-hidden="true" className="h-px w-5 bg-vermilion-500" />
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = 'left',
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('reveal max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-4 font-serif text-[2.1rem] leading-[1.08] font-medium tracking-[-0.02em] text-balance text-ink-950 sm:text-[2.9rem]">
        {title}
      </h2>
      {intro && <p className="mt-4 text-[17px] leading-relaxed text-pretty text-ink-600">{intro}</p>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-white/70 px-1.5 font-mono text-[11px] font-medium text-ink-600 ring-1 ring-ink-200">
      {children}
    </kbd>
  );
}
