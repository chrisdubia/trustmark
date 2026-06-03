import type { VerdictType, C2PAResult, ExifData, AIDetectionResult } from "./types";

export function deriveVerdict(
  c2pa: C2PAResult | null,
  ai: AIDetectionResult | null,
  exif: ExifData | null
): { verdict: VerdictType; confidence: number } {
  const aiScore = ai?.score ?? 0;

  // Hard AI signal — API or software tag match
  if (aiScore >= 0.7) {
    return { verdict: "SYNTHETIC", confidence: Math.round(aiScore * 100) };
  }

  // Moderate AI signal from local heuristics only (API would need 0.7+)
  if (aiScore >= 0.5 && ai?.provider === "local") {
    return { verdict: "SYNTHETIC", confidence: Math.round(aiScore * 100) };
  }

  // Positive AI software tag in EXIF
  const hasAISoftwareSignal = ai?.signals.some(
    (s) => s.name === "AI Generator Identified" && s.detected
  ) ?? false;
  if (hasAISoftwareSignal) {
    return { verdict: "SYNTHETIC", confidence: Math.round(aiScore * 100) };
  }

  // C2PA valid and no AI assertions → VERIFIED
  if (c2pa?.valid && c2pa.hasCertificate) {
    const confidence = c2pa.editCount === 0 ? 95 : 82;
    if (c2pa.editCount > 0) return { verdict: "MODIFIED", confidence };
    return { verdict: "VERIFIED", confidence };
  }

  // C2PA present but has edits
  if (c2pa?.hasCertificate && c2pa.editCount > 0) {
    return { verdict: "MODIFIED", confidence: 80 };
  }

  // Editing software in EXIF
  const editingSoftware = [
    "photoshop", "lightroom", "gimp", "darktable",
    "capture one", "affinity", "snapseed", "vsco", "facetune",
    "luminar", "pixelmator", "canva",
  ];
  const sw = (exif?.software ?? "").toLowerCase();
  const hasEditingSoftware = editingSoftware.some((s) => sw.includes(s));

  // Hive API says strongly not AI-generated — use its confidence
  const notAiScore = ai?.signals.find((s) => s.name === "Not AI Generated")
    ? 1 - aiScore
    : 0;
  const hiveConfident = ai?.provider === "hive" && notAiScore >= 0.85;

  if (hiveConfident) {
    if (hasEditingSoftware) {
      // Strong "not AI" but editing software found → MODIFIED
      return { verdict: "MODIFIED", confidence: 72 };
    }
    if (exif?.make && exif?.dateTimeOriginal) {
      // Camera + timestamp + Hive not-AI → high confidence VERIFIED
      return { verdict: "VERIFIED", confidence: Math.min(90, Math.round(notAiScore * 88)) };
    }
    // Hive says real but no camera metadata (stripped/web download) → MODIFIED
    // The content is real but provenance chain is broken
    return { verdict: "MODIFIED", confidence: Math.round(notAiScore * 68) };
  }

  // Real camera + timestamp = likely real, just no C2PA
  if (exif?.make && exif?.dateTimeOriginal) {
    return { verdict: "VERIFIED", confidence: 65 };
  }

  // No positive signals either way → unknown
  return { verdict: "UNKNOWN", confidence: 30 };
}
