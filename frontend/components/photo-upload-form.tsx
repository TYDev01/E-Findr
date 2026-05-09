"use client";

import { LoaderCircle, UploadCloud, X, CheckCircle, AlertCircle, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

import { getClientAuthHeaders } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

const MAX_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type FileEntry = {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoUploadForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(
      (f) => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE_BYTES
    );
    setEntries((prev) => {
      const existing = new Set(prev.map((e) => e.file.name + e.file.size));
      const fresh = valid
        .filter((f) => !existing.has(f.name + f.size))
        .map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          status: "pending" as const,
        }));
      return [...prev, ...fresh];
    });
  }, []);

  const removeEntry = (index: number) => {
    setEntries((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = () => {
    if (!entries.length) return;

    setUploadResult(null);
    setEntries((prev) => prev.map((e) => ({ ...e, status: "uploading" })));

    const payload = new FormData();
    entries.forEach((e) => payload.append("photos", e.file));

    startTransition(() => {
      void (async () => {
        const response = await fetch(
          `${API_URL}/api/events/${eventId}/photos/upload`,
          {
            method: "POST",
            headers: { ...getClientAuthHeaders() },
            body: payload,
          }
        );

        if (!response.ok) {
          setEntries((prev) => prev.map((e) => ({ ...e, status: "error" })));
          setUploadResult("Upload failed. Check file types, sizes, and R2 credentials.");
          return;
        }

        const data = (await response.json()) as { queued_jobs: number };
        setEntries((prev) => prev.map((e) => ({ ...e, status: "done" })));
        setUploadResult(
          `${data.queued_jobs} photo${data.queued_jobs !== 1 ? "s" : ""} uploaded and queued for AI indexing.`
        );
        router.refresh();
      })();
    });
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0);

  return (
    <div className="grid gap-4">
      {/* Drop zone */}
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-5 py-8 text-center transition-colors ${
          isDragging
            ? "border-fern bg-fern/5"
            : "border-ink/20 bg-mist hover:border-fern/50 hover:bg-fern/5"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud className="h-8 w-8 text-fern" />
        <p className="mt-4 font-semibold">Drop photos here or click to browse</p>
        <p className="mt-1 text-sm text-ink/60">JPG, PNG, WEBP · up to 15 MB each · unlimited files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>

      {/* File list */}
      {entries.length > 0 && (
        <div className="rounded-[20px] border border-ink/10 bg-white/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {entries.length} file{entries.length !== 1 ? "s" : ""} selected
              <span className="ml-2 font-normal text-ink/50">({formatBytes(totalSize)})</span>
            </p>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  entries.forEach((e) => URL.revokeObjectURL(e.preview));
                  setEntries([]);
                }}
                className="text-xs text-ink/50 hover:text-clay"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {entries.map((entry, i) => (
              <div
                key={entry.file.name + i}
                className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-2"
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-ink/5">
                  {entry.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.preview}
                      alt={entry.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="m-auto h-5 w-5 text-ink/30" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{entry.file.name}</p>
                  <p className="text-xs text-ink/50">{formatBytes(entry.file.size)}</p>
                </div>

                {/* Status / remove */}
                {entry.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    className="flex-shrink-0 rounded-full p-1 text-ink/40 hover:bg-ink/5 hover:text-clay"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {entry.status === "uploading" && (
                  <LoaderCircle className="h-4 w-4 flex-shrink-0 animate-spin text-fern" />
                )}
                {entry.status === "done" && (
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-fern" />
                )}
                {entry.status === "error" && (
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-clay" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        disabled={isPending || entries.filter((e) => e.status === "pending").length === 0}
        onClick={handleUpload}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-mist disabled:opacity-40"
      >
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        {isPending
          ? `Uploading ${entries.length} photo${entries.length !== 1 ? "s" : ""}...`
          : `Upload ${entries.filter((e) => e.status === "pending").length || ""} photo${entries.filter((e) => e.status === "pending").length !== 1 ? "s" : ""}`}
      </button>

      {uploadResult && (
        <p className={`text-sm ${uploadResult.startsWith("Upload failed") ? "text-clay" : "text-fern"}`}>
          {uploadResult}
        </p>
      )}
    </div>
  );
}
