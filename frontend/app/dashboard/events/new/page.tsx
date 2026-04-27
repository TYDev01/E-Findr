import { DashboardShell } from "@/components/dashboard-shell";
import { NewEventForm } from "@/components/new-event-form";
import { Panel } from "@/components/ui";
import { requireCurrentUser } from "@/lib/auth";

export default async function NewEventPage() {
  const user = await requireCurrentUser();

  return (
    <DashboardShell
      eyebrow="Create event"
      title="Set up the gallery before the first upload"
      userName={user.name}
    >
      <Panel className="mesh-card">
        <NewEventForm organizerId={user.id} />
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink/68">
          <span className="rounded-full bg-white/75 px-4 py-2">Private by default</span>
          <span className="rounded-full bg-white/75 px-4 py-2">Cloudflare R2 originals</span>
          <span className="rounded-full bg-white/75 px-4 py-2">AI queue processing</span>
        </div>
      </Panel>
    </DashboardShell>
  );
}
