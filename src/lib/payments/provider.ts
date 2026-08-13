/**
 * Payment abstraction.
 *
 * Cooe is free during beta and NO payment processing is live. This module
 * exists so that a real provider can be dropped in behind the
 * CRYPTO_PAYMENTS_ENABLED flag without reshaping the product. Nothing here
 * moves money, and there is deliberately no wallet dependency installed yet.
 */

export type PaymentStatus = "beta_free" | "coming_soon";

export type PricedAction = {
  id: "check" | "map" | "rehearse" | "repair";
  label: string;
  description: string;
  status: PaymentStatus;
};

export const PRICED_ACTIONS: PricedAction[] = [
  {
    id: "check",
    label: "Quick Check",
    description: "One message, analysed before you send it.",
    status: "coming_soon",
  },
  {
    id: "map",
    label: "Conversation Map",
    description: "A whole situation, untangled.",
    status: "coming_soon",
  },
  {
    id: "rehearse",
    label: "Rehearsal",
    description: "A practice conversation, plus a debrief.",
    status: "coming_soon",
  },
  {
    id: "repair",
    label: "Repair",
    description: "A repair attempt after it went wrong.",
    status: "coming_soon",
  },
];

export const SUPPORTED_CURRENCIES = ["USDC", "SOL"] as const;
export const SUPPORTED_NETWORK = "Solana";

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export type CheckoutSession = {
  status: "unavailable";
  reason: string;
};

export interface PaymentProvider {
  readonly id: string;
  isEnabled(): boolean;
  createCheckout(action: PricedAction["id"]): Promise<CheckoutSession>;
}

/** The only provider that exists today. It is honest about doing nothing. */
class DisabledPaymentProvider implements PaymentProvider {
  readonly id = "disabled";

  isEnabled() {
    return false;
  }

  async createCheckout(): Promise<CheckoutSession> {
    return {
      status: "unavailable",
      reason: "Crypto checkout is not live yet. Cooe is free during beta.",
    };
  }
}

export function cryptoPaymentsEnabled(): boolean {
  return process.env.CRYPTO_PAYMENTS_ENABLED === "true";
}

export function getPaymentProvider(): PaymentProvider {
  // When crypto checkout ships, resolve a Solana provider here behind the flag.
  return new DisabledPaymentProvider();
}
