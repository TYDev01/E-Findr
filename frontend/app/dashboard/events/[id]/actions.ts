"use server";

import { redirect } from "next/navigation";

import { getServerAuthToken } from "@/lib/auth.server";

const API_URL = (
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

export async function deleteEvent(eventId: string): Promise<void> {
  const token = await getServerAuthToken();
  const res = await fetch(`${API_URL}/api/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to delete event");
  }

  redirect("/dashboard/events");
}
