import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { deductCredit, getUser, PLAN_LIMITS } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) {
    // Not signed in — let client handle localStorage credits
    return NextResponse.json({ ok: true, signedIn: false });
  }

  const user = await getUser(userId);
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // Pro/education: no credit deduction needed
  if (user.plan !== "free") {
    return NextResponse.json({ ok: true, remaining: null, plan: user.plan });
  }

  const limits = PLAN_LIMITS[user.plan];
  if (user.credits <= 0 && user.verifications_used >= limits.certificates) {
    return NextResponse.json({ ok: false, error: "No credits remaining", remaining: 0 }, { status: 402 });
  }

  const result = await deductCredit(userId);
  return NextResponse.json({ ok: result.ok, remaining: result.remaining });
}
