import { useParams } from "react-router-dom";
import { TournamentDisplayLayout } from "../components/tournament-display/TournamentDisplayLayout";

export function TournamentDisplayPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <TournamentDisplayLayout tournamentId={id} />;
}
