import Link from "next/link";

import { PrimaryButton, SecondaryButton } from "@/components/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-mist/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sm font-black text-mist">EF</div>
          <div>
            <p className="text-lg font-black tracking-tight text-ink">EFindr</p>
            <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Event face search</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#privacy">Privacy</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-3">
          <SecondaryButton href="/login" className="hidden sm:inline-flex">Log in</SecondaryButton>
          <PrimaryButton href="/register">Start free</PrimaryButton>
        </div>
      </div>
    </header>
  );
}

