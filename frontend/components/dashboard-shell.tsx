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
        <div className="h-fit rounded-[28px] p-6 shadow-panel" style={{ backgroundColor: "#0e1b17", color: "#f4f1e8" }}>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#9cd7cb" }}>Organizer console</p>
            <h1 className="mt-3 text-2xl font-black">EFindr</h1>
            <p className="mt-2 text-sm opacity-70">Private galleries, fast face search, and event-safe sharing controls.</p>
          </div>
          <div className="mb-6 rounded-2xl p-4" style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "#9cd7cb" }}>Signed in</p>
            <p className="mt-2 text-sm font-semibold text-white">{userName ?? "Organizer"}</p>
          </div>
          <div className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-white/10 hover:text-white" style={{ color: "rgba(244,241,232,0.85)" }}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
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
