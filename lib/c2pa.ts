import type { C2PAResult } from "./types";

// C2PA (Coalition for Content Provenance and Authenticity) markers are embedded
// as XMP metadata in JPEG/PNG/HEIC files. We parse the raw binary for known
// C2PA signatures without pulling in the full c2pa-node SDK (which requires
// native bindings not available in Vercel edge).

const C2PA_MANIFEST_STORE_MARKER = "c2pa.manifest";
const JUMBF_MARKER = Buffer.from([0x6a, 0x75, 0x6d, 0x62]); // "jumb"
const C2PA_LABEL = "c2pa";

function bufferFromBase64(dataUrl: string): Buffer {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  return Buffer.from(base64, "base64");
}

function scanForC2PAMarkers(buf: Buffer): {
  found: boolean;
  claimGenerator: string | null;
  assertions: string[];
} {
  const str = buf.toString("binary");
  const found =
    str.includes(C2PA_MANIFEST_STORE_MARKER) ||
    str.includes("c2pa.actions") ||
    str.includes("c2pa.hash") ||
    buf.includes(JUMBF_MARKER);

  const assertions: string[] = [];
  const assertionPatterns = [
    "c2pa.actions",
    "c2pa.hash.data",
    "c2pa.hash.bmff",
    "c2pa.thumbnail",
    "stds.schema-org.CreativeWork",
    "c2pa.training-mining",
    "c2pa.ai-generative-training",
  ];
  for (const pattern of assertionPatterns) {
    if (str.includes(pattern)) assertions.push(pattern);
  }

  // Extract claim generator string if present
  let claimGenerator: string | null = null;
  const cgMatch = str.match(/claim_generator[":]+\s*([^\x00"\\]{3,80})/);
  if (cgMatch) claimGenerator = cgMatch[1].trim();

  return { found, claimGenerator, assertions };
}

function extractXMPField(buf: Buffer, field: string): string | null {
  const str = buf.toString("utf8", 0, Math.min(buf.length, 65536));
  const pattern = new RegExp(`<[^>]*${field}[^>]*>([^<]{1,200})<`, "i");
  const match = str.match(pattern);
  return match ? match[1].trim() : null;
}

export async function verifyC2PA(dataUrl: string): Promise<C2PAResult> {
  try {
    const buf = bufferFromBase64(dataUrl);
    const { found, claimGenerator, assertions } = scanForC2PAMarkers(buf);

    if (!found) {
      return {
        hasCertificate: false,
        issuer: null,
        signingTime: null,
        claimGenerator: null,
        assertions: [],
        thumbnailMatch: null,
        valid: false,
      };
    }

    const issuer =
      extractXMPField(buf, "dc:creator") ||
      extractXMPField(buf, "photoshop:Credit") ||
      null;

    const signingTime =
      extractXMPField(buf, "xmp:CreateDate") ||
      extractXMPField(buf, "photoshop:DateCreated") ||
      null;

    const thumbnailMatch = assertions.includes("c2pa.thumbnail")
      ? true
      : null;

    return {
      hasCertificate: true,
      issuer,
      signingTime,
      claimGenerator,
      assertions,
      thumbnailMatch,
      valid: assertions.length > 0,
    };
  } catch {
    return {
      hasCertificate: false,
      issuer: null,
      signingTime: null,
      claimGenerator: null,
      assertions: [],
      thumbnailMatch: null,
      valid: false,
    };
  }
}
