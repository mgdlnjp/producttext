import { useId } from 'react';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface OptionGroupProps<T extends string> {
  legend: string;
  name: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  hint?: string;
  icons?: Partial<Record<T, LucideIcon>>;
}

/** Groupe de boutons radio présentés en « pastilles », accessible au clavier (flèches). */
export function OptionGroup<T extends string>({ legend, name, options, labels, value, onChange, hint, icons }: OptionGroupProps<T>) {
  const id = useId();
  return (
    <fieldset aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="mb-2 text-sm font-medium text-ink-900">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = option === value;
          const Icon: LucideIcon | undefined = icons?.[option];
          return (
            <label
              key={option}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-all duration-150 select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vermilion-500',
                checked
                  ? 'bg-ink-900 font-medium text-paper shadow-[0_1px_2px_rgb(26_24_21/0.2)]'
                  : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:ring-ink-300',
              )}
            >
              <input type="radio" name={name} value={option} checked={checked} onChange={() => onChange(option)} className="sr-only" />
              {checked ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5 text-vermilion-400" strokeWidth={3} />
              ) : (
                Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 text-ink-400" />
              )}
              {labels[option]}
            </label>
          );
        })}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-ink-500">
          {hint}
        </p>
      )}
    </fieldset>
  );
}
