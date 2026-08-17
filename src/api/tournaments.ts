import { del, get, post, put } from "./client";
import type { Player, Tournament, TournamentDetail, TournamentInput } from "./types";

export type TournamentFilter = "mine" | "registered" | "public" | "all";

export async function listTournaments(filter: TournamentFilter): Promise<Tournament[]> {
  const res = await get<{ tournaments: Tournament[] }>(`/tournaments?filter=${filter}`);
  return res.tournaments;
}

export async function getTournament(
  id: string,
): Promise<{ tournament: TournamentDetail; players: Player[] }> {
  return get(`/tournaments/${encodeURIComponent(id)}`);
}

export async function createTournament(input: TournamentInput): Promise<Tournament> {
  const res = await post<{ tournament: Tournament }>("/tournaments", input);
  return res.tournament;
}

export async function updateTournament(
  id: string,
  input: TournamentInput,
): Promise<Tournament> {
  const res = await put<{ tournament: Tournament }>(
    `/tournaments/${encodeURIComponent(id)}`,
    input,
  );
  return res.tournament;
}

export async function deleteTournament(id: string): Promise<void> {
  await del(`/tournaments/${encodeURIComponent(id)}`);
}

export async function joinTournament(id: string): Promise<Tournament> {
  const res = await post<{ tournament: Tournament }>(
    `/tournaments/${encodeURIComponent(id)}/join`,
  );
  return res.tournament;
}

export async function leaveTournament(id: string): Promise<Tournament> {
  const res = await post<{ tournament: Tournament }>(
    `/tournaments/${encodeURIComponent(id)}/leave`,
  );
  return res.tournament;
}
