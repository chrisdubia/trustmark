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
  width: number | null;
  height: number | null;
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
  processingMs: number;
  verifiedAt: string;
  error?: string;
}

export interface VerifyRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
}
