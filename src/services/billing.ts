import type { AccessInfo, BillingConfig } from "../../shared/billing";


/**
 * Jeton d'accès Pro conservé dans le navigateur (localStorage).
 * Il ne contient que des identifiants Stripe opaques signés par le serveur.
 */
const TOKEN_KEY = "producttext_access_token";

export class BillingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "BillingError";
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* stockage indisponible (navigation privée stricte) */
  }
}

/** Lit l'expiration sans vérifier la signature (la vérification est faite par le serveur). */
function tokenExpiry(token: string): number | null {
  try {
    const body = token.split(".")[1];
    if (!body) return null;
    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function post<T>(path: string, body?: unknown, auth = false): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(auth ? authHeaders() : {}) },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new BillingError("NETWORK", "Connexion au serveur impossible.");
  }
  const data = (await res.json().catch(() => null)) as (T & { error?: string; code?: string }) | null;
  if (!res.ok || !data) {
    throw new BillingError(data?.code ?? `HTTP_${res.status}`, data?.error ?? "Une erreur est survenue.");
  }
  return data;
}

export async function fetchBillingConfig(): Promise<BillingConfig> {
  const res = await fetch("/api/billing/config");
  if (!res.ok) return { enabled: false, freePerDay: 0, price: null };
  return (await res.json()) as BillingConfig;
}

/**
 * Renouvelle le jeton auprès du serveur (qui revérifie l'abonnement chez Stripe).
 * Supprime le jeton s'il n'est plus valable.
 */
export async function refreshToken(): Promise<boolean> {
  if (!getToken()) return false;
  try {
    const { token } = await post<{ token: string }>("/api/billing/refresh", undefined, true);
    setToken(token);
    return true;
  } catch (err) {
    if (err instanceof BillingError && ["INVALID_TOKEN", "SUBSCRIPTION_INACTIVE"].includes(err.code)) {
      setToken(null);
    }
    return false;
  }
}

/** Renouvelle le jeton s'il expire dans moins d'un jour. */
export async function ensureFreshToken(): Promise<void> {
  const token = getToken();
  if (!token) return;
  const exp = tokenExpiry(token);
  if (exp !== null && exp - Date.now() < 24 * 60 * 60 * 1000) await refreshToken();
}

export async function fetchAccess(): Promise<AccessInfo | null> {
  await ensureFreshToken();
  const res = await fetch("/api/billing/status", { headers: authHeaders() });
  if (res.status === 401) {
    setToken(null);
    const retry = await fetch("/api/billing/status");
    return retry.ok ? ((await retry.json()) as AccessInfo) : null;
  }
  return res.ok ? ((await res.json()) as AccessInfo) : null;
}

export async function startCheckout(): Promise<void> {
  const { url } = await post<{ url: string }>("/api/billing/checkout");
  window.location.assign(url);
}

export async function activateSubscription(sessionId: string): Promise<void> {
  const { token } = await post<{ token: string }>("/api/billing/activate", { sessionId });
  setToken(token);
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await post<{ url: string }>("/api/billing/portal", undefined, true);
  window.location.assign(url);
}
