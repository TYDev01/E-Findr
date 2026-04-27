"use client";

import Image from "next/image";
import { LoaderCircle, SearchCheck } from "lucide-react";
import { useState, useTransition } from "react";

import type { SearchMatch } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

export function PublicSearchForm({
  slug,
  requiresAccessCode
}: {
  slug: string;
  requiresAccessCode: boolean;
}) {
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const selfie = form.elements.namedItem("selfie") as HTMLInputElement | null;
          const accessCode = form.elements.namedItem("access_code") as HTMLInputElement | null;
          const attendeeName = form.elements.namedItem("attendee_name") as HTMLInputElement | null;

          if (!selfie?.files?.[0]) {
            setMessage("Upload one clear selfie to start the search.");
            return;
          }

          const payload = new FormData();
          payload.append("selfie", selfie.files[0]);
          if (requiresAccessCode && accessCode?.value) {
            payload.append("access_code", accessCode.value);
          }
          if (attendeeName?.value) {
            payload.append("attendee_name", attendeeName.value);
          }

          startTransition(() => {
            void (async () => {
              setMessage("Matching your face against this event gallery...");
              setMatches([]);
              const response = await fetch(`${API_URL}/api/public/events/${slug}/search-face`, {
                method: "POST",
                body: payload
              });

              if (!response.ok) {
                setMessage("Search failed. Use a clear selfie with only your face visible.");
                return;
              }

              const data = (await response.json()) as { matches: SearchMatch[] };
              setMatches(data.matches);
              setMessage(
                data.matches.length
                  ? "Matches found below."
                  : "No confident matches found yet."
              );
            })();
          });
        }}
      >
        <label className="text-sm font-semibold text-ink/70">
          Your name
          <input
            name="attendee_name"
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3"
            placeholder="Optional, for organizer logs"
          />
        </label>
        {requiresAccessCode ? (
          <label className="text-sm font-semibold text-ink/70">
            Access code
            <input
              name="access_code"
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3"
              placeholder="Enter event access code"
            />
          </label>
        ) : null}
        <label className="text-sm font-semibold text-ink/70">
          Upload selfie
          <div className="mt-2 rounded-[28px] border border-dashed border-ink/20 bg-mist p-8 text-center">
            <SearchCheck className="mx-auto h-8 w-8 text-fern" />
            <p className="mt-4 font-semibold">One clear face only</p>
            <p className="mt-2 text-sm text-ink/62">JPG, PNG, or WEBP. Your selfie is not kept after processing.</p>
            <input
              name="selfie"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mx-auto mt-4 block text-sm"
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-mist disabled:opacity-60"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Find my photos
        </button>
      </form>

      {message ? <p className="text-sm text-ink/66">{message}</p> : null}

      {matches.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {matches.map((match) => (
            <div key={match.photo_id} className="overflow-hidden rounded-[28px] border border-ink/10 bg-white">
              <div className="relative h-64">
                <Image src={match.thumbnail_url} alt="Matched event photo" fill className="object-cover" unoptimized />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-ink/60">Similarity</p>
                  <p className="text-2xl font-black">{Math.round(match.similarity_score * 100)}%</p>
                </div>
                <a
                  href={match.image_url}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-mist"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open photo
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
