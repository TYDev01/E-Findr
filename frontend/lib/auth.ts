import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "efindr_token";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getServerAuthToken();
  if (!token) {
    return null;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

  try {
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
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

export function getClientAuthToken() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${AUTH_COOKIE}=`))
    ?.split("=")[1] ?? null;
}

export function setClientSession(token: string, user: AuthUser) {
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  localStorage.setItem("efindr_user", JSON.stringify(user));
}

export function clearClientSession() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  localStorage.removeItem("efindr_user");
}

export function getClientAuthHeaders() {
  const token = getClientAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}
