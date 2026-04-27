import Link from "next/link";
import { CalendarDays, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";
import { Panel } from "@/components/ui";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/events/new", label: "New event", icon: Sparkles },
  { href: "/events/founders-summit-lagos", label: "Public page", icon: ShieldCheck }
];

export function DashboardShell({
  title,
  eyebrow,
  userName,
  children
}: {
  title: string;
  eyebrow: string;
  userName?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f1e8_0%,#ebf4ef_48%,#f7efe3_100%)] text-ink">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px,1fr] lg:px-8">
        <Panel className="h-fit bg-ink text-mist">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-sea">Organizer console</p>
            <h1 className="mt-3 text-2xl font-black">EFindr</h1>
            <p className="mt-2 text-sm text-mist/70">Private galleries, fast face search, and event-safe sharing controls.</p>
          </div>
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Signed in</p>
            <p className="mt-2 text-sm font-semibold text-white">{userName ?? "Organizer"}</p>
          </div>
          <div className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-mist/80 transition hover:bg-white/10 hover:text-white">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </Panel>
        <main className="space-y-6">
          <Panel className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(156,215,203,0.55),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.72))]">
            <p className="text-xs uppercase tracking-[0.28em] text-fern">{eyebrow}</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{title}</h2>
          </Panel>
          {children}
        </main>
      </div>
    </div>
  );
}
