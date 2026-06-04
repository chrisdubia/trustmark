import { neon } from "@neondatabase/serverless";

export type Plan = "free" | "pro" | "education" | "teams";

export interface DbUser {
  clerk_user_id: string;
  email: string;
  plan: Plan;
  credits: number;
  verifications_used: number;
  created_at: string;
  updated_at: string;
}

export interface DbVerification {
  id: string;
  clerk_user_id: string;
  filename: string;
  verdict: string;
  confidence: number;
  sha256: string;
  cert_id: string;
  verified_at: string;
}

const dbConfigured = () =>
  !!(process.env.DATABASE_URL && process.env.DATABASE_URL !== "placeholder");

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url || url === "placeholder") throw new Error("DATABASE_URL not configured");
  return neon(url);
}

// Idempotent schema init — call once per cold start
let initialized = false;
export async function ensureSchema(): Promise<void> {
  if (!dbConfigured() || initialized) return;
  initialized = true;
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS tm_users (
      clerk_user_id TEXT PRIMARY KEY,
      email         TEXT NOT NULL,
      plan          TEXT NOT NULL DEFAULT 'free',
      credits       INTEGER NOT NULL DEFAULT 0,
      verifications_used INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tm_verifications (
      id            TEXT PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      filename      TEXT NOT NULL,
      verdict       TEXT NOT NULL,
      confidence    INTEGER NOT NULL,
      sha256        TEXT NOT NULL,
      cert_id       TEXT NOT NULL,
      verified_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getUser(clerkUserId: string): Promise<DbUser | null> {
  if (!dbConfigured()) return null;
  await ensureSchema();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM tm_users WHERE clerk_user_id = ${clerkUserId} LIMIT 1
  `;
  return (rows[0] as DbUser) ?? null;
}

export async function upsertUser(clerkUserId: string, email: string): Promise<DbUser> {
  await ensureSchema();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO tm_users (clerk_user_id, email)
    VALUES (${clerkUserId}, ${email})
    ON CONFLICT (clerk_user_id) DO UPDATE
      SET email = EXCLUDED.email, updated_at = NOW()
    RETURNING *
  `;
  return rows[0] as DbUser;
}

export async function incrementVerifications(clerkUserId: string): Promise<void> {
  await ensureSchema();
  const sql = getSQL();
  await sql`
    UPDATE tm_users
    SET verifications_used = verifications_used + 1, updated_at = NOW()
    WHERE clerk_user_id = ${clerkUserId}
  `;
}

export async function deductCredit(clerkUserId: string): Promise<{ ok: boolean; remaining: number }> {
  await ensureSchema();
  const sql = getSQL();
  const rows = await sql`
    UPDATE tm_users
    SET credits = GREATEST(credits - 1, 0), updated_at = NOW()
    WHERE clerk_user_id = ${clerkUserId} AND credits > 0
    RETURNING credits
  `;
  if (rows.length === 0) {
    const user = await getUser(clerkUserId);
    return { ok: false, remaining: user?.credits ?? 0 };
  }
  return { ok: true, remaining: (rows[0] as { credits: number }).credits };
}

export async function addCredits(clerkUserId: string, amount: number): Promise<void> {
  await ensureSchema();
  const sql = getSQL();
  await sql`
    UPDATE tm_users
    SET credits = credits + ${amount}, updated_at = NOW()
    WHERE clerk_user_id = ${clerkUserId}
  `;
}

export async function setPlan(clerkUserId: string, plan: Plan): Promise<void> {
  await ensureSchema();
  const sql = getSQL();
  await sql`
    UPDATE tm_users
    SET plan = ${plan}, updated_at = NOW()
    WHERE clerk_user_id = ${clerkUserId}
  `;
}

export async function logVerification(
  clerkUserId: string,
  id: string,
  filename: string,
  verdict: string,
  confidence: number,
  sha256: string,
  certId: string
): Promise<void> {
  await ensureSchema();
  const sql = getSQL();
  await sql`
    INSERT INTO tm_verifications (id, clerk_user_id, filename, verdict, confidence, sha256, cert_id, verified_at)
    VALUES (${id}, ${clerkUserId}, ${filename}, ${verdict}, ${confidence}, ${sha256}, ${certId}, NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  await incrementVerifications(clerkUserId);
}

export async function getVerificationHistory(
  clerkUserId: string,
  limit = 500
): Promise<DbVerification[]> {
  await ensureSchema();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM tm_verifications
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY verified_at DESC
    LIMIT ${limit}
  `;
  return rows as DbVerification[];
}

export const PLAN_LIMITS: Record<Plan, { verifications: number; certificates: number; history: number }> = {
  free:      { verifications: 5,   certificates: 2,         history: 5 },
  education: { verifications: 999, certificates: 999,       history: 500 },
  pro:       { verifications: 999, certificates: 999,       history: 500 },
  teams:     { verifications: 999, certificates: 999,       history: 500 },
};
