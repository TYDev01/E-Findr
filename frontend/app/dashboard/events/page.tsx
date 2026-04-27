import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { Panel } from "@/components/ui";
import { getEvents } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

export default async function DashboardEventsPage() {
  const user = await requireCurrentUser();
  const events = await getEvents();

  return (
    <DashboardShell
      eyebrow="Events"
      title="Manage private event galleries"
      userName={user.name}
    >
      <div className="grid gap-5">
        {events.length ? events.map((event) => (
          <Panel key={event.id} className="mesh-card">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-fern">Private slug</p>
                <h3 className="mt-3 text-2xl font-black">{event.title}</h3>
                <p className="mt-2 text-sm text-ink/64">{event.slug} · {event.location ?? "Private location"} · {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Date pending"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-mist">{event.is_private ? "Private" : "Public"} gallery</span>
                <Link href={`/dashboard/events/${event.id}`} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">Open event</Link>
              </div>
            </div>
          </Panel>
        )) : (
          <Panel className="mesh-card">
            <p className="text-lg font-bold">No events yet</p>
            <p className="mt-2 text-sm text-ink/64">Create your first event to start collecting and matching gallery photos.</p>
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
