import type { AIDetectionResult, AISignal } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractClasses(d: any): Array<{ class: string; score: number }> {
  return (
    d?.status?.[0]?.response?.output?.[0]?.classes ??
    d?.output?.[0]?.classes ??
    d?.classes ??
    []
  );
}

// Hive V3 Playground API — model name goes in the URL path, not query string.
// The sf1/va1 model family for AI-generated image detection.
const HIVE_V3_MODELS = [
  "ai-generated-image-detection",
  "ai_generated_image_detection",
  "va1-ai-generated-image",
];

async function callHiveV3Json(base64: string, mimeType: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  for (const model of HIVE_V3_MODELS) {
    try {
      const res = await fetch(`https://api.thehive.ai/api/v3/task/sync/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: { binary: base64 } }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const classes = extractClasses(data);
        if (classes.length) return buildResult(classes, "hive");
      } else {
        const text = await res.text().catch(() => "");
        console.error(`[hive v3 json/${model}] ${res.status}: ${text.slice(0, 200)}`);
      }
    } catch (e) {
      console.error(`[hive v3 json/${model}] error:`, e);
    }
  }
  return null;
}

async function callHiveV3Form(base64: string, mimeType: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  for (const model of HIVE_V3_MODELS) {
    try {
      const buf = Buffer.from(base64, "base64");
      const blob = new Blob([buf], { type: mimeType });
      const formData = new FormData();
      formData.append("media", blob, "image");

      const res = await fetch(`https://api.thehive.ai/api/v3/task/sync/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const classes = extractClasses(data);
        if (classes.length) return buildResult(classes, "hive");
      } else {
        const text = await res.text().catch(() => "");
        console.error(`[hive v3 form/${model}] ${res.status}: ${text.slice(0, 200)}`);
      }
    } catch (e) {
      console.error(`[hive v3 form/${model}] error:`, e);
    }
  }
  return null;
}

async function callHiveV2(base64: string, mimeType: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  try {
    const buf = Buffer.from(base64, "base64");
    const blob = new Blob([buf], { type: mimeType });
    const formData = new FormData();
    formData.append("media", blob, "image");

    const res = await fetch("https://api.thehive.ai/api/v2/task/sync", {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}` },
      body: formData,
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const data = await res.json();
      const classes = extractClasses(data);
      if (classes.length) return buildResult(classes, "hive");
    } else {
      const text = await res.text().catch(() => "");
      console.error(`[hive v2] ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.error("[hive v2] error:", e);
  }
  return null;
}

function buildResult(
  classes: Array<{ class: string; score: number }>,
  provider: "hive"
): AIDetectionResult {
  const get = (name: string) =>
    classes.find((c) => c.class === name)?.score ?? 0;

  const aiScore = Math.max(
    get("ai_generated"),
    get("synthetic"),
    get("fake"),
    get("generated")
  );
  const notAiScore = get("not_ai_generated");
  const deepfakeScore = get("deepfake") + get("face_swap");

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

  if (deepfakeScore > 0.01) {
    signals.push({
      name: "Deepfake / Face Swap",
      detected: deepfakeScore > 0.5,
      detail: `${(deepfakeScore * 100).toFixed(1)}% probability`,
    });
  }

  return { score: aiScore, signals, provider };
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

function localHeuristics(software: string | null, hasCamera: boolean): AIDetectionResult {
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
  const hasKey = !!process.env.HIVE_API_KEY && process.env.HIVE_API_KEY !== "placeholder";

  if (hasKey) {
    // Try all Hive endpoints in order
    const result =
      (await callHiveV3Json(base64, mimeType)) ??
      (await callHiveV3Form(base64, mimeType)) ??
      (await callHiveV2(base64, mimeType));

    if (result) return result;
  }

  const local = localHeuristics(software, hasCamera);
  if (!hasKey) return { ...local, unavailable: true };
  return local;
}
