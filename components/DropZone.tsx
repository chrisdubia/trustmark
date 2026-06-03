"use client";

import { useCallback } from "react";
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

  return (
    <div style={{ width: "100%" }}>
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
    </div>
  );
}
