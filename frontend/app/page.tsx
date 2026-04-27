import { ArrowRight, Camera, LockKeyhole, QrCode, ScanFace, Search, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Panel, Pill, PrimaryButton, SecondaryButton, Section } from "@/components/ui";

const steps = [
  { icon: Camera, title: "Upload event photos", body: "Bulk ingest galleries, route originals to Cloudflare R2, and watch AI indexing progress in one view." },
  { icon: QrCode, title: "Share one private link", body: "Give guests a clean event page with optional access code and QR-ready distribution." },
  { icon: ScanFace, title: "Attendees upload one selfie", body: "The system extracts a single face embedding, scopes search to that event, and deletes the selfie after lookup." },
  { icon: Search, title: "Instant matched gallery", body: "Guests see only high-confidence results ranked by similarity, with download-ready images." }
];

export default function HomePage() {
  return (
    <div className="pb-20">
      <SiteHeader />
      <Section className="relative overflow-hidden py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="relative">
            <Pill>Private event AI search</Pill>
            <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-fraunces)] text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Find every guest photo without turning your gallery into a public dump.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
              EFindr gives organizers a polished control room for event galleries and gives attendees a focused, privacy-first selfie search that stays scoped to one event.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/register" className="gap-2">Launch organizer workspace <ArrowRight className="h-4 w-4" /></PrimaryButton>
              <SecondaryButton href="/events/founders-summit-lagos">Try attendee flow</SecondaryButton>
            </div>
          </div>
          <Panel className="mesh-card relative overflow-hidden border-white/60 bg-white/72 p-8">
            <div className="absolute right-6 top-6 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-clay">
              Live processing
            </div>
            <div className="grid gap-4">
              <div className="rounded-[26px] bg-ink p-6 text-mist">
                <p className="text-xs uppercase tracking-[0.28em] text-sea">Organizer dashboard</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-white/8 p-4">
                    <p className="text-sm text-mist/70">Indexed faces</p>
                    <p className="mt-2 text-3xl font-black">27.9k</p>
                  </div>
                  <div className="rounded-3xl bg-white/8 p-4">
                    <p className="text-sm text-mist/70">Search accuracy</p>
                    <p className="mt-2 text-3xl font-black">97.4%</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-ink/10 bg-mist p-5">
                  <LockKeyhole className="h-5 w-5 text-fern" />
                  <p className="mt-4 text-lg font-bold">Private by default</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">Unique event slugs, optional access codes, and no cross-event face search.</p>
                </div>
                <div className="rounded-[26px] border border-ink/10 bg-white p-5">
                  <Sparkles className="h-5 w-5 text-clay" />
                  <p className="mt-4 text-lg font-bold">Attendee-ready</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">Fast selfie flow with clear privacy notice and human-readable errors.</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </Section>

      <Section id="how-it-works" className="py-6">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <Pill>How it works</Pill>
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-bold">Built for event scale, not one-off albums.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/65">Wedding planners, schools, churches, conferences, and photographers can handle large galleries without asking guests to manually scroll through thousands of files.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }) => (
            <Panel key={title} className="mesh-card">
              <Icon className="h-6 w-6 text-fern" />
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/68">{body}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <Panel className="bg-ink text-mist">
            <Pill>Use cases</Pill>
            <div className="mt-6 space-y-5">
              {["Weddings and private celebrations", "Conference attendee galleries", "Church and school events", "Professional event photographers"].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-lg">{item}</div>
              ))}
            </div>
          </Panel>
          <Panel id="privacy" className="mesh-card">
            <Pill>Privacy-first design</Pill>
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-bold">Face search that stays inside the event boundary.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Selfies are used for that search and deleted after processing by default.",
                "Embeddings are event-scoped to avoid global lookup across galleries.",
                "Organizers can remove events and photos without waiting on support.",
                "Signed asset access prevents raw storage keys from leaking publicly."
              ].map((text) => (
                <div key={text} className="rounded-[24px] border border-ink/10 bg-white/70 p-5 text-sm leading-6 text-ink/72">{text}</div>
              ))}
            </div>
          </Panel>
        </div>
      </Section>
    </div>
  );
}

