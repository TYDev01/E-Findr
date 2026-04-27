import { getServerAuthToken } from "@/lib/auth";

export type EventSummary = {
  id: string;
  organizer_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_date?: string | null;
  slug: string;
  is_private: boolean;
  requires_access_code?: boolean;
  created_at: string;
  updated_at: string;
};

export type PhotoView = {
  id: string;
  original_filename: string;
  processing_status: string;
  created_at: string;
  thumbnail_url: string;
  image_url: string;
};

export type EventDetail = {
  event: EventSummary;
  photos: PhotoView[];
  share_url: string;
};

export type PublicEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  requires_access_code: boolean;
  privacy_notice: string;
};

export type SearchMatch = {
  photo_id: string;
  thumbnail_url: string;
  image_url: string;
  similarity_score: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const token = init?.auth ? await getServerAuthToken() : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getEvents(): Promise<EventSummary[]> {
  try {
    return await apiFetch<EventSummary[]>("/api/events", { auth: true });
  } catch {
    return [];
  }
}

export async function getEventDetail(id: string): Promise<EventDetail | null> {
  try {
    return await apiFetch<EventDetail>(`/api/events/${id}`, { auth: true });
  } catch {
    return null;
  }
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  try {
    return await apiFetch<PublicEvent>(`/api/public/events/${slug}`);
  } catch {
    return null;
  }
}

export async function getDashboardData() {
  const events = await getEvents();
  const details = await Promise.all(events.slice(0, 4).map((event) => getEventDetail(event.id)));
  const presentDetails = details.filter((detail): detail is EventDetail => Boolean(detail));

  const totalPhotos = presentDetails.reduce((sum, detail) => sum + detail.photos.length, 0);
  const processedPhotos = presentDetails.reduce(
    (sum, detail) =>
      sum + detail.photos.filter((photo) => photo.processing_status === "completed").length,
    0
  );
  const failedPhotos = presentDetails.reduce(
    (sum, detail) =>
      sum + detail.photos.filter((photo) => photo.processing_status === "failed").length,
    0
  );

  return {
    events,
    details: presentDetails,
    stats: [
      { label: "Active events", value: `${events.length}`, delta: "Organizer-controlled access" },
      { label: "Uploaded photos", value: `${totalPhotos}`, delta: "Cloudflare R2 originals" },
      { label: "Processed photos", value: `${processedPhotos}`, delta: "AI indexed per event" },
      { label: "Failed items", value: `${failedPhotos}`, delta: "Retry from the event console" }
    ]
  };
}
