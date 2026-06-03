export type VerdictType = "REAL" | "AI_GENERATED" | "EDITED" | "UNKNOWN";

export interface C2PAResult {
  hasCertificate: boolean;
  issuer: string | null;
  signingTime: string | null;
  claimGenerator: string | null;
  assertions: string[];
  thumbnailMatch: boolean | null;
  valid: boolean;
}

export interface ExifData {
  make: string | null;
  model: string | null;
  software: string | null;
  dateTime: string | null;
  gps: { lat: number; lon: number } | null;
  width: number | null;
  height: number | null;
  hasStrippedMetadata: boolean;
}

export interface AIDetectionResult {
  score: number; // 0–1, where 1 = definitely AI
  signals: AISignal[];
  provider: "hive" | "sightengine" | "local" | null;
}

export interface AISignal {
  name: string;
  detected: boolean;
  detail?: string;
}

export interface VerificationResult {
  verdict: VerdictType;
  confidence: number; // 0–100
  fileInfo: {
    name: string;
    type: string;
    size: number;
    hash: string;
  };
  c2pa: C2PAResult | null;
  exif: ExifData | null;
  aiDetection: AIDetectionResult | null;
  processingMs: number;
  error?: string;
}

export interface VerifyRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string; // base64 — never stored server-side
}
