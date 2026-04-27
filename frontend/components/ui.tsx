import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Section({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</section>;
}

export function Panel({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-panel backdrop-blur", className)}>
      {children}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-mist">{children}</span>;
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
        "inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-mist transition hover:-translate-y-0.5 hover:bg-fern",
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
        "inline-flex items-center justify-center rounded-full border border-ink/10 bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-fern/40 hover:text-fern",
        className
      )}
    >
      {children}
    </Link>
  );
}

