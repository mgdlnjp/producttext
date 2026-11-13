import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '../../lib/cn';

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  /** Afficher le compteur de caractères. */
  showCounter?: boolean;
}

export function TextField({
  label,
  name,
  value,
  onChange,
  maxLength,
  placeholder,
  hint,
  error,
  required,
  multiline,
  rows = 5,
  showCounter = multiline,
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const nearLimit = value.length > maxLength * 0.9;
  const ratio = Math.min(1, value.length / maxLength);

  const className = cn(
    'block w-full rounded-xl bg-white px-3.5 py-2.5 text-[15px] text-ink-950 shadow-[0_1px_2px_rgb(26_24_21/0.05)] ring-1 ring-inset transition-[box-shadow,background-color] placeholder:text-ink-400 focus:outline-none focus:ring-2',
    error ? 'ring-red-400 focus:ring-red-500' : 'ring-ink-200 hover:ring-ink-300 focus:ring-vermilion-500',
  );

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-900">
          {label}
          {required ? (
            <span className="ml-1 text-vermilion-600" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="ml-2 text-xs font-normal text-ink-400">facultatif</span>
          )}
        </label>
        {showCounter && (
          <span className="flex items-center gap-2" aria-live="polite">
            <span aria-hidden="true" className="h-1 w-12 overflow-hidden rounded-full bg-ink-100">
              <span
                className={cn('block h-full rounded-full transition-[width] duration-300', nearLimit ? 'bg-amber-500' : 'bg-ink-400')}
                style={{ width: `${ratio * 100}%` }}
              />
            </span>
            <span className={cn('font-mono text-[11px] tabular-nums', nearLimit ? 'text-amber-700' : 'text-ink-500')}>
              {value.length}/{maxLength}
            </span>
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={cn(className, 'resize-y leading-7')}
        />
      ) : (
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
      {hint && (
        <p id={hintId} className="mt-1.5 text-[13px] leading-snug text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-700">
          <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
