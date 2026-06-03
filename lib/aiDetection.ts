import type { AIDetectionResult, AISignal } from "./types";

// Hive V3 API — uses Bearer auth with the Secret Key from Playground API Keys.
// Endpoint: https://api.thehive.ai/api/v3/task/sync
// Model: "ai-generated-image-detection" (va1 model family)
async function callHive(base64: string, mimeType: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  try {
    const buf = Buffer.from(base64, "base64");
    const blob = new Blob([buf], { type: mimeType });
    const formData = new FormData();
    formData.append("media", blob, "media");

    // Try V3 first
    const v3Res = await fetch(
      "https://api.thehive.ai/api/v3/task/sync?model=ai-generated-image-detection",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (v3Res.ok) {
      const data = await v3Res.json();
      return parseHiveV3Response(data);
    }

    // Fall back to V2 format in case this is a legacy key
    const v2Res = await fetch("https://api.thehive.ai/api/v2/task/sync", {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}` },
      body: formData,
      signal: AbortSignal.timeout(10000),
    });

    if (v2Res.ok) {
      const data = await v2Res.json();
      return parseHiveV2Response(data);
    }

    return null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractClasses(d: any): Array<{ class: string; score: number }> {
  return (
    d?.status?.[0]?.response?.output?.[0]?.classes ??
    d?.output?.[0]?.classes ??
    []
  );
}

function parseHiveV3Response(data: unknown): AIDetectionResult | null {
  try {
    const d = data as Record<string, unknown>;

    // V3 response: { status: [{ response: { output: [{ classes: [...] }] } }] }
    // or: { output: [{ classes: [...] }] }
    const classes: Array<{ class: string; score: number }> =
      extractClasses(d);

    if (!classes.length) return null;
    return buildResult(classes);
  } catch {
    return null;
  }
}

function parseHiveV2Response(data: unknown): AIDetectionResult | null {
  try {
    const d = data as Record<string, unknown>;
    const classes: Array<{ class: string; score: number }> =
      extractClasses(d);

    if (!classes.length) return null;
    return buildResult(classes);
  } catch {
    return null;
  }
}

function buildResult(classes: Array<{ class: string; score: number }>): AIDetectionResult {
  const get = (name: string) =>
    classes.find((c) => c.class === name)?.score ?? 0;

  const aiScore = get("ai_generated");
  const notAiScore = get("not_ai_generated");

  // Some Hive models use different class names
  const syntheticScore = get("synthetic") || get("fake") || get("generated");
  const finalScore = Math.max(aiScore, syntheticScore);

  const signals: AISignal[] = [
    {
      name: "AI Generated",
      detected: finalScore > 0.5,
      detail: `${(finalScore * 100).toFixed(1)}% probability`,
    },
    {
      name: "Not AI Generated",
      detected: notAiScore > 0.5,
      detail: `${(notAiScore * 100).toFixed(1)}% probability`,
    },
  ];

  return { score: finalScore, signals, provider: "hive" };
}

const AI_GENERATOR_KEYWORDS = [
  { keyword: "midjourney", label: "Midjourney" },
  { keyword: "stable diffusion", label: "Stable Diffusion" },
  { keyword: "dall-e", label: "DALL-E" },
  { keyword: "dall·e", label: "DALL-E" },
  { keyword: "firefly", label: "Adobe Firefly" },
  { keyword: "imagen", label: "Google Imagen" },
  { keyword: "leonardo", label: "Leonardo AI" },
  { keyword: "runway", label: "Runway" },
  { keyword: "kling", label: "Kling" },
  { keyword: "sora", label: "Sora" },
  { keyword: "dreamstudio", label: "DreamStudio" },
  { keyword: "comfyui", label: "ComfyUI" },
  { keyword: "automatic1111", label: "AUTOMATIC1111" },
  { keyword: "invoke ai", label: "InvokeAI" },
  { keyword: "novelai", label: "NovelAI" },
];

const EDITING_SOFTWARE = [
  "photoshop", "lightroom", "gimp", "darktable",
  "capture one", "affinity photo", "snapseed", "vsco", "facetune",
  "luminar", "pixelmator", "canva",
];

function localHeuristics(
  software: string | null,
  hasCamera: boolean
): AIDetectionResult {
  const signals: AISignal[] = [];
  let score = 0;

  const sw = (software ?? "").toLowerCase();

  const aiMatch = AI_GENERATOR_KEYWORDS.find((k) => sw.includes(k.keyword));
  if (aiMatch) {
    score = 0.97;
    signals.push({
      name: "AI Generator Identified",
      detected: true,
      detail: `Software tag matches "${aiMatch.label}"`,
    });
  } else {
    signals.push({ name: "AI Generator Identified", detected: false });
  }

  const editMatch = EDITING_SOFTWARE.find((e) => sw.includes(e));
  signals.push({
    name: "Editing Software Detected",
    detected: !!editMatch,
    detail: editMatch ? `"${software}"` : undefined,
  });

  if (!hasCamera && !aiMatch) {
    score = Math.max(score, 0.25);
    signals.push({
      name: "No Camera Metadata",
      detected: true,
      detail: "Absent or stripped — common in synthetic/shared images",
    });
  } else {
    signals.push({ name: "No Camera Metadata", detected: false });
  }

  return { score, signals, provider: "local" };
}

export async function detectAI(
  dataUrl: string,
  mimeType: string,
  software: string | null,
  hasCamera: boolean
): Promise<AIDetectionResult> {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

  const hive = await callHive(base64, mimeType);
  if (hive) return hive;

  const hasKey = !!process.env.HIVE_API_KEY && process.env.HIVE_API_KEY !== "placeholder";
  const local = localHeuristics(software, hasCamera);

  if (!hasKey) {
    return { ...local, unavailable: true };
  }

  return local;
}
