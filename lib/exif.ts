import type { ExifData } from "./types";

function formatSoftware(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  // iOS stores just the version number e.g. "26.5" — make it readable
  if (/^\d+\.\d+(\.\d+)?$/.test(s)) return `iOS ${s}`;
  // Android sometimes stores just a number
  if (/^\d+$/.test(s)) return `Android ${s}`;
  return s;
}

function formatShutterSpeed(seconds: number | null): string | null {
  if (seconds === null) return null;
  if (seconds >= 1) return `${seconds}s`;
  const denom = Math.round(1 / seconds);
  return `1/${denom}s`;
}

export async function extractExif(
  dataUrl: string,
  clientExif?: Record<string, unknown> | null
): Promise<ExifData | null> {
  try {
    const exifr = (await import("exifr")).default;

    // Prefer client-extracted EXIF (from original file before canvas compression strips metadata).
    // Fall back to parsing the (possibly compressed) dataUrl on the server.
    let raw: Record<string, unknown> | null | undefined;
    if (clientExif && Object.keys(clientExif).length > 0) {
      raw = clientExif;
    } else {
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      const buf = Buffer.from(base64, "base64");
      raw = await exifr.parse(buf, {
        tiff: true,
        xmp: true,
        icc: false,
        iptc: true,
        jfif: false,
        ihdr: false,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
        gps: true,
      });
    }

    if (!raw) {
      return {
        make: null, model: null, software: null,
        dateTimeOriginal: null, dateTimeModified: null,
        gps: null, altitude: null,
        width: null, height: null,
        lensModel: null, focalLength: null,
        aperture: null, shutterSpeed: null, iso: null,
        hasStrippedMetadata: true,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = raw as any;

    const toIso = (v: unknown): string | null => {
      if (!v) return null;
      if (v instanceof Date) return v.toISOString();
      if (typeof v === "string") return v;
      return null;
    };

    const toFloat = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    const toStr = (v: unknown): string | null =>
      v != null && typeof v === "string" ? v : null;

    const lat: number | null = toFloat(r.latitude ?? r.GPSLatitude);
    const lon: number | null = toFloat(r.longitude ?? r.GPSLongitude);
    const alt: number | null = toFloat(r.GPSAltitude);

    return {
      make: toStr(r.Make),
      model: toStr(r.Model),
      software: formatSoftware(toStr(r.Software)),
      dateTimeOriginal: toIso(r.DateTimeOriginal ?? r.DateTimeDigitized),
      dateTimeModified: toIso(r.ModifyDate ?? r.DateTime),
      gps: lat !== null && lon !== null ? { lat, lon } : null,
      altitude: alt !== null ? Math.round(alt) : null,
      width: toFloat(r.PixelXDimension ?? r.ExifImageWidth ?? r.ImageWidth),
      height: toFloat(r.PixelYDimension ?? r.ExifImageHeight ?? r.ImageHeight),
      lensModel: toStr(r.LensModel),
      focalLength: toFloat(r.FocalLength),
      aperture: toFloat(r.FNumber ?? r.ApertureValue),
      shutterSpeed: formatShutterSpeed(toFloat(r.ExposureTime)),
      iso: toFloat(r.ISO ?? r.ISOSpeedRatings),
      hasStrippedMetadata: !r.Make && !r.Model && !r.Software,
    };
  } catch {
    return null;
  }
}
