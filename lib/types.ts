export type VerdictType = "VERIFIED" | "MODIFIED" | "SYNTHETIC" | "UNKNOWN";

export interface C2PAResult {
  hasCertificate: boolean;
  issuer: string | null;
  signingTime: string | null;
  claimGenerator: string | null;
  assertions: string[];
  editCount: number;
  editHistory: EditHistoryEntry[];
  thumbnailMatch: boolean | null;
  valid: boolean;
}

export interface EditHistoryEntry {
  action: string;
  softwareAgent: string | null;
  when: string | null;
}

export interface ExifData {
  make: string | null;
  model: string | null;
  software: string | null;
  dateTimeOriginal: string | null;
  dateTimeModified: string | null;
  gps: { lat: number; lon: number } | null;
  altitude: number | null;
  width: number | null;
  height: number | null;
  lensModel: string | null;
  focalLength: number | null;
  aperture: number | null;
  shutterSpeed: string | null;
  iso: number | null;
  hasStrippedMetadata: boolean;
}

export interface AISignal {
  name: string;
  detected: boolean;
  detail?: string;
}

export interface AIDetectionResult {
  score: number;
  signals: AISignal[];
  provider: "hive" | "local" | "unavailable";
  unavailable?: boolean;
}

export interface ForensicSignal {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  detail: string;
}

export interface ForensicsResult {
  signals: ForensicSignal[];
  thumbnailMismatch: boolean | null;
  suspiciousAspectRatio: boolean;
  metadataConsistent: boolean;
  timezoneMatch: boolean | null;
  modifiedAfterCapture: boolean | null;
  estimatedOrigin: "camera" | "screenshot" | "web" | "ai_likely" | "unknown";
}

export interface VerificationResult {
  id: string;
  verdict: VerdictType;
  confidence: number;
  fileInfo: {
    name: string;
    type: string;
    size: number;
    hash: string;
  };
  c2pa: C2PAResult | null;
  exif: ExifData | null;
  aiDetection: AIDetectionResult | null;
  forensics: ForensicsResult | null;
  processingMs: number;
  verifiedAt: string;
  error?: string;
  previouslySeenCount?: number;
  firstSeenAt?: string | null;
  knownFakeFlag?: boolean;
  knownFakeMessage?: string;
}

export interface VerifyRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  // Pre-extracted EXIF from original file (before client-side canvas compression strips it)
  clientExif?: Record<string, unknown> | null;
}
