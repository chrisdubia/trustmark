import type { C2PAResult, EditHistoryEntry } from "./types";

// Parses C2PA/JUMBF markers from raw binary without requiring native bindings.
// c2pa-js (the official SDK) requires WASM and browser context; for server-side
// we scan the buffer directly for known manifest store patterns.

function base64ToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  return Buffer.from(base64, "base64");
}

const KNOWN_ASSERTION_LABELS = [
  "c2pa.actions",
  "c2pa.hash.data",
  "c2pa.hash.bmff",
  "c2pa.hash.boxes",
  "c2pa.thumbnail.claim.jpeg",
  "c2pa.thumbnail.claim.png",
  "c2pa.thumbnail.ingredient.jpeg",
  "c2pa.thumbnail.ingredient.png",
  "stds.schema-org.CreativeWork",
  "c2pa.training-mining",
  "c2pa.ai-generative-training",
  "c2pa.ai-inference",
  "c2pa.ingredient",
  "c2pa.depthmap",
];

const AI_SOFTWARE_LABELS = [
  "Adobe Firefly",
  "Midjourney",
  "DALL-E",
  "Stable Diffusion",
  "Adobe Generative Fill",
];

const ACTION_MAP: Record<string, string> = {
  "c2pa.cropped": "Cropped",
  "c2pa.filtered": "Filter applied",
  "c2pa.color_adjustments": "Color adjustments",
  "c2pa.resized": "Resized",
  "c2pa.rotated": "Rotated",
  "c2pa.flipped": "Flipped",
  "c2pa.converted": "Format converted",
  "c2pa.opened": "Opened",
  "c2pa.placed": "Content placed",
  "c2pa.removed": "Content removed",
  "c2pa.repackaged": "Repackaged",
  "c2pa.transcoded": "Transcoded",
  "c2pa.watermarked": "Watermarked",
  "c2pa.ai_generated": "AI content generated",
};

function extractEditHistory(str: string): EditHistoryEntry[] {
  const history: EditHistoryEntry[] = [];

  for (const [key, label] of Object.entries(ACTION_MAP)) {
    if (str.includes(key)) {
      const softwareMatch = str.match(
        new RegExp(`${key.replace(".", "\\.")}[^}]*?"softwareAgent"\\s*:\\s*"([^"]{1,80})"`)
      );
      const whenMatch = str.match(
        new RegExp(`${key.replace(".", "\\.")}[^}]*?"when"\\s*:\\s*"([^"]{1,40})"`)
      );
      history.push({
        action: label,
        softwareAgent: softwareMatch?.[1] ?? null,
        when: whenMatch?.[1] ?? null,
      });
    }
  }

  return history;
}

function extractField(str: string, key: string): string | null {
  const pattern = new RegExp(`"${key}"\\s*:\\s*"([^"]{1,200})"`, "i");
  const match = str.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function extractXMPField(str: string, field: string): string | null {
  const pattern = new RegExp(`<[^>]*?${field}[^>]*?>([^<]{1,200})<`, "i");
  const match = str.match(pattern);
  return match?.[1]?.trim() ?? null;
}

export async function verifyC2PA(dataUrl: string): Promise<C2PAResult> {
  try {
    const buf = base64ToBuffer(dataUrl);
    // Read first 128 KB for manifest scanning — manifests are near the start
    const scanBuf = buf.subarray(0, Math.min(buf.length, 131072));
    const str = scanBuf.toString("latin1");

    const hasManifest =
      str.includes("c2pa.manifest") ||
      str.includes("c2pa.claim") ||
      str.includes("jumb") ||
      str.includes("c2ma");

    if (!hasManifest) {
      return {
        hasCertificate: false,
        issuer: null,
        signingTime: null,
        claimGenerator: null,
        assertions: [],
        editCount: 0,
        editHistory: [],
        thumbnailMatch: null,
        valid: false,
      };
    }

    const assertions = KNOWN_ASSERTION_LABELS.filter((label) =>
      str.includes(label)
    );

    const editHistory = extractEditHistory(str);
    const editCount = editHistory.length;

    const claimGenerator =
      extractField(str, "claim_generator") ??
      extractField(str, "claimGenerator") ??
      null;

    const issuer =
      extractField(str, "commonName") ??
      extractField(str, "issuer") ??
      extractXMPField(str, "dc:creator") ??
      null;

    const signingTime =
      extractField(str, "iat") ??
      extractField(str, "signingTime") ??
      extractXMPField(str, "xmp:CreateDate") ??
      null;

    const hasThumbnail =
      assertions.some((a) => a.includes("thumbnail")) ? true : null;

    const hasAIAssertion = assertions.includes("c2pa.ai_generated") ||
      AI_SOFTWARE_LABELS.some((sw) => str.includes(sw));

    return {
      hasCertificate: true,
      issuer,
      signingTime,
      claimGenerator,
      assertions,
      editCount,
      editHistory,
      thumbnailMatch: hasThumbnail,
      valid: !hasAIAssertion && assertions.length > 0,
    };
  } catch {
    return {
      hasCertificate: false,
      issuer: null,
      signingTime: null,
      claimGenerator: null,
      assertions: [],
      editCount: 0,
      editHistory: [],
      thumbnailMatch: null,
      valid: false,
    };
  }
}
