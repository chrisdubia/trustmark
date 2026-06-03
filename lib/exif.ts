import type { ExifData } from "./types";

export async function extractExif(dataUrl: string): Promise<ExifData | null> {
  try {
    const exifr = (await import("exifr")).default;
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const buf = Buffer.from(base64, "base64");

    const raw = await exifr.parse(buf, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: true,
      jfif: false,
      ihdr: false,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
      // Parse GPS as decimal degrees automatically
      gps: true,
    });

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

    // exifr with gps:true returns latitude/longitude as decimal floats directly
    const lat: number | null = raw.latitude ?? raw.GPSLatitude ?? null;
    const lon: number | null = raw.longitude ?? raw.GPSLongitude ?? null;
    const alt: number | null = raw.GPSAltitude ?? null;

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

    return {
      make: raw.Make ?? null,
      model: raw.Model ?? null,
      software: raw.Software ?? null,
      dateTimeOriginal: toIso(raw.DateTimeOriginal ?? raw.DateTimeDigitized),
      dateTimeModified: toIso(raw.ModifyDate ?? raw.DateTime),
      gps: lat !== null && lon !== null ? { lat, lon } : null,
      altitude: alt !== null ? Math.round(toFloat(alt) ?? 0) : null,
      width: raw.PixelXDimension ?? raw.ExifImageWidth ?? raw.ImageWidth ?? null,
      height: raw.PixelYDimension ?? raw.ExifImageHeight ?? raw.ImageHeight ?? null,
      lensModel: raw.LensModel ?? null,
      focalLength: toFloat(raw.FocalLength),
      aperture: toFloat(raw.FNumber ?? raw.ApertureValue),
      shutterSpeed: raw.ExposureTime
        ? formatShutterSpeed(toFloat(raw.ExposureTime))
        : null,
      iso: raw.ISO ?? raw.ISOSpeedRatings ?? null,
      hasStrippedMetadata: !raw.Make && !raw.Model && !raw.Software,
    };
  } catch {
    return null;
  }
}

function formatShutterSpeed(seconds: number | null): string | null {
  if (seconds === null) return null;
  if (seconds >= 1) return `${seconds}s`;
  const denom = Math.round(1 / seconds);
  return `1/${denom}s`;
}
