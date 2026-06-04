import type { VerdictType } from "./types";

interface KVRecord {
  verdict: VerdictType;
  confidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  seenCount: number;
  filename: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export interface KnownFakesResult {
  previouslySeenCount: number;
  firstSeenAt: string | null;
  knownFakeFlag: boolean;
  knownFakeMessage: string | undefined;
}

export async function checkAndRecordHash(
  hash: string,
  verdict: VerdictType,
  confidence: number,
  filename: string
): Promise<KnownFakesResult> {
  // Gracefully skip if KV is not configured
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken || kvUrl === "placeholder" || kvToken === "placeholder") {
    return { previouslySeenCount: 0, firstSeenAt: null, knownFakeFlag: false, knownFakeMessage: undefined };
  }

  try {
    const { kv } = await import("@vercel/kv");
    const key = `hash:${hash}`;
    const now = new Date().toISOString();

    const existing = await kv.get<KVRecord>(key);

    let previouslySeenCount = 0;
    let firstSeenAt: string | null = null;
    let knownFakeFlag = false;
    let knownFakeMessage: string | undefined;

    if (existing) {
      previouslySeenCount = existing.seenCount;
      firstSeenAt = existing.firstSeenAt;

      if (existing.verdict === "SYNTHETIC" || existing.verdict === "MODIFIED") {
        knownFakeFlag = true;
        knownFakeMessage = `This exact file was previously submitted to Trustmarc and flagged as ${existing.verdict.toLowerCase()} on ${formatDate(existing.firstSeenAt)}.`;
      }

      // Update record
      await kv.set<KVRecord>(key, {
        ...existing,
        lastSeenAt: now,
        seenCount: existing.seenCount + 1,
        filename,
      });
    } else {
      // First time seeing this file
      await kv.set<KVRecord>(key, {
        verdict,
        confidence,
        firstSeenAt: now,
        lastSeenAt: now,
        seenCount: 1,
        filename,
      });
    }

    return { previouslySeenCount, firstSeenAt, knownFakeFlag, knownFakeMessage };
  } catch (err) {
    console.warn("[knownFakes] KV error (non-fatal):", err);
    return { previouslySeenCount: 0, firstSeenAt: null, knownFakeFlag: false, knownFakeMessage: undefined };
  }
}
