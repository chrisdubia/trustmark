import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { addCredits, setPlan, upsertUser } from "@/lib/db";
import type Stripe from "stripe";

export const runtime = "nodejs";

const PRODUCT_TO_PLAN: Record<string, { plan?: "pro" | "education"; credits?: number }> = {
  PRO_MONTHLY:        { plan: "pro" },
  PRO_ANNUAL:         { plan: "pro" },
  TEAMS_MONTHLY:      { plan: "teams" },
  EDUCATION_MONTHLY:  { plan: "education" },
  CREDIT_PACK:        { credits: 10 },
};

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret === "placeholder") {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId = session.metadata?.clerk_user_id;
    const product = session.metadata?.product as string | undefined;
    const customerEmail = session.customer_email ?? session.customer_details?.email ?? "";

    if (!clerkUserId || !product) {
      console.warn("[webhook] Missing metadata on session", session.id);
      return NextResponse.json({ received: true });
    }

    const effect = PRODUCT_TO_PLAN[product];
    if (!effect) {
      console.warn("[webhook] Unknown product in metadata:", product);
      return NextResponse.json({ received: true });
    }

    // Ensure user exists
    if (customerEmail) {
      await upsertUser(clerkUserId, customerEmail).catch(console.error);
    }

    if (effect.plan) {
      await setPlan(clerkUserId, effect.plan).catch(console.error);
    }
    if (effect.credits) {
      await addCredits(clerkUserId, effect.credits).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
