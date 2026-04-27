"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { clearClientSession, getClientAuthHeaders } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-mist/85 disabled:opacity-60"
      onClick={() => {
        startTransition(() => {
          void (async () => {
            try {
              await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                  ...getClientAuthHeaders()
                }
              });
            } finally {
              clearClientSession();
              router.push("/login");
              router.refresh();
            }
          })();
        });
      }}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Signing out..." : "Log out"}
    </button>
  );
}

