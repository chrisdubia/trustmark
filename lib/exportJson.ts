import type { VerificationResult } from "./types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function exportVerificationJSON(result: VerificationResult): void {
  const certId = `TM-${new Date().getFullYear()}-${result.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const exportData = {
    trustmarc: {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      certificateId: certId,
      verificationUrl: `https://trustmarc.io/verify/${result.id}`,
    },
    verdict: {
      result: result.verdict,
      confidence: result.confidence,
      verifiedAt: result.verifiedAt,
      processingTime: result.processingMs,
    },
    file: {
      name: result.fileInfo.name,
      size: formatBytes(result.fileInfo.size),
      type: result.fileInfo.type,
      dimensions: result.exif?.width && result.exif?.height
        ? `${result.exif.width} × ${result.exif.height} px`
        : null,
      sha256: result.fileInfo.hash,
    },
    forensicAnalysis: {
      checks: result.forensics?.signals.map((s) => ({
        status: s.status,
        label: s.label,
        detail: s.detail,
      })) ?? [],
      captureDevice: [result.exif?.make, result.exif?.model].filter(Boolean).join(" ") || null,
      lens: result.exif?.lensModel ?? null,
      capturedAt: result.exif?.dateTimeOriginal ?? null,
      cameraSettings: [
        result.exif?.focalLength ? `${result.exif.focalLength}mm` : null,
        result.exif?.aperture ? `f/${result.exif.aperture}` : null,
        result.exif?.shutterSpeed ?? null,
        result.exif?.iso ? `ISO ${result.exif.iso}` : null,
      ].filter(Boolean).join("  ·  ") || null,
      gpsCoordinates: result.exif?.gps
        ? `${result.exif.gps.lat.toFixed(5)}, ${result.exif.gps.lon.toFixed(5)}`
        : null,
      altitude: result.exif?.altitude != null ? `${result.exif.altitude} m` : null,
      software: result.exif?.software ?? null,
    },
    aiDetection: {
      probability: Math.round((result.aiDetection?.score ?? 0) * 100),
      detected: !!(result.aiDetection?.signals?.some(
        (s) => s.name.toLowerCase().includes("ai generated") && s.detected
      )),
      source: result.aiDetection?.provider === "hive" ? "Hive AI API" : "Local heuristics",
    },
    provenance: {
      c2paManifestPresent: !!(result.c2pa?.hasCertificate),
      c2paSignatureValid: !!(result.c2pa?.valid),
      editCount: result.c2pa?.editCount ?? 0,
    },
    knownFakes: {
      previouslySeen: (result.previouslySeenCount ?? 0) > 0,
      seenCount: result.previouslySeenCount ?? 0,
      firstSeenAt: result.firstSeenAt ?? null,
      knownFake: result.knownFakeFlag ?? false,
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trustmarc-${certId}-${result.fileInfo.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
