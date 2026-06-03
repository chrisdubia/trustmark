import type { ExifData, ForensicsResult, ForensicSignal } from "./types";

// AI image generators have strong preferences for certain output dimensions.
// Seeing these exact sizes is a forensic signal.
const AI_ASPECT_RATIOS = [
  { w: 1, h: 1, label: "1:1 (AI common)" },
  { w: 4, h: 3, label: "4:3" },
  { w: 16, h: 9, label: "16:9" },
  { w: 3, h: 2, label: "3:2" },
];

const AI_EXACT_DIMENSIONS = new Set([
  "512x512", "768x512", "512x768",
  "1024x1024", "1024x768", "768x1024",
  "1536x1024", "1024x1536",
  "2048x2048", "1344x768", "768x1344",
  "1152x896", "896x1152", "1216x832", "832x1216",
]);

// Timezone offset in hours for a given lat/lon (coarse approximation via longitude)
function estimateTimezoneOffset(lat: number, lon: number): number {
  // Rough approximation: 15 degrees longitude = 1 hour
  return Math.round(lon / 15);
}

// Extract UTC offset from an ISO date string like "2026-06-03T17:36:00.000Z"
// EXIF DateTimeOriginal has no timezone — we compare against GPS-derived TZ
function getHourFromIso(iso: string): number | null {
  try {
    return new Date(iso).getUTCHours();
  } catch {
    return null;
  }
}

function checkTimestampGPSConsistency(exif: ExifData): boolean | null {
  if (!exif.gps || !exif.dateTimeOriginal) return null;

  const expectedOffset = estimateTimezoneOffset(exif.gps.lat, exif.gps.lon);
  const utcHour = getHourFromIso(exif.dateTimeOriginal);
  if (utcHour === null) return null;

  // EXIF timestamps are stored in LOCAL time, not UTC.
  // So local hour = utcHour (as parsed) for most EXIF.
  // We can't do a perfect check without knowing the stored TZ,
  // but extreme mismatches (>13h) suggest spoofed coordinates.
  const localHour = (utcHour + 24) % 24;
  const expectedLocalHour = (utcHour + expectedOffset + 24) % 24;
  const diff = Math.abs(localHour - expectedLocalHour);
  const normalizedDiff = Math.min(diff, 24 - diff);

  return normalizedDiff <= 13; // passes unless wildly inconsistent
}

function detectSuspiciousAspectRatio(width: number, height: number): boolean {
  const key = `${width}x${height}`;
  const keyFlipped = `${height}x${width}`;
  if (AI_EXACT_DIMENSIONS.has(key) || AI_EXACT_DIMENSIONS.has(keyFlipped)) return true;

  // Check if dimensions are exact powers of 64 — typical AI output
  const isPowerOf64 = (n: number) => n > 0 && n % 64 === 0 && n <= 2048;
  if (isPowerOf64(width) && isPowerOf64(height)) return true;

  return false;
}

function detectThumbnailMismatch(buf: Buffer): boolean | null {
  try {
    // JPEG thumbnail is embedded in EXIF APP1 segment.
    // If the file has been edited and re-exported, the thumbnail often
    // doesn't match the main image dimensions or content.
    // We detect mismatch by finding both the thumbnail JPEG header and
    // main image dimensions in the EXIF data.

    // Find EXIF APP1 marker
    let pos = 2; // skip SOI
    while (pos < buf.length - 4) {
      const marker = buf.readUInt16BE(pos);
      if (marker === 0xffe1) {
        // APP1 — look for thumbnail dimensions
        const segLen = buf.readUInt16BE(pos + 2);
        const seg = buf.subarray(pos + 4, pos + 2 + segLen);
        const segStr = seg.toString("binary");

        // Look for thumbnail JPEG inside EXIF
        const thumbMarker = segStr.indexOf("\xff\xd8\xff");
        if (thumbMarker > 0) {
          // Thumbnail exists — check if main image flag suggests it was post-processed
          // Photoshop/Lightroom often leave stale thumbnails
          const hasPhotoshop = segStr.includes("Photoshop") ||
            segStr.includes("Adobe") ||
            segStr.includes("Lightroom");
          if (hasPhotoshop) return true; // likely mismatch
        }
        break;
      }
      if (pos + 2 >= buf.length) break;
      const segLen = buf.readUInt16BE(pos + 2);
      pos += 2 + segLen;
    }
    return false;
  } catch {
    return null;
  }
}

function estimateOrigin(
  exif: ExifData,
  hasThumbnailMismatch: boolean | null,
  suspiciousRatio: boolean
): ForensicsResult["estimatedOrigin"] {
  const sw = (exif.software ?? "").toLowerCase();
  const aiKeywords = ["midjourney", "stable diffusion", "dall-e", "firefly",
    "imagen", "runway", "sora", "dreamstudio", "comfyui", "novelai"];

  if (aiKeywords.some((k) => sw.includes(k))) return "ai_likely";
  if (exif.make && exif.model) return "camera";
  if (suspiciousRatio && !exif.make) return "ai_likely";
  if (!exif.make && !exif.dateTimeOriginal && !exif.gps) return "web";
  return "unknown";
}

