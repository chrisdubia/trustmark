import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "placeholder");

export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: {
    name: "Trustmarc Pro — Monthly",
    amount: 2900, // cents
    currency: "usd",
    interval: "month" as const,
    mode: "subscription" as const,
  },
  PRO_ANNUAL: {
    name: "Trustmarc Pro — Annual",
    amount: 24900,
    currency: "usd",
    interval: "year" as const,
    mode: "subscription" as const,
  },
  EDUCATION_MONTHLY: {
    name: "Trustmarc Education — Monthly",
    amount: 900,
    currency: "usd",
    interval: "month" as const,
    mode: "subscription" as const,
  },
  CREDIT_PACK: {
    name: "Trustmarc — 10 Verification Credits",
    amount: 1500,
    currency: "usd",
    mode: "payment" as const,
  },
} as const;

export type ProductKey = keyof typeof STRIPE_PRODUCTS;
