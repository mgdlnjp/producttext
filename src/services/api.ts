import type { AccessInfo } from '../../shared/billing';
import { authHeaders, ensureFreshToken, refreshToken, setToken } from './billing';
import type {
  ApiError,
  GenerateRequest,
  GenerateResponse,
  GenerationMode,
  HealthResponse,
  ProductInput,
} from '../../shared/types';

const TIMEOUT_MS = 70_000;

/** Erreur réseau ou API, avec un message lisible par l'utilisateur. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: ApiError['fieldErrors'],
    public readonly code?: string,
    public readonly access?: AccessInfo,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError('La génération a pris trop de temps. Vérifiez votre connexion et réessayez.');
    }
    throw new ApiRequestError('Connexion impossible. Vérifiez votre accès à Internet et réessayez.');
  } finally {
    clearTimeout(timer);
  }

  const data = (await response.json().catch(() => null)) as T | ApiError | null;
  if (!response.ok) {
    const apiError = data as ApiError | null;
    throw new ApiRequestError(
      apiError?.error ?? `Erreur du serveur (${response.status}).`,
      apiError?.fieldErrors,
      apiError?.code,
      apiError?.access,
    );
  }
  if (data === null) throw new ApiRequestError('Réponse du serveur illisible.');
  return data as T;
}

export async function fetchMode(): Promise<GenerationMode | null> {
  try {
    const data = await request<HealthResponse>('/api/health');
    return data.mode;
  } catch {
    return null;
  }
}

export async function generateListing(input: ProductInput, variant: number, retried = false): Promise<GenerateResponse> {
  await ensureFreshToken();
  const body: GenerateRequest = { input, variant };
  try {
    return await request<GenerateResponse>('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // Accès Pro expiré : on renouvelle le jeton (ou on l'abandonne) puis on réessaie une fois.
    if (error instanceof ApiRequestError && error.code === 'TOKEN_EXPIRED' && !retried) {
      if (!(await refreshToken())) setToken(null);
      return generateListing(input, variant, true);
    }
    throw error;
  }
}
