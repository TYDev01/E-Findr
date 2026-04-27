import Image from "next/image";

import { Panel, Section } from "@/components/ui";
import { matchResults } from "@/lib/mock-data";

export default function ResultsPage() {
  return (
    <Section className="min-h-screen py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-fern">Search results</p>
        <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-5xl font-bold">We found 3 likely matches.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/66">Results are sorted by similarity and scoped only to this event gallery. If your best photos are missing, try a brighter selfie with just your face in frame.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {matchResults.map((match) => (
          <Panel key={match.id} className="overflow-hidden p-0">
            <div className="relative h-72">
              <Image src={match.src} alt="Matched event photo" fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-ink/60">Similarity score</p>
                <p className="text-2xl font-black">{Math.round(match.score * 100)}%</p>
              </div>
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-mist">Download</button>
            </div>
          </Panel>
        ))}
      </div>
    </Section>
  );
}
