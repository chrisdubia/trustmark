import { NextRequest, NextResponse } from "next/server";
import { verifyC2PA } from "@/lib/c2pa";
import { detectAI } from "@/lib/aiDetection";
import type { VerificationResult, VerifyRequest, VerdictType, ExifData } from "@/lib/types";
import { createHash } from "crypto";

// Dynamic import of exifr — it's a client-friendly ESM package
// that also works in Node.js server context.
async function parseExif(dataUrl: string): Promise<ExifData | null> {
  try {
    const exifr = (await import("exifr")).default;
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const buf = Buffer.from(base64, "base64");

    const raw = await exifr.parse(buf, {
      pick: ["Make", "Model", "Software", "DateTimeOriginal", "DateTime",
             "GPSLatitude", "GPSLongitude", "ImageWidth", "ImageHeight",
             "ExifImageWidth", "ExifImageHeight"],
    });

    if (!raw) {
      return {
        make: null, model: null, software: null, dateTime: null,
        gps: null, width: null, height: null, hasStrippedMetadata: true,
      };
    }

    const lat = raw.GPSLatitude ?? null;
    const lon = raw.GPSLongitude ?? null;

    return {
      make: raw.Make ?? null,
      model: raw.Model ?? null,
      software: raw.Software ?? null,
      dateTime: raw.DateTimeOriginal?.toISOString?.() ?? raw.DateTime ?? null,
      gps: lat !== null && lon !== null ? { lat, lon } : null,
      width: raw.ImageWidth ?? raw.ExifImageWidth ?? null,
      height: raw.ImageHeight ?? raw.ExifImageHeight ?? null,
      hasStrippedMetadata: !raw.Make && !raw.Model,
    };
  } catch {
    return null;
  }
}

function deriveVerdict(
  c2paValid: boolean,
  aiScore: number,
  exif: ExifData | null
): { verdict: VerdictType; confidence: number } {
  // AI score above 0.7 → AI_GENERATED
  if (aiScore >= 0.7) {
    return { verdict: "AI_GENERATED", confidence: Math.round(aiScore * 100) };
  }

  // Confirmed C2PA chain → REAL
  if (c2paValid) {
    return { verdict: "REAL", confidence: 92 };
  }

  // Software tag implies post-processing
  const editingSoftware = ["photoshop", "lightroom", "gimp", "darktable",
    "capture one", "affinity", "snapseed", "vsco", "facetune"];
  const sw = (exif?.software ?? "").toLowerCase();
  if (editingSoftware.some((s) => sw.includes(s))) {
    return { verdict: "EDITED", confidence: 78 };
  }

  // Moderate AI suspicion
  if (aiScore >= 0.35) {
    return { verdict: "AI_GENERATED", confidence: Math.round(aiScore * 100) };
  }

  // Has real camera metadata and no red flags
  if (exif?.make && exif?.dateTime) {
    return { verdict: "REAL", confidence: 72 };
  }

  return { verdict: "UNKNOWN", confidence: 40 };
}

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: VerifyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fileName, fileType, fileSize, dataUrl } = body;

  if (!dataUrl || !fileName || !fileType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 20 MB cap
  if (fileSize > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
  }

  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const hash = createHash("sha256").update(Buffer.from(base64, "base64")).digest("hex");

  const [c2pa, exif] = await Promise.all([
    verifyC2PA(dataUrl),
    parseExif(dataUrl),
  ]);

  const aiDetection = await detectAI(dataUrl, exif?.software ?? null, !!exif?.make);

  const { verdict, confidence } = deriveVerdict(
    c2pa?.valid ?? false,
    aiDetection.score,
    exif
  );

  const result: VerificationResult = {
    verdict,
    confidence,
    fileInfo: { name: fileName, type: fileType, size: fileSize, hash },
    c2pa,
    exif,
    aiDetection,
    processingMs: Date.now() - start,
  };

  return NextResponse.json(result);
}
