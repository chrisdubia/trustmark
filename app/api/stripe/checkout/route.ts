import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRODUCTS, type ProductKey } from "@/lib/stripe";
import { getCurrentUserId } from "@/lib/auth";
import { upsertUser } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "placeholder") {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { product, email } = await req.json() as { product: ProductKey; email?: string };
  const productConfig = STRIPE_PRODUCTS[product];
  if (!productConfig) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trustmarc.io";

  // Ensure user row exists if signed in
  if (userId && email) {
    await upsertUser(userId, email).catch(() => {});
  }

  const commonParams = {
    customer_email: email,
    success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/upgrade`,
    metadata: {
      clerk_user_id: userId ?? "",
      product,
    },
  };

  let session;
  if (productConfig.mode === "subscription") {
    session = await stripe.checkout.sessions.create({
      ...commonParams,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: productConfig.currency,
          product_data: { name: productConfig.name },
          recurring: { interval: productConfig.interval },
          unit_amount: productConfig.amount,
        },
        quantity: 1,
      }],
    });
  } else {
    session = await stripe.checkout.sessions.create({
      ...commonParams,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: productConfig.currency,
          product_data: { name: productConfig.name },
          unit_amount: productConfig.amount,
        },
        quantity: 1,
      }],
    });
  }

  return NextResponse.json({ url: session.url });
}
