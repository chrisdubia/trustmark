import type { AIDetectionResult, AISignal } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractClasses(d: any): Array<{ class: string; score: number }> {
  // Always log full response to diagnose structure
  console.log("[hive] raw response (full):", JSON.stringify(d));

  // V3 response: {status:[{response:{output:[{classes:[...]}]}}]}
  // V3 alt: classes nested under each output item directly
  const outputs =
    d?.status?.[0]?.response?.output ??
    d?.output ??
    (Array.isArray(d) ? d?.[0]?.status?.[0]?.response?.output : null) ??
    [];

  // Collect classes from all output items (flatten)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const out of outputs as any[]) {
    const classes = out?.classes ?? out?.input?.classes;
    if (Array.isArray(classes) && classes.length > 0) {
      console.log("[hive] found classes:", JSON.stringify(classes));
      return classes;
    }
  }

  // Direct fallbacks
  const direct = d?.classes ?? d?.status?.[0]?.classes ?? [];
  if (direct.length > 0) {
    console.log("[hive] found direct classes:", JSON.stringify(direct));
    return direct;
  }

  console.log("[hive] no classes found in response");
  return [];
}

// Hive V3 Playground API — model name goes in the URL path, not query string.
// The sf1/va1 model family for AI-generated image detection.
const HIVE_V3_ENDPOINT =
  "https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection";

// Resize image to max 1024px on longest side and re-encode as JPEG at 85%
// to keep payload under Hive's size limit (~1.5MB).
async function resizeImage(base64: string, mimeType: string): Promise<{ base64: string; mime: string }> {
  try {
    const sharp = (await import("sharp")).default;
    const buf = Buffer.from(base64, "base64");
    const resized = await sharp(buf)
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { base64: resized.toString("base64"), mime: "image/jpeg" };
  } catch {
    // sharp not available — return original truncated to avoid timeout
    return { base64, mime: mimeType };
  }
}

async function callHiveV3Form(base64: string, mimeType: string): Promise<AIDetectionResult | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  try {
    const { base64: resizedB64, mime } = await resizeImage(base64, mimeType);
    const buf = Buffer.from(resizedB64, "base64");

    // Try both field names Hive might expect
    for (const fieldName of ["media", "image", "file"]) {
      const blob = new Blob([buf], { type: mime });
      const formData = new FormData();
      formData.append(fieldName, blob, `image.jpg`);

      const res = await fetch(HIVE_V3_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        const classes = extractClasses(data);
        if (classes.length) return buildResult(classes, "hive");
        console.error(`[hive v3 form/${fieldName}] 200 no classes:`, JSON.stringify(data).slice(0, 300));
      } else {
        const text = await res.text().catch(() => "");
        console.error(`[hive v3 form/${fieldName}] ${res.status}: ${text.slice(0, 200)}`);
        // Don't retry other field names if auth fails
        if (res.status === 401 || res.status === 403) break;
      }
    }
  } catch (e) {
    console.error("[hive v3 form] error:", e);
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
  // Normalize: lowercase + replace spaces/hyphens with underscores
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-]+/g, "_");
  const get = (...names: string[]) => {
    const targets = names.map(normalize);
    return classes.find((c) => targets.includes(normalize(c.class)))?.score ?? 0;
  };

  console.log("[hive] classes for scoring:", JSON.stringify(classes.map(c => ({ class: c.class, score: c.score }))));

  const aiScore = Math.max(
    get("ai_generated", "ai generated", "synthetic", "fake", "generated", "ai"),
  );
  const notAiScore = get("not_ai_generated", "not ai generated", "real", "authentic");
  const deepfakeScore = get("deepfake", "deep_fake", "face_swap", "face swap");

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
    // Try Hive V3 form, then V2 as fallback
    const result =
      (await callHiveV3Form(base64, mimeType)) ??
      (await callHiveV2(base64, mimeType));

    if (result) return result;
  }

  const local = localHeuristics(software, hasCamera);
  if (!hasKey) return { ...local, unavailable: true };
  return local;
}
