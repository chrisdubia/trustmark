"use client";

import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic",
                  "image/heif", "video/mp4", "application/pdf"];

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return "Unsupported file type. Try JPEG, PNG, WebP, HEIC, MP4, or PDF.";
    }
    if (file.size > 20 * 1024 * 1024) {
      return "File too large. Maximum size is 20 MB.";
    }
    return null;
  }, []);

  const handle = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
  }, [validate, onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  }, [disabled, handle]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handle(file);
    e.target.value = "";
  }, [handle]);

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file for verification"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        className={[
          "relative flex flex-col items-center justify-center",
          "w-full min-h-[280px] rounded-2xl border-2 border-dashed",
          "cursor-pointer transition-all duration-200 select-none",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40",
          dragging
            ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={onInputChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4 px-8 text-center pointer-events-none">
          <div className={[
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-white/10 transition-transform duration-200",
            dragging ? "scale-110" : "",
          ].join(" ")}>
            <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {dragging ? "Drop to verify" : "Drop a file here"}
            </p>
            <p className="text-sm text-white/50 mt-1">
              or <span className="text-blue-400 underline underline-offset-2">browse</span> to upload
            </p>
          </div>

          <p className="text-xs text-white/30">
            JPEG · PNG · WebP · HEIC · MP4 · PDF &nbsp;·&nbsp; max 20 MB
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400 text-center" role="alert">{error}</p>
      )}
    </div>
  );
}
