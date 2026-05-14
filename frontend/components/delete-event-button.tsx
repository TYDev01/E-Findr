"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteEvent } from "@/app/dashboard/events/[id]/actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-clay/20 px-4 py-3 text-sm font-semibold text-clay"
      >
        <Trash2 className="h-4 w-4" /> Delete event
      </button>
    );
  }

  return (
    <div className="flex gap-2 sm:col-span-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteEvent(eventId))}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-clay px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Confirm delete"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="flex-1 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
