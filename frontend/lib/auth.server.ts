import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthUser } from "./auth";

const AUTH_COOKIE = "efindr_token";

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getServerAuthToken();
  if (!token) {
    return null;
  }

  const apiUrl = (
    process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
