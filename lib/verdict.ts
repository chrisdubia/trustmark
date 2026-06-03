import type { VerdictType, C2PAResult, ExifData, AIDetectionResult } from "./types";

export function deriveVerdict(
  c2pa: C2PAResult | null,
  ai: AIDetectionResult | null,
  exif: ExifData | null
): { verdict: VerdictType; confidence: number } {
  const aiScore = ai?.score ?? 0;

  // Hard AI signal — either from API or software tag match
  if (aiScore >= 0.7) {
    return { verdict: "SYNTHETIC", confidence: Math.round(aiScore * 100) };
  }

  // Moderate AI signal from local heuristics
  if (aiScore >= 0.5 && ai?.provider === "local") {
    return { verdict: "SYNTHETIC", confidence: Math.round(aiScore * 100) };
  }

  // C2PA valid and no AI assertions → VERIFIED
  if (c2pa?.valid && c2pa.hasCertificate) {
    const confidence = c2pa.editCount === 0 ? 95 : 82;
    if (c2pa.editCount > 0) {
      return { verdict: "MODIFIED", confidence };
    }
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
  if (editingSoftware.some((s) => sw.includes(s))) {
    return { verdict: "MODIFIED", confidence: 75 };
  }

  // Only flag SYNTHETIC from local heuristics if an AI software tag was
  // positively identified — missing metadata alone is not enough signal.
  const hasAISoftwareSignal = ai?.signals.some(
    (s) => s.name === "AI Generator Identified" && s.detected
  ) ?? false;

  if (hasAISoftwareSignal) {
    return { verdict: "SYNTHETIC", confidence: Math.round(aiScore * 100) };
  }

  // Real camera + timestamp = likely real, just no C2PA
  if (exif?.make && exif?.dateTimeOriginal) {
    return { verdict: "VERIFIED", confidence: 65 };
  }

  // No positive signals either way → unknown
  return { verdict: "UNKNOWN", confidence: 30 };
}
