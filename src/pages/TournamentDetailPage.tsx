import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { TopBar } from "../components/TopBar";
import { errorMessage } from "../api/client";
import {
  deleteTournament,
  getTournament,
  joinTournament,
  leaveTournament,
} from "../api/tournaments";
import { PAYOUT_LABELS, type Player, type TournamentDetail } from "../api/types";
import { formatBuyIn, formatDate, formatMoney } from "../format";
import "./TournamentDetailPage.css";

export function TournamentDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Separate from `error` so a failed join does not blank the whole page.
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTournament(id);
      setTournament(res.tournament);
      setPlayers(res.players);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  /** Guards every mutating action against double submits. */
  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this tournament? This cannot be undone.")) return;
    setBusy(true);
    setActionError(null);
    try {
      await deleteTournament(id);
      navigate("/tournaments", { replace: true });
    } catch (e) {
      setActionError(errorMessage(e));
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div>
        <TopBar />
        <main className="detail-main">
          <p className="detail-muted">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div>
        <TopBar />
        <main className="detail-main">
          <p className="detail-error">{error ?? "That tournament was not found."}</p>
          <Link className="detail-back" to="/tournaments">
            Back to tournaments
          </Link>
        </main>
      </div>
    );
  }

  const isOrganizer = tournament.createdBy === user?.uid;
  const isJoined = user ? tournament.participants.includes(user.uid) : false;
  const isFinished = tournament.status === "finished";
  const isFull =
    tournament.playerLimit > 0 && tournament.participants.length >= tournament.playerLimit;

  return (
    <div>
      <TopBar />
      <main className="detail-main">
        <Link className="detail-back" to="/tournaments">
          ← Tournaments
        </Link>

        <div className="detail-head">
          <h1>{tournament.name}</h1>
          {isFinished && <span className="detail-badge">Finished</span>}
        </div>
        <p className="detail-sub">
          Organized by {tournament.organizerName} · {formatDate(tournament.dateTime)}
        </p>

        {actionError && <p className="detail-error">{actionError}</p>}

        <section className="detail-facts">
          <div>
            <span>Buy-in</span>
            <strong>{formatBuyIn(tournament.buyIn)}</strong>
          </div>
          <div>
            <span>Players</span>
            <strong>
              {tournament.participantCount + tournament.guestCount}
              {tournament.playerLimit > 0 ? ` / ${tournament.playerLimit}` : ""}
            </strong>
          </div>
          <div>
            <span>Payouts</span>
            <strong>{PAYOUT_LABELS[tournament.payoutStructure]}</strong>
          </div>
          <div>
            <span>Visibility</span>
            <strong>{tournament.isPublic ? "Public" : "Private"}</strong>
          </div>
          {tournament.allowRebuys && (
            <div>
              <span>Rebuys</span>
              <strong>Allowed</strong>
            </div>
          )}
          {tournament.allowAddons && (
            <div>
              <span>Add-ons</span>
              <strong>Allowed</strong>
            </div>
          )}
          {tournament.inviteCode && (
            <div>
              <span>Invite code</span>
              <strong>{tournament.inviteCode}</strong>
            </div>
          )}
        </section>

        <div className="detail-actions">
          <Link
            className="detail-btn is-primary"
            to={`/tournaments/${tournament.id}/display`}
          >
            Open display
          </Link>
          {isOrganizer ? (
            <>
              <Link className="detail-btn" to={`/tournaments/${tournament.id}/edit`}>
                Edit
              </Link>
              <button
                type="button"
                className="detail-btn is-danger"
                onClick={() => void remove()}
                disabled={busy}
              >
                Delete
              </button>
            </>
          ) : isJoined ? (
            <button
              type="button"
              className="detail-btn"
              onClick={() => void run(() => leaveTournament(id))}
              disabled={busy || isFinished}
            >
              {busy ? "Working…" : "Leave tournament"}
            </button>
          ) : (
            <button
              type="button"
              className="detail-btn is-primary"
              onClick={() => void run(() => joinTournament(id))}
              disabled={busy || isFinished || isFull}
            >
              {busy ? "Working…" : isFull ? "Tournament full" : "Join tournament"}
            </button>
          )}
        </div>

        {tournament.description && (
          <section className="detail-block">
            <h2>Description</h2>
            <p>{tournament.description}</p>
          </section>
        )}
        {tournament.rules && (
          <section className="detail-block">
            <h2>Rules</h2>
            <p>{tournament.rules}</p>
          </section>
        )}

        {isFinished && tournament.results && tournament.results.length > 0 && (
          <section className="detail-block">
            <h2>Results</h2>
            <ol className="detail-results">
              {tournament.results.map((r) => (
                <li key={`${r.place}-${r.name}`}>
                  <span className="detail-place">{r.place}</span>
                  <span className="detail-result-name">{r.name}</span>
                  <span className="detail-winnings">
                    {r.winnings > 0 ? formatMoney(r.winnings) : ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="detail-block">
          <h2>Players ({players.length})</h2>
          {players.length === 0 ? (
            <p className="detail-muted">No players yet.</p>
          ) : (
            <ul className="detail-players">
              {players.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  {p.isGuest && <span className="detail-tag">Guest</span>}
                  {p.buyInPaid && <span className="detail-tag is-paid">Paid</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
