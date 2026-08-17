import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { TopBar } from "../components/TopBar";
import { errorMessage } from "../api/client";
import { listTournaments, type TournamentFilter } from "../api/tournaments";
import type { Tournament } from "../api/types";
import { formatDate, formatMoney } from "../format";
import "./TournamentsListPage.css";

const TABS: { key: TournamentFilter; label: string; empty: string }[] = [
  { key: "mine", label: "Organizing", empty: "You are not organizing any tournaments yet." },
  { key: "registered", label: "Registered", empty: "You have not joined any tournaments yet." },
  { key: "public", label: "Available", empty: "There are no public tournaments to join right now." },
];

export function TournamentsListPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<TournamentFilter>("mine");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTournaments(await listTournaments(filter));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const active = TABS.find((t) => t.key === filter);

  return (
    <div>
      <TopBar />
      <main className="tournaments-main">
        <div className="tournaments-head">
          <h1>Tournaments</h1>
          <Link className="tournaments-new" to="/tournaments/new">
            New tournament
          </Link>
        </div>

        <div className="tournaments-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className={filter === tab.key ? "is-active" : undefined}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="tournaments-error">
            {error}
            <button type="button" onClick={() => void load()}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="tournaments-muted">Loading…</p>
        ) : tournaments.length === 0 && !error ? (
          <p className="tournaments-muted">{active?.empty}</p>
        ) : (
          <ul className="tournaments-list">
            {tournaments.map((t) => (
              <li key={t.id}>
                <Link to={`/tournaments/${t.id}`}>
                  <span className="tournaments-name">
                    {t.name}
                    {t.status === "finished" && (
                      <span className="tournaments-badge">Finished</span>
                    )}
                    {!t.isPublic && <span className="tournaments-badge is-quiet">Private</span>}
                  </span>
                  <span className="tournaments-meta">
                    {formatDate(t.dateTime)} · {formatMoney(t.buyIn)} buy-in ·{" "}
                    {t.participants.length}
                    {t.playerLimit > 0 ? `/${t.playerLimit}` : ""} players
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
