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
    // Editing software tag = confirmed modification
    if (hasEditingSoftware) {
      return { verdict: "MODIFIED", confidence: 75 };
    }
    // Camera + timestamp + Hive says real → VERIFIED
    if (exif?.make && exif?.dateTimeOriginal) {
      return { verdict: "VERIFIED", confidence: Math.min(90, Math.round(notAiScore * 88)) };
    }
    // Camera make but no timestamp (or vice versa) — still lean VERIFIED
    if (exif?.make || exif?.dateTimeOriginal) {
      return { verdict: "VERIFIED", confidence: 72 };
    }
    // No camera metadata at all — Hive is confident it's real but origin is unverifiable
    // Return low-confidence VERIFIED rather than UNKNOWN — Hive's signal is meaningful
    return { verdict: "VERIFIED", confidence: 58 };
  }

  // Editing software without Hive confirmation
  if (hasEditingSoftware) {
    return { verdict: "MODIFIED", confidence: 70 };
  }

  // Real camera + timestamp = likely real, just no C2PA
  if (exif?.make && exif?.dateTimeOriginal) {
    return { verdict: "VERIFIED", confidence: 65 };
  }

  // No positive signals either way → unknown
  return { verdict: "UNKNOWN", confidence: 30 };
}
