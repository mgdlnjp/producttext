import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { btn, cn } from '../../lib/cn';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // on tente la méthode de secours ci-dessous
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  return ok;
}

interface CopyButtonProps {
  text: string;
  /** Libellé accessible, ex. « Copier le titre ». */
  label: string;
  variant?: 'subtle' | 'primary';
}

export function CopyButton({ text, label, variant = 'subtle' }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  const Icon = state === 'copied' ? Check : state === 'failed' ? X : Copy;
  const className =
    variant === 'primary'
      ? btn('ink', 'md')
      : cn(
          'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1 ring-inset transition-colors',
          state === 'copied' ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/25' : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50 hover:text-ink-950',
        );

  return (
    <button type="button" onClick={handleClick} aria-label={label} className={className}>
      <Icon aria-hidden="true" className={variant === 'primary' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span aria-live="polite">{state === 'copied' ? 'Copié' : state === 'failed' ? 'Échec de la copie' : variant === 'primary' ? label : 'Copier'}</span>
    </button>
  );
}
