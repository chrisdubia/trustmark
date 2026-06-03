import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getUser, logVerification, getVerificationHistory, upsertUser, PLAN_LIMITS } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ history: [], signedIn: false });

  const user = await getUser(userId);
  const limit = PLAN_LIMITS[user?.plan ?? "free"].history;
  const history = await getVerificationHistory(userId, limit);
  return NextResponse.json({ history, signedIn: true });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ ok: true, signedIn: false });

  const { id, email, filename, verdict, confidence, sha256, certId } =
    await req.json() as {
      id: string; email: string; filename: string; verdict: string;
      confidence: number; sha256: string; certId: string;
    };

  // Ensure user row exists
  await upsertUser(userId, email ?? "").catch(() => {});
  const user = await getUser(userId);

  // Enforce free tier verification limit
  if (user?.plan === "free") {
    const limit = PLAN_LIMITS.free.verifications;
    if ((user.verifications_used ?? 0) >= limit) {
      return NextResponse.json({ ok: false, limitReached: true, limit }, { status: 402 });
    }
  }

  await logVerification(userId, id, filename, verdict, confidence, sha256, certId);
  return NextResponse.json({ ok: true });
}
