import { del, get, post } from "./client";
import type { StatsEntry, StatsResponse } from "./types";

/** Overview, entries and chart series, all computed server-side. */
export function getMyStats(): Promise<StatsResponse> {
  return get<StatsResponse>("/stats/me");
}

export function getUserStats(uid: string): Promise<StatsResponse> {
  return get<StatsResponse>(`/users/${encodeURIComponent(uid)}/stats`);
}

export type NewStatsEntry = Omit<StatsEntry, "id">;

export async function addStatsEntry(entry: NewStatsEntry): Promise<StatsEntry> {
  const res = await post<{ entry: StatsEntry }>("/stats/entries", entry);
  return res.entry;
}

export function deleteStatsEntry(entryId: string): Promise<void> {
  return del(`/stats/entries/${encodeURIComponent(entryId)}`);
}

/** Creates `users/{uid}` on first sign-in; safe to call every time. */
export function ensureProfile(username?: string): Promise<{ created: boolean }> {
  return post<{ created: boolean }>("/users/ensure-profile", username ? { username } : {});
}
