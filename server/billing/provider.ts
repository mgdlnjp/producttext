import Stripe from "stripe";
import type { PlanPrice } from "../../shared/billing";

/** Abstraction du prestataire de paiement : facilite les tests et un éventuel changement de prestataire. */
export interface BillingProvider {
  getPrice(): Promise<PlanPrice>;
  createCheckout(opts: { successUrl: string; cancelUrl: string }): Promise<string>;
  /** Résout une session Checkout terminée. `null` si non payée ou sans abonnement actif. */
  resolveCheckout(sessionId: string): Promise<{ subscriptionId: string; customerId: string } | null>;
  isSubscriptionActive(subscriptionId: string): Promise<boolean>;
  createPortal(opts: { customerId: string; returnUrl: string }): Promise<string>;
}

export class BillingUnavailableError extends Error {
  constructor(message = "Le service de paiement est indisponible.") {
    super(message);
    this.name = "BillingUnavailableError";
  }
}

/** « trialing » compte comme actif si un essai gratuit est configuré dans Stripe. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function createStripeProvider(opts: { secretKey: string; priceId: string }): BillingProvider {
  const stripe = new Stripe(opts.secretKey, { maxNetworkRetries: 1, timeout: 20_000 });
  let priceCache: { value: PlanPrice; at: number } | null = null;

  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) throw new BillingUnavailableError();
      throw err;
    }
  };

  return {
    async getPrice() {
      if (priceCache && Date.now() - priceCache.at < 10 * 60_000) return priceCache.value;
      const price = await wrap(() => stripe.prices.retrieve(opts.priceId));
      if (price.unit_amount == null || !price.recurring) {
        throw new BillingUnavailableError("Le prix Stripe doit être un abonnement récurrent à montant fixe.");
      }
      const value: PlanPrice = {
        amount: price.unit_amount,
        currency: price.currency,
        interval: (["day", "week", "month", "year"] as const).find((i) => i === price.recurring!.interval) ?? "month",
        intervalCount: price.recurring.interval_count,
      };
      priceCache = { value, at: Date.now() };
      return value;
    },

    async createCheckout({ successUrl, cancelUrl }) {
      const session = await wrap(() =>
        stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [{ price: opts.priceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url: cancelUrl,
          allow_promotion_codes: true,
          locale: "fr",
        }),
      );
      if (!session.url) throw new BillingUnavailableError();
      return session.url;
    },

    async resolveCheckout(sessionId) {
      const session = await wrap(() =>
        stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] }),
      );
      if (session.mode !== "subscription" || session.status !== "complete") return null;
      const subscription = session.subscription;
      const subscriptionId = idOf(subscription);
      const customerId = idOf(session.customer);
      if (!subscriptionId || !customerId) return null;
      const status =
        typeof subscription === "object" && subscription
          ? subscription.status
          : (await wrap(() => stripe.subscriptions.retrieve(subscriptionId))).status;
      return ACTIVE_STATUSES.has(status) ? { subscriptionId, customerId } : null;
    },

    async isSubscriptionActive(subscriptionId) {
      const subscription = await wrap(() => stripe.subscriptions.retrieve(subscriptionId));
      return ACTIVE_STATUSES.has(subscription.status);
    },

    async createPortal({ customerId, returnUrl }) {
      const session = await wrap(() =>
        stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl }),
      );
      return session.url;
    },
  };
}
