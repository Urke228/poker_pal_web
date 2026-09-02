import { get } from "./client";
import type { Seating } from "./types";

/**
 * The tournament's published seating chart, or null when the organizer has not
 * published one yet. Access mirrors the tournament itself (public / owner /
 * participant), enforced server-side.
 */
export function getTournamentSeating(id: string): Promise<Seating | null> {
  return get<{ seating: Seating | null }>(
    `/tournaments/${encodeURIComponent(id)}/seating`,
  ).then((r) => r.seating);
}
