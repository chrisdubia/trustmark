import type { AIDetectionResult, AISignal } from "./types";

async function callHive(base64: string, mimeType: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  try {
    const buf = Buffer.from(base64, "base64");
    const blob = new Blob([buf], { type: mimeType });
    const formData = new FormData();
    formData.append("media", blob, "media");

    const res = await fetch("https://api.thehive.ai/api/v2/task/sync", {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}` },
      body: formData,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const classes: Array<{ class: string; score: number }> =
      data?.status?.[0]?.response?.output?.[0]?.classes ?? [];

    const get = (name: string) =>
      classes.find((c) => c.class === name)?.score ?? 0;

    const aiScore = get("ai_generated");
    const notAiScore = get("not_ai_generated");

    const signals: AISignal[] = [
      {
        name: "AI Generated",
        detected: aiScore > 0.5,
        detail: `${(aiScore * 100).toFixed(1)}% probability`,
      },
      {
        name: "Not AI Generated",
        detected: notAiScore > 0.5,
        detail: `${(notAiScore * 100).toFixed(1)}% probability`,
      },
    ];

    return { score: aiScore, signals, provider: "hive" };
  } catch {
    return null;
  }
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
  if (editMatch && !aiMatch) {
    signals.push({
      name: "Editing Software Detected",
      detected: true,
      detail: `"${software}" found in metadata`,
    });
  } else {
    signals.push({
      name: "Editing Software Detected",
      detected: !!editMatch,
      detail: editMatch ? `"${software}"` : undefined,
    });
  }

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
    return {
      ...local,
      unavailable: true,
    };
  }

  return local;
}
