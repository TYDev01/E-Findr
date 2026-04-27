"use client";

import { LoaderCircle, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getClientAuthHeaders } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

export function PhotoUploadForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.elements.namedItem("photos") as HTMLInputElement | null;
        if (!input?.files?.length) {
          setMessage("Select at least one image.");
          return;
        }

        const payload = new FormData();
        Array.from(input.files).forEach((file) => payload.append("photos", file));

        startTransition(() => {
          void (async () => {
            setMessage("Uploading photos and queueing face extraction...");
            const response = await fetch(`${API_URL}/api/events/${eventId}/photos/upload`, {
              method: "POST",
              headers: {
                ...getClientAuthHeaders()
              },
              body: payload
            });

            if (!response.ok) {
              setMessage("Upload failed. Check file type, size, and R2 credentials.");
              return;
            }

            setMessage("Upload queued. Refreshing gallery status...");
            router.refresh();
          })();
        });
      }}
    >
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-ink/20 bg-mist px-5 py-8 text-center">
        <UploadCloud className="h-8 w-8 text-fern" />
        <p className="mt-4 font-semibold">Drop event photos or click to browse</p>
        <p className="mt-2 text-sm text-ink/62">JPG, PNG, WEBP up to 15MB each</p>
        <input
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-4 block text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-mist disabled:opacity-60"
      >
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        Upload photos
      </button>
      {message ? <p className="text-sm text-ink/68">{message}</p> : null}
    </form>
  );
}
