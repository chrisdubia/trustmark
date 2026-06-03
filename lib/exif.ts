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
      pick: [
        "Make", "Model", "Software",
        "DateTimeOriginal", "DateTime", "DateTimeDigitized", "ModifyDate",
        "GPSLatitude", "GPSLongitude", "GPSLatitudeRef", "GPSLongitudeRef",
        "ImageWidth", "ImageHeight", "ExifImageWidth", "ExifImageHeight",
        "PixelXDimension", "PixelYDimension",
      ],
    });

    if (!raw) {
      return {
        make: null, model: null, software: null,
        dateTimeOriginal: null, dateTimeModified: null,
        gps: null, width: null, height: null,
        hasStrippedMetadata: true,
      };
    }

    const lat = raw.GPSLatitude ?? null;
    const lon = raw.GPSLongitude ?? null;

    const toIso = (v: unknown): string | null => {
      if (!v) return null;
      if (v instanceof Date) return v.toISOString();
      if (typeof v === "string") return v;
      return null;
    };

    return {
      make: raw.Make ?? null,
      model: raw.Model ?? null,
      software: raw.Software ?? null,
      dateTimeOriginal: toIso(raw.DateTimeOriginal ?? raw.DateTimeDigitized),
      dateTimeModified: toIso(raw.ModifyDate ?? raw.DateTime),
      gps: lat !== null && lon !== null ? { lat, lon } : null,
      width: raw.PixelXDimension ?? raw.ExifImageWidth ?? raw.ImageWidth ?? null,
      height: raw.PixelYDimension ?? raw.ExifImageHeight ?? raw.ImageHeight ?? null,
      hasStrippedMetadata: !raw.Make && !raw.Model && !raw.Software,
    };
  } catch {
    return null;
  }
}
