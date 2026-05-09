const AUTH_COOKIE = "efindr_token";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export function getClientAuthToken() {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${AUTH_COOKIE}=`))
      ?.split("=")[1] ?? null
  );
}

export function setClientSession(token: string, user: AuthUser) {
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  localStorage.setItem("efindr_user", JSON.stringify(user));
}

export function clearClientSession() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  localStorage.removeItem("efindr_user");
}

export function getClientAuthHeaders(): Record<string, string> {
  const token = getClientAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
