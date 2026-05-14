import { Download } from "lucide-react";
import Image from "next/image";

import { CopyLinkButton } from "@/components/copy-link-button";
import { DashboardShell } from "@/components/dashboard-shell";
import { DeleteEventButton } from "@/components/delete-event-button";
import { DownloadQrButton } from "@/components/download-qr-button";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { Panel } from "@/components/ui";
import { getEventDetail } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth.server";

const statusTone: Record<string, string> = {
  completed: "bg-fern/10 text-fern",
  processing: "bg-gold/20 text-clay",
  pending: "bg-ink/10 text-ink",
  failed: "bg-clay/12 text-clay"
};

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const detail = await getEventDetail(id);

  if (!detail) {
    return (
      <DashboardShell eyebrow="Event detail" title="Event not found" userName={user.name}>
        <Panel className="mesh-card">
          <p className="text-sm text-ink/64">This event could not be loaded from the API yet.</p>
        </Panel>
      </DashboardShell>
    );
  }

  const { event, photos, share_url } = detail;

  return (
    <DashboardShell eyebrow="Event detail" title={event.title} userName={user.name}>
      <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <Panel className="mesh-card">
          <p className="text-xs uppercase tracking-[0.28em] text-fern">Event info</p>
          <div className="mt-5 space-y-4 text-sm text-ink/70">
            <p>{event.location ?? "Private location"} · {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Date pending"}</p>
            <p>Share link: {share_url}</p>
            <p>{event.is_private ? "Private event gallery" : "Public event gallery"} · {photos.length} uploaded photos</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <PhotoUploadForm eventId={event.id} />
            </div>
            <CopyLinkButton url={share_url} />
            <DownloadQrButton url={share_url} eventTitle={event.title} />
            <DeleteEventButton eventId={event.id} />
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">Gallery processing</h3>
              <p className="mt-2 text-sm text-ink/64">Bulk uploads validate file types, generate thumbnails, and queue AI extraction.</p>
            </div>
            <button className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"><Download className="mr-2 inline h-4 w-4" /> Export log</button>
          </div>
          <div className="mt-6 grid gap-3">
            {photos.length ? photos.map((photo) => (
              <div key={photo.id} className="grid items-center gap-4 rounded-xl border border-ink/10 bg-white/70 p-4 md:grid-cols-[96px,1fr,auto]">
                <div className="relative h-24 overflow-hidden rounded-lg">
                  <Image src={photo.thumbnail_url} alt={photo.original_filename} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <p className="font-semibold">{photo.original_filename}</p>
                  <p className="mt-1 text-sm text-ink/60">Stored in Cloudflare R2, signed access only.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusTone[photo.processing_status] ?? statusTone.pending}`}>
                  {photo.processing_status}
                </span>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-ink/15 bg-white/60 px-5 py-8 text-sm text-ink/60">
                No photos uploaded yet. Add a batch above to start R2 upload and AI indexing.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
