import { NextRequest, NextResponse } from "next/server";
import { verifyC2PA } from "@/lib/c2pa";
import { detectAI } from "@/lib/aiDetection";
import { extractExif } from "@/lib/exif";
import { deriveVerdict } from "@/lib/verdict";
import { runForensics } from "@/lib/forensics";
import type { VerificationResult, VerifyRequest } from "@/lib/types";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const maxDuration = 30;

// Increase body size limit for App Router (default 4MB, images can be larger)
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: VerifyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fileName, fileType, fileSize, dataUrl } = body;

  if (!dataUrl || !fileName || !fileType) {
    return NextResponse.json(
      { error: "Missing required fields: fileName, fileType, dataUrl" },
      { status: 400 }
    );
  }

  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 50 MB." },
      { status: 413 }
    );
  }

  const supportedTypes = [
    "image/jpeg", "image/png", "image/webp",
    "image/heic", "image/heif",
    "video/mp4", "video/quicktime",
  ];
  if (!supportedTypes.includes(fileType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${fileType}` },
      { status: 415 }
    );
  }

  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const hash = createHash("sha256")
      .update(Buffer.from(base64, "base64"))
      .digest("hex");

    const [c2pa, exif] = await Promise.all([
      verifyC2PA(dataUrl),
      extractExif(dataUrl),
    ]);

    const [aiDetection] = await Promise.all([
      detectAI(dataUrl, fileType, exif?.software ?? null, !!(exif?.make)),
    ]);

    const forensics = runForensics(exif, dataUrl);

    const { verdict, confidence } = deriveVerdict(c2pa, aiDetection, exif);

    const result: VerificationResult = {
      id: uuidv4(),
      verdict,
      confidence,
      fileInfo: { name: fileName, type: fileType, size: fileSize, hash },
      c2pa,
      exif,
      aiDetection,
      forensics,
      processingMs: Date.now() - start,
      verifiedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[verify] Unexpected error:", err);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