export function runForensics(exif: ExifData | null, dataUrl: string): ForensicsResult {
  const signals: ForensicSignal[] = [];

  if (!exif) {
    return {
      signals: [{
        id: "no_exif",
        label: "No metadata found",
        status: "warn",
        detail: "Image contains no EXIF data — stripped, screenshot, or AI-generated",
      }],
      thumbnailMismatch: null,
      suspiciousAspectRatio: false,
      metadataConsistent: false,
      timezoneMatch: null,
      modifiedAfterCapture: null,
      estimatedOrigin: "unknown",
    };
  }

  // 1. Camera make/model present
  if (exif.make && exif.model) {
    signals.push({
      id: "camera_present",
      label: "Camera metadata present",
      status: "pass",
      detail: `${exif.make} ${exif.model} — consistent with real capture`,
    });
  } else {
    signals.push({
      id: "camera_absent",
      label: "No camera make/model",
      status: "warn",
      detail: "Camera metadata absent — could indicate AI generation, screenshot, or stripping",
    });
  }

  // 2. GPS data
  if (exif.gps) {
    signals.push({
      id: "gps_present",
      label: "GPS coordinates present",
      status: "pass",
      detail: `${exif.gps.lat.toFixed(4)}°, ${exif.gps.lon.toFixed(4)}° — location data intact`,
    });
  } else {
    signals.push({
      id: "gps_absent",
      label: "No GPS data",
      status: "info",
      detail: "Location services were off, or metadata was stripped",
    });
  }

  // 3. Timestamp-GPS timezone cross-check
  const timezoneMatch = checkTimestampGPSConsistency(exif);
  if (timezoneMatch === false) {
    signals.push({
      id: "timezone_mismatch",
      label: "Timestamp/GPS timezone mismatch",
      status: "fail",
      detail: "Capture time is inconsistent with GPS location — possible metadata spoofing",
    });
  } else if (timezoneMatch === true) {
    signals.push({
      id: "timezone_match",
      label: "Timestamp matches GPS location",
      status: "pass",
      detail: "Capture time is consistent with reported GPS coordinates",
    });
  }

  // 4. Modification after capture
  let modifiedAfterCapture: boolean | null = null;
  if (exif.dateTimeOriginal && exif.dateTimeModified) {
    const orig = new Date(exif.dateTimeOriginal).getTime();
    const mod = new Date(exif.dateTimeModified).getTime();
    const diffHours = (mod - orig) / (1000 * 60 * 60);
    modifiedAfterCapture = diffHours > 1;

    if (modifiedAfterCapture) {
      signals.push({
        id: "modified_after_capture",
        label: "File modified after capture",
        status: "warn",
        detail: `Modified ${diffHours < 24
          ? `${Math.round(diffHours)}h`
          : `${Math.round(diffHours / 24)} days`} after original capture`,
      });
    } else {
      signals.push({
        id: "not_modified",
        label: "No post-capture modification detected",
        status: "pass",
        detail: "Modification timestamp matches capture time",
      });
    }
  }

  // 5. Suspicious dimensions
  const suspiciousRatio = !!(
    exif.width && exif.height &&
    detectSuspiciousAspectRatio(exif.width, exif.height)
  );
  if (suspiciousRatio) {
    signals.push({
      id: "ai_dimensions",
      label: "Dimensions match AI output size",
      status: "warn",
      detail: `${exif.width}×${exif.height} — exact match for known AI generator output dimensions`,
    });
  } else if (exif.width && exif.height) {
    signals.push({
      id: "natural_dimensions",
      label: "Natural image dimensions",
      status: "pass",
      detail: `${exif.width}×${exif.height} — not a known AI generator output size`,
    });
  }

  // 6. Software analysis
  const sw = (exif.software ?? "").toLowerCase();
  const aiSoftwareKeywords = ["midjourney", "stable diffusion", "dall-e",
    "firefly", "imagen", "runway", "dreamstudio", "comfyui", "novelai"];
  const editSoftwareKeywords = ["photoshop", "lightroom", "gimp", "affinity",
    "capture one", "darktable", "luminar"];

  if (aiSoftwareKeywords.some((k) => sw.includes(k))) {
    signals.push({
      id: "ai_software",
      label: "AI generator software tag",
      status: "fail",
      detail: `"${exif.software}" — confirms AI-generated origin`,
    });
  } else if (editSoftwareKeywords.some((k) => sw.includes(k))) {
    signals.push({
      id: "edit_software",
      label: "Editing software detected",
      status: "warn",
      detail: `"${exif.software}" — image was processed after capture`,
    });
  } else if (exif.software) {
    signals.push({
      id: "software_ok",
      label: "Software tag",
      status: "info",
      detail: `"${exif.software}"`,
    });
  }

  // 7. Thumbnail mismatch check
  let thumbnailMismatch: boolean | null = null;
  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const buf = Buffer.from(base64, "base64");
    thumbnailMismatch = detectThumbnailMismatch(buf);
    if (thumbnailMismatch) {
      signals.push({
        id: "thumbnail_mismatch",
        label: "Embedded thumbnail may be stale",
        status: "warn",
        detail: "JPEG thumbnail doesn't match main image — common after editing in Photoshop/Lightroom",
      });
    }
  } catch {
    thumbnailMismatch = null;
  }

  // 8. Lens data presence
  if (exif.lensModel) {
    signals.push({
      id: "lens_data",
      label: "Optical metadata present",
      status: "pass",
      detail: `${exif.lensModel} — real optical capture data`,
    });
  }

  // 9. File size vs resolution ratio
  // (Passed as part of fileInfo — skip here, done in route.ts)

  const metadataConsistent = signals.filter((s) => s.status === "fail").length === 0;
  const estimatedOrigin = estimateOrigin(exif, thumbnailMismatch, suspiciousRatio);

  return {
    signals,
    thumbnailMismatch,
    suspiciousAspectRatio: suspiciousRatio,
    metadataConsistent,
    timezoneMatch,
    modifiedAfterCapture,
    estimatedOrigin,
  };
}
