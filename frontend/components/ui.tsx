import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return <section id={id} className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</section>;
}

export function Panel({
  id,
  className,
  children
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={cn("rounded-xl border border-black/[0.07] bg-white p-6 shadow-panel", className)}>
      {children}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">{children}</span>;
}

export function PrimaryButton({
  href,
  children,
  className
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold/90",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-ink/15 bg-white/80 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink/30",
        className
      )}
    >
      {children}
    </Link>
  );
}
