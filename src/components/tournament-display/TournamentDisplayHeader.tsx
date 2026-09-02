import { Link } from "react-router-dom";
import type { Player, TournamentDetail } from "../../api/types";
import { entriesSummary } from "../../tournament/payouts";
import { formatMoney } from "../../format";

export type DisplayTab = "clock" | "seating" | "entries";

const TABS: { key: DisplayTab; label: string }[] = [
  { key: "clock", label: "Clock" },
  { key: "seating", label: "Seating" },
  { key: "entries", label: "Entries & Payouts" },
];

function tournamentStatusLabel(t: TournamentDetail): string {
  if (t.status === "finished") return "Finished";
  if (t.dateTime && new Date(t.dateTime).getTime() > Date.now()) return "Upcoming";
  return "Running";
}

export function TournamentDisplayHeader({
  tournament,
  players,
  activeTab,
  onTab,
  fullscreen,
  onToggleFullscreen,
  onCyclePalette,
}: {
  tournament: TournamentDetail;
  players: Player[];
  activeTab: DisplayTab;
  onTab: (tab: DisplayTab) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onCyclePalette: () => void;
}) {
  const status = tournamentStatusLabel(tournament);
  const count = tournament.participantCount + tournament.guestCount;
  const pool = entriesSummary(players, tournament.buyIn).prizePool;

  return (
    <header className="display-header">
      <div className="display-header-top">
        <Link to={`/tournaments/${tournament.id}`} className="display-exit">
          ← Exit display
        </Link>
        <span className="display-brand">PokerPal</span>
        <button
          type="button"
          className="display-palette-btn"
          title="Change colours"
          onClick={onCyclePalette}
        >
          🎨
        </button>
        <button
          type="button"
          className="display-fs-btn"
          title="Fullscreen"
          onClick={onToggleFullscreen}
        >
          {fullscreen ? "Exit fullscreen" : "⛶ Fullscreen"}
        </button>
      </div>
      <h1 className="display-title">{tournament.name}</h1>
      <div className="display-status">
        <span className={`display-status-dot is-${status.toLowerCase()}`} />
        <span>
          {status} • {count} {count === 1 ? "player" : "players"} •{" "}
          {formatMoney(pool)} prize pool
        </span>
      </div>
      <nav className="display-tabs" aria-label="Tournament display">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`display-tab ${activeTab === t.key ? "is-active" : ""}`}
            onClick={() => onTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
