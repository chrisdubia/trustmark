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
    <div style={{ borderTop: "1px solid #D8D5CE", paddingTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#7A7870",
        }}>
          Error Level Analysis
        </div>
        {elaUrl && (
          <button
            onClick={() => setShowEla((v) => !v)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#4A7A9B",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showEla ? "Show original" : "Show ELA"}
          </button>
        )}
      </div>

      <div style={{
        background: "#1C1C1A",
        borderRadius: 2,
        overflow: "hidden",
        minHeight: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {loading && (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#B0ADA6",
            textAlign: "center",
            padding: "32px 0",
          }}>
            Computing ELA…
          </div>
        )}

        {error && (
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#B0ADA6",
            padding: "32px 0",
          }}>ELA not available for this file type</p>
        )}

        {!loading && !error && elaUrl && (
          <motion.div
            key={showEla ? "ela" : "orig"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: "100%" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showEla ? elaUrl : imageUrl}
              alt={showEla ? "Error Level Analysis heatmap" : "Original image"}
              style={{ width: "100%", objectFit: "contain", maxHeight: 256, display: "block" }}
            />
          </motion.div>
        )}
      </div>

      {elaUrl && (
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "#5A5855",
          marginTop: 8,
        }}>
          {showEla
            ? "Bright regions indicate potential edits or compositing. Uniform texture = authentic."
            : 'Click “Show ELA” to reveal a heatmap of compression anomalies.'}
        </p>
      )}
    </div>
  );
}
