"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ELAViewerProps {
  imageUrl: string;
}

// Error Level Analysis — recompresses the image at a known quality and computes
// per-pixel difference. Edited regions (composited, cloned, or AI-filled) show
// higher error levels than untouched original pixels.
async function computeELA(
  imageUrl: string,
  quality = 0.75,
  amplify = 12
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { width, height } = img;

      // Draw original
      const origCanvas = document.createElement("canvas");
      origCanvas.width = width;
      origCanvas.height = height;
      const origCtx = origCanvas.getContext("2d")!;
      origCtx.drawImage(img, 0, 0);
      const origData = origCtx.getImageData(0, 0, width, height);

      // Re-compress at known quality
      const recompressed = origCanvas.toDataURL("image/jpeg", quality);

      const reImg = new window.Image();
      reImg.onload = () => {
        const reCanvas = document.createElement("canvas");
        reCanvas.width = width;
        reCanvas.height = height;
        const reCtx = reCanvas.getContext("2d")!;
        reCtx.drawImage(reImg, 0, 0);
        const reData = reCtx.getImageData(0, 0, width, height);

        // Compute amplified difference
        const diffCanvas = document.createElement("canvas");
        diffCanvas.width = width;
        diffCanvas.height = height;
        const diffCtx = diffCanvas.getContext("2d")!;
        const diffData = diffCtx.createImageData(width, height);

        for (let i = 0; i < origData.data.length; i += 4) {
          const dr = Math.abs(origData.data[i] - reData.data[i]) * amplify;
          const dg = Math.abs(origData.data[i + 1] - reData.data[i + 1]) * amplify;
          const db = Math.abs(origData.data[i + 2] - reData.data[i + 2]) * amplify;

          // Map to heat colors: low diff = dark blue, high diff = red/white
          const magnitude = Math.min(255, (dr + dg + db) / 3);
          diffData.data[i] = Math.min(255, magnitude * 2);       // R
          diffData.data[i + 1] = Math.min(255, magnitude * 0.5); // G
          diffData.data[i + 2] = Math.max(0, 180 - magnitude);   // B
          diffData.data[i + 3] = 255;
        }

        diffCtx.putImageData(diffData, 0, 0);
        resolve(diffCanvas.toDataURL("image/png"));
      };
      reImg.onerror = reject;
      reImg.src = recompressed;
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

export default function ELAViewer({ imageUrl }: ELAViewerProps) {
  const [elaUrl, setElaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showEla, setShowEla] = useState(false);
  const computed = useRef(false);

  useEffect(() => {
    if (computed.current) return;
    computed.current = true;
    setLoading(true);

    computeELA(imageUrl)
      .then((url) => {
        setElaUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [imageUrl]);

  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">
            Error Level Analysis
          </h3>
          <p className="text-xs text-white/20 mt-0.5">
            Bright regions indicate potential edits or compositing
          </p>
        </div>
        {elaUrl && (
          <button
            onClick={() => setShowEla((v) => !v)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0 ml-4"
          >
            {showEla ? "Show original" : "Show ELA"}
          </button>
        )}
      </div>

      <div className="relative rounded-lg overflow-hidden bg-black/30 min-h-[160px] flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-white/30 py-8">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs">Computing ELA…</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-white/20 py-8">ELA not available for this file type</p>
        )}

        {!loading && !error && elaUrl && (
          <motion.div
            key={showEla ? "ela" : "orig"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showEla ? elaUrl : imageUrl}
              alt={showEla ? "Error Level Analysis heatmap" : "Original image"}
              className="w-full object-contain max-h-64"
            />
            {showEla && (
              <div className="absolute bottom-2 right-2 flex items-center gap-3 bg-black/60 rounded-lg px-3 py-1.5">
                <span className="text-xs text-white/50">Low</span>
                <div className="w-16 h-2 rounded-full" style={{
                  background: "linear-gradient(to right, #1a0060, #8800ff, #ff4400, #ffffff)"
                }} />
                <span className="text-xs text-white/50">High</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {elaUrl && !showEla && (
        <p className="text-xs text-white/20">
          Click "Show ELA" to reveal a heatmap of compression anomalies.
          Uniform texture = authentic. Bright patches = possible manipulation.
        </p>
      )}
    </div>
  );
}
