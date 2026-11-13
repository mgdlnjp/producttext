/** Concatène des classes en ignorant les valeurs falsy. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'ink' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-vermilion-500 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(173_47_11/0.35),0_8px_20px_-8px_rgb(239_79_26/0.6)] hover:bg-vermilion-600 focus-visible:outline-vermilion-500',
  ink: 'bg-ink-900 text-paper shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] hover:bg-ink-700 focus-visible:outline-ink-900',
  outline: 'bg-white text-ink-800 ring-1 ring-inset ring-ink-200 shadow-sm hover:bg-ink-50 hover:ring-ink-300 focus-visible:outline-ink-900',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-950 focus-visible:outline-ink-900',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

/** Classes de bouton (utilisables sur <button> comme sur <a>). */
export function btn(variant: Variant = 'primary', size: Size = 'md', extra?: string): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], extra);
}
