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
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          "relative flex flex-col items-center justify-center",
          "w-full min-h-[300px] rounded-2xl cursor-pointer",
          "transition-all duration-300 select-none outline-none",
          "border-2 border-dashed",
          isDragActive
            ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
            : disabled
            ? "border-white/10 bg-white/3 cursor-not-allowed opacity-50"
            : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]",
        ].join(" ")}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-5 px-8 text-center pointer-events-none">
          <motion.div
            animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-2xl glass flex items-center justify-center"
          >
            <svg
              className={`w-9 h-9 transition-colors ${isDragActive ? "text-blue-400" : "text-white/40"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </motion.div>

          <div>
            <p className="text-xl font-semibold text-white">
              {isDragActive ? "Release to verify" : "Drop your file here"}
            </p>
            <p className="text-sm text-white/40 mt-2">
              or{" "}
              <span className="text-blue-400 underline underline-offset-2 cursor-pointer pointer-events-auto">
                browse files
              </span>
            </p>
          </div>

          <p className="text-xs text-white/25 leading-relaxed">
            JPG · PNG · WebP · HEIC · MP4 · MOV &nbsp;·&nbsp; max 50 MB
          </p>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {rejectionMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm text-red-400 text-center"
          >
            {rejectionMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* URL paste */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <button
          onClick={() => { setShowUrlInput((v) => !v); setTimeout(() => urlRef.current?.focus(), 50); }}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
          disabled={disabled}
        >
          or paste image URL
        </button>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                ref={urlRef}
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlFetch()}
                placeholder="https://example.com/image.jpg"
                className={[
                  "flex-1 px-4 py-3 rounded-xl text-sm",
                  "bg-white/5 border border-white/10 text-white placeholder-white/25",
                  "focus:outline-none focus:border-blue-500/60 focus:bg-white/8",
                  "transition-colors",
                ].join(" ")}
                disabled={disabled || fetchingUrl}
              />
              <button
                onClick={handleUrlFetch}
                disabled={!urlInput.trim() || disabled || fetchingUrl}
                className={[
                  "px-5 py-3 rounded-xl text-sm font-medium transition-all",
                  "bg-blue-600 hover:bg-blue-500 text-white",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {fetchingUrl ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Fetching
                  </span>
                ) : "Verify"}
              </button>
            </div>
            {urlError && (
              <p className="mt-2 text-xs text-red-400">{urlError}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
