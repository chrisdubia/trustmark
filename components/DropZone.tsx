"use client";

import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
};

const MAX_SIZE = 50 * 1024 * 1024;

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_SIZE,
      maxFiles: 1,
      disabled,
    });

  const rejection = fileRejections[0]?.errors[0];
  const rejectionMessage =
    rejection?.code === "file-too-large"
      ? "File too large. Max 50 MB."
      : rejection?.code === "file-invalid-type"
      ? "Unsupported type. Use JPG, PNG, WebP, HEIC, MP4, or MOV."
      : null;

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) return;
    setUrlError(null);
    setFetchingUrl(true);
    try {
      const res = await fetch(
        `/api/fetch-url?url=${encodeURIComponent(urlInput.trim())}`
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to fetch image from URL");
      }
      const blob = await res.blob();
      const ext = urlInput.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileName = `url-image.${ext}`;
      const file = new File([blob], fileName, { type: blob.type });
      onFile(file);
      setShowUrlInput(false);
      setUrlInput("");
    } catch (e: unknown) {
      setUrlError(e instanceof Error ? e.message : "Could not load image from URL");
    } finally {
      setFetchingUrl(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: isDragActive ? "1px dashed #6B8F4E" : "1px dashed #C8C5BE",
          background: "#F8F6F1",
          borderRadius: 2,
          minHeight: 200,
          padding: 40,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
          outline: "none",
          userSelect: "none",
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        <input {...getInputProps()} />

        <svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="#D8D5CE" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ marginBottom: 16 }}
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>

        <div style={{
          fontFamily: "'Epilogue', sans-serif",
          fontWeight: 400,
          fontSize: 13,
          color: "#8A8880",
          marginBottom: 8,
          textAlign: "center",
        }}>
          {isDragActive ? "Release to verify" : "Drop file to verify"}
        </div>

        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          color: "#7A7870",
          textAlign: "center",
        }}>
          JPG · PNG · WebP · HEIC · MP4 · MOV · max 50 MB
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {rejectionMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#B85050",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {rejectionMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* URL paste — separator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "20px 0 0",
      }}>
        <div style={{ flex: 1, height: 1, background: "#D8D5CE" }} />
        <button
          onClick={() => { setShowUrlInput((v) => !v); setTimeout(() => urlRef.current?.focus(), 50); }}
          disabled={disabled}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: "#7A7870",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          or paste a URL
        </button>
        <div style={{ flex: 1, height: 1, background: "#D8D5CE" }} />
      </div>

      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginTop: 12 }}
          >
            <div style={{ display: "flex" }}>
              <input
                ref={urlRef}
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlFetch()}
                placeholder="https://example.com/image.jpg"
                style={{
                  flex: 1,
                  border: "1px solid #D8D5CE",
                  borderRight: "none",
                  background: "#F8F6F1",
                  borderRadius: "2px 0 0 2px",
                  padding: "10px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "#1C1C1A",
                  outline: "none",
                }}
                disabled={disabled || fetchingUrl}
              />
              <button
                onClick={handleUrlFetch}
                disabled={!urlInput.trim() || disabled || fetchingUrl}
                style={{
                  background: "#1C1C1A",
                  color: "#F2F0EB",
                  border: "1px solid #1C1C1A",
                  borderRadius: "0 2px 2px 0",
                  padding: "10px 20px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: (!urlInput.trim() || disabled || fetchingUrl) ? "not-allowed" : "pointer",
                  opacity: (!urlInput.trim() || disabled || fetchingUrl) ? 0.4 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {fetchingUrl ? "Fetching..." : "Verify"}
              </button>
            </div>
            {urlError && (
              <p style={{
                marginTop: 6,
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "#B85050",
              }}>{urlError}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
