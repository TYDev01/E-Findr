import { LockKeyhole } from "lucide-react";

import { PublicSearchForm } from "@/components/public-search-form";
import { Panel, Section } from "@/components/ui";
import { getPublicEvent } from "@/lib/api";

export default async function PublicEventPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    return (
      <Section className="min-h-screen py-12">
        <Panel className="mesh-card">
          <p className="text-sm text-ink/64">This event page is not available yet.</p>
        </Panel>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen py-12">
      <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <Panel className="mesh-card">
          <p className="text-xs uppercase tracking-[0.3em] text-fern">Private event search</p>
          <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-5xl font-bold">{event.title}</h1>
          <p className="mt-5 text-base leading-8 text-ink/68">{event.privacy_notice}</p>
          {event.requires_access_code ? (
            <div className="mt-8 rounded-[26px] border border-ink/10 bg-white/75 p-5">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-1 h-5 w-5 text-fern" />
              <div>
                <p className="font-bold">Access code required</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">Organizers can protect event galleries with an extra code before selfie upload.</p>
              </div>
            </div>
            </div>
          ) : null}
        </Panel>
        <Panel>
          <PublicSearchForm slug={slug} requiresAccessCode={event.requires_access_code} />
        </Panel>
      </div>
    </Section>
  );
}
