import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccessInfo } from '../../shared/billing';
import type { GenerateResponse, GenerationMode, ProductInput } from '../../shared/types';
import { validateProductInput, type FieldErrors } from '../../shared/validation';
import { ApiRequestError, fetchMode, generateListing } from '../services/api';

export type GeneratorStatus = 'idle' | 'loading' | 'success' | 'error';

export function useListingGenerator({ onQuotaExceeded }: { onQuotaExceeded?: () => void } = {}) {
  const onQuotaExceededRef = useRef(onQuotaExceeded);
  useEffect(() => {
    onQuotaExceededRef.current = onQuotaExceeded;
  });
  const [status, setStatus] = useState<GeneratorStatus>('idle');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverMode, setServerMode] = useState<GenerationMode | null>(null);
  const [variant, setVariant] = useState(0);
  /** Droits renvoyés par la dernière génération, ou `null` si inconnus. */
  const [access, setAccess] = useState<AccessInfo | null>(null);
  /** Vrai quand la dernière demande a été refusée faute de quota gratuit. */
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const lastInput = useRef<ProductInput | null>(null);
  const lastVariant = useRef(0);

  useEffect(() => {
    let active = true;
    fetchMode().then((mode) => {
      if (active) setServerMode(mode);
    });
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(async (input: ProductInput, nextVariant: number) => {
    const validation = validateProductInput(input);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return false;
    }
    setFieldErrors({});
    setError(null);
    setQuotaExceeded(false);
    setStatus('loading');
    lastInput.current = validation.data;
    lastVariant.current = nextVariant;
    try {
      const response = await generateListing(validation.data, nextVariant);
      setResult(response);
      setServerMode(response.mode);
      if (response.access) setAccess(response.access);
      setVariant(nextVariant);
      setStatus('success');
    } catch (err) {
      if (err instanceof ApiRequestError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      if (err instanceof ApiRequestError && err.code === 'QUOTA_EXCEEDED') {
        setQuotaExceeded(true);
        if (err.access) setAccess(err.access);
        onQuotaExceededRef.current?.();
      }
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
      setStatus('error');
    }
    return true;
  }, []);

  const generate = useCallback((input: ProductInput) => run(input, 0), [run]);

  const regenerate = useCallback(() => {
    if (lastInput.current) void run(lastInput.current, variant + 1);
  }, [run, variant]);

  /** Relance exactement la dernière demande (même saisie, même version), après une erreur. */
  const retry = useCallback(() => {
    if (lastInput.current) void run(lastInput.current, lastVariant.current);
  }, [run]);

  const clearFieldError = useCallback((field: keyof ProductInput) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return {
    status,
    result,
    error,
    fieldErrors,
    serverMode,
    variant,
    access,
    quotaExceeded,
    generate,
    regenerate,
    retry,
    clearFieldError,
  };
}
