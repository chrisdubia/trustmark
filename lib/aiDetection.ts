import type { AIDetectionResult, AISignal } from "./types";

// Calls Hive Moderation API if HIVE_API_KEY is set, otherwise falls back to
// SightEngine if SIGHTENGINE_API_USER/SECRET are set, otherwise runs local
// heuristics only. Results are never stored.

async function callHive(base64Image: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey) return null;

  try {
    const formData = new FormData();
    const blob = new Blob([Buffer.from(base64Image, "base64")], {
      type: "image/jpeg",
    });
    formData.append("media", blob, "image.jpg");

    const res = await fetch("https://api.thehive.ai/api/v2/task/sync", {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}` },
      body: formData,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    const classes: Array<{ class: string; score: number }> =
      data?.status?.[0]?.response?.output?.[0]?.classes ?? [];

    const aiClass = classes.find((c) => c.class === "ai_generated");
    const score = aiClass?.score ?? 0;

    const signals: AISignal[] = [
      {
        name: "AI Generated",
        detected: score > 0.5,
        detail: `${(score * 100).toFixed(1)}% confidence`,
      },
    ];

    return { score, signals, provider: "hive" };
  } catch {
    return null;
  }
}

async function callSightEngine(
  base64Image: string
): Promise<AIDetectionResult | null> {
  const user = process.env.SIGHTENGINE_API_USER;
  const secret = process.env.SIGHTENGINE_API_SECRET;
  if (!user || !secret) return null;

  try {
    const formData = new FormData();
    const blob = new Blob([Buffer.from(base64Image, "base64")], {
      type: "image/jpeg",
    });
    formData.append("media", blob, "image.jpg");
    formData.append("models", "genai");
    formData.append("api_user", user);
    formData.append("api_secret", secret);

    const res = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    const score: number = data?.type?.ai_generated ?? 0;
    const signals: AISignal[] = [
      {
        name: "AI Generated",
        detected: score > 0.5,
        detail: `${(score * 100).toFixed(1)}% confidence`,
      },
      {
        name: "GAN Synthetic",
        detected: (data?.type?.gan ?? 0) > 0.5,
      },
    ];

    return { score, signals, provider: "sightengine" };
  } catch {
    return null;
  }
}

// Local heuristics based on metadata signals — not a real classifier,
// but surfaces meaningful signals when no API key is present.
function localHeuristics(
  softwareTag: string | null,
  hasExif: boolean
): AIDetectionResult {
  const signals: AISignal[] = [];
  let score = 0;

  const aiSoftwareKeywords = [
    "midjourney",
    "stable diffusion",
    "dall-e",
    "firefly",
    "imagen",
    "leonardo",
    "runway",
    "kling",
    "sora",
    "gen-2",
    "dreamstudio",
  ];

  const softwareLower = (softwareTag ?? "").toLowerCase();
  const aiSoftwareMatch = aiSoftwareKeywords.find((kw) =>
    softwareLower.includes(kw)
  );

  if (aiSoftwareMatch) {
    score = 0.95;
    signals.push({
      name: "AI Software Tag",
      detected: true,
      detail: `"${softwareTag}" matches known AI generator`,
    });
  } else {
    signals.push({ name: "AI Software Tag", detected: false });
  }

  if (!hasExif) {
    score = Math.max(score, 0.3);
    signals.push({
      name: "No Camera Metadata",
      detected: true,
      detail: "Metadata absent or stripped — common in AI images",
    });
  } else {
    signals.push({ name: "No Camera Metadata", detected: false });
  }

  return { score, signals, provider: "local" };
}

export async function detectAI(
  dataUrl: string,
  softwareTag: string | null,
  hasExif: boolean
): Promise<AIDetectionResult> {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

  const [hive, sight] = await Promise.all([
    callHive(base64),
    callSightEngine(base64),
  ]);

  if (hive) return hive;
  if (sight) return sight;

  return localHeuristics(softwareTag, hasExif);
}
