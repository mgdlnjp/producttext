/** Types de facturation partagés entre le serveur et l'interface. */

export interface PlanPrice {
  /** Montant en plus petite unité (centimes). */
  amount: number;
  currency: string;
  interval: "day" | "week" | "month" | "year";
  intervalCount: number;
}

export interface BillingConfig {
  enabled: boolean;
  freePerDay: number;
  price: PlanPrice | null;
}

export type AccessInfo =
  /** Facturation désactivée : accès libre (développement, auto-hébergement). */
  | { plan: "open" }
  | { plan: "free"; remaining: number; limit: number }
  | { plan: "pro" };

const INTERVAL_LABELS: Record<PlanPrice["interval"], [string, string]> = {
  day: ["jour", "jours"],
  week: ["semaine", "semaines"],
  month: ["mois", "mois"],
  year: ["an", "ans"],
};

export function formatAmount(price: Pick<PlanPrice, "amount" | "currency">): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    minimumFractionDigits: price.amount % 100 === 0 ? 0 : 2,
  }).format(price.amount / 100);
}

/** « 4,90 € / mois », « 39 € / an », « 12 € / 3 mois ». */
export function formatPrice(price: PlanPrice): string {
  const [one, many] = INTERVAL_LABELS[price.interval];
  const period = price.intervalCount === 1 ? one : `${price.intervalCount} ${many}`;
  return `${formatAmount(price)} / ${period}`;
}
