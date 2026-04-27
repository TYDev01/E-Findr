import { DashboardShell } from "@/components/dashboard-shell";
import { Panel } from "@/components/ui";
import { getDashboardData } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const { details, stats } = await getDashboardData();

  return (
    <DashboardShell
      eyebrow="Overview"
      title="Your gallery operations at a glance"
      userName={user.name}
    >
      <div className="grid gap-5 xl:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="mesh-card">
            <p className="text-sm text-ink/62">{stat.label}</p>
            <p className="mt-3 text-4xl font-black">{stat.value}</p>
            <p className="mt-3 text-sm text-fern">{stat.delta}</p>
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Recent events</h3>
            <p className="mt-2 text-sm text-ink/64">Monitor gallery health before guests start searching.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          {details.length ? details.map(({ event, photos }) => (
            <div key={event.id} className="grid gap-4 rounded-[24px] border border-ink/10 bg-white/70 p-5 md:grid-cols-[1.4fr,repeat(3,0.6fr)]">
              <div>
                <p className="text-xl font-bold">{event.title}</p>
                <p className="mt-1 text-sm text-ink/60">{event.location ?? "Private location"} · {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Date pending"}</p>
              </div>
              <p className="text-sm text-ink/65">{photos.length} uploads</p>
              <p className="text-sm text-fern">{photos.filter((photo) => photo.processing_status === "completed").length} processed</p>
              <p className="text-sm text-clay">{photos.filter((photo) => photo.processing_status === "failed").length} failed</p>
            </div>
          )) : (
            <div className="rounded-[24px] border border-dashed border-ink/15 bg-white/60 p-8 text-sm text-ink/60">
              No events loaded yet. Start by creating an event and uploading a few gallery photos.
            </div>
          )}
        </div>
      </Panel>
    </DashboardShell>
  );
}
