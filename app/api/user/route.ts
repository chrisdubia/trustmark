import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getUser, PLAN_LIMITS } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({
      signedIn: false,
      plan: "free",
      credits: 0,
      verificationsUsed: 0,
      limits: PLAN_LIMITS.free,
    });
  }

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({
      signedIn: true,
      plan: "free",
      credits: 0,
      verificationsUsed: 0,
      limits: PLAN_LIMITS.free,
    });
  }

  return NextResponse.json({
    signedIn: true,
    plan: user.plan,
    credits: user.credits,
    verificationsUsed: user.verifications_used,
    limits: PLAN_LIMITS[user.plan],
  });
}
