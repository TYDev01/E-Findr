"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getClientAuthHeaders } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

export function NewEventForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();

        if (!title) {
          setMessage("Event title is required.");
          return;
        }

        startTransition(() => {
          void (async () => {
            setMessage("Creating event workspace...");
            const response = await fetch(`${API_URL}/api/events`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getClientAuthHeaders()
              },
              body: JSON.stringify({
                title,
                location: String(form.get("location") ?? "").trim() || null,
                description: String(form.get("description") ?? "").trim() || null,
                event_date: normalizeEventDate(String(form.get("event_date") ?? "").trim()),
                access_code: String(form.get("access_code") ?? "").trim() || null,
                is_private: form.get("is_private") === "on"
              })
            });

            if (!response.ok) {
              setMessage("Event creation failed. Check your API and try again.");
              return;
            }

            const created = (await response.json()) as { id: string };
            setMessage("Event created. Redirecting to the event console...");
            router.push(`/dashboard/events/${created.id}`);
            router.refresh();
          })();
        });
      }}
    >
      <input
        name="title"
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
        placeholder="Event title"
      />
      <input
        name="location"
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
        placeholder="Location"
      />
      <input
        name="event_date"
        type="datetime-local"
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
      />
      <input
        name="access_code"
        className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
        placeholder="Optional access code"
      />
      <textarea
        name="description"
        className="min-h-36 rounded-2xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"
        placeholder="Describe the event and attendee context"
      />
      <label className="flex items-center gap-3 text-sm font-medium text-ink/72 md:col-span-2">
        <input
          name="is_private"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border border-ink/20"
        />
        Keep this event private by default
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-mist md:col-span-2 disabled:opacity-60"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        Create event
      </button>
      {message ? <p className="text-sm text-ink/68 md:col-span-2">{message}</p> : null}
    </form>
  );
}

function normalizeEventDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}
