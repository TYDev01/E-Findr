"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setClientSession } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

type AuthMode = "login" | "register";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");
        const name = String(form.get("name") ?? "").trim();

        if (!email || !password || (mode === "register" && !name)) {
          setError("Complete the required fields before continuing.");
          return;
        }

        startTransition(() => {
          void (async () => {
            setError(null);
            const response = await fetch(
              `${API_URL}/api/auth/${mode === "login" ? "login" : "register"}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(
                  mode === "login"
                    ? { email, password }
                    : { email, password, name }
                )
              }
            );

            if (!response.ok) {
              setError(
                mode === "login"
                  ? "Login failed. Check your email and password."
                  : "Registration failed. Use a different email or try again."
              );
              return;
            }

            const data = (await response.json()) as AuthResponse;
            setClientSession(data.token, data.user);
            router.push("/dashboard");
            router.refresh();
          })();
        });
      }}
    >
      {mode === "register" ? (
        <label className="block text-sm font-semibold text-ink/70">
          Full name
          <input
            name="name"
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
            placeholder="Full name"
          />
        </label>
      ) : null}
      <label className="block text-sm font-semibold text-ink/70">
        Email
        <input
          name="email"
          type="email"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
          placeholder="you@eventstudio.com"
        />
      </label>
      <label className="block text-sm font-semibold text-ink/70">
        Password
        <input
          name="password"
          type="password"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none"
          placeholder="••••••••"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-mist disabled:opacity-60"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {mode === "login" ? "Log in" : "Create workspace"}
      </button>
      {error ? <p className="text-sm text-clay">{error}</p> : null}
    </form>
  );
}

