import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { TopBar } from "../components/TopBar";
import { errorMessage } from "../api/client";
import {
  getMe,
  profileArtUrl,
  setFeatured,
  type FeaturedResult,
  type Me,
} from "../api/users";
import { listTournaments } from "../api/tournaments";
import type { Tournament } from "../api/types";
import { formatDate, formatMoney } from "../format";
import "./ProfilePage.css";

const MAX_FEATURED = 12;

/** One row in the manager: a finished tournament the player has a result in. */
interface Candidate {
  tournament: Tournament;
  place: number;
  winnings: number;
  selected: boolean;
  name: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Featured manager state.
  const [managing, setManaging] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [managerError, setManagerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let live = true;
    setLoading(true);
    setError(null);
    getMe()
      .then((data) => live && setMe(data))
      .catch((e) => live && setError(errorMessage(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [user]);

  const openManager = async () => {
    if (!me) return;
    setManaging(true);
    setCandidates(null);
    setManagerError(null);
    try {
      const archived = await listTournaments("archived");
      const featuredById = new Map(me.featuredResults.map((f) => [f.tournamentId, f]));
      const rows: Candidate[] = [];
      for (const t of archived) {
        const mine = t.results?.find((r) => r.uid === me.uid);
        if (!mine) continue;
        const featured = featuredById.get(t.id);
        rows.push({
          tournament: t,
          place: mine.place,
          winnings: mine.winnings,
          selected: Boolean(featured),
          name: featured?.name ?? t.name,
        });
      }
      setCandidates(rows);
    } catch (e) {
      setManagerError(errorMessage(e));
    }
  };

  const toggle = (id: string) => {
    setCandidates(
      (prev) =>
        prev?.map((c) => {
          if (c.tournament.id !== id) return c;
          if (!c.selected && (prev?.filter((x) => x.selected).length ?? 0) >= MAX_FEATURED) {
            return c;
          }
          return { ...c, selected: !c.selected };
        }) ?? null,
    );
  };

  const rename = (id: string, name: string) => {
    setCandidates(
      (prev) => prev?.map((c) => (c.tournament.id === id ? { ...c, name } : c)) ?? null,
    );
  };

  const save = async () => {
    if (!candidates || saving) return;
    setSaving(true);
    setManagerError(null);
    try {
      const stored = await setFeatured(
        candidates
          .filter((c) => c.selected)
          .map((c) => ({ tournamentId: c.tournament.id, name: c.name.trim() || undefined })),
      );
      setMe((prev) => (prev ? { ...prev, featuredResults: stored } : prev));
      setManaging(false);
    } catch (e) {
      setManagerError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const displayName = me?.username || me?.email || "Player";
  const initial = displayName.charAt(0).toUpperCase();
  const featured = me?.featuredResults ?? [];
  const avatarUrl = profileArtUrl(me?.photoURL, "avatars");
  const backgroundUrl = profileArtUrl(me?.backgroundURL, "backgrounds");

  return (
    <div>
      <TopBar />
      <main className="profile-main">
        <h1>Profile</h1>

        {loading ? (
          <p className="profile-muted">Loading…</p>
        ) : error ? (
          <div className="profile-error">{error}</div>
        ) : (
          <>
            <div className="profile-card">
              <div
                className="profile-banner"
                style={
                  backgroundUrl
                    ? { backgroundImage: `url(${backgroundUrl})` }
                    : undefined
                }
              >
                <div className="profile-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
              </div>
              <div className="profile-body">
                <div className="profile-fields">
                  <div className="profile-field">
                    <span>Username</span>
                    <strong>{me?.username || "—"}</strong>
                  </div>
                  <div className="profile-field">
                    <span>Email</span>
                    <strong>{me?.email || "—"}</strong>
                  </div>
                </div>
                <div className="profile-follow">
                  <div className="profile-follow-stat">
                    <strong>{me?.followers ?? 0}</strong>
                    <span>Followers</span>
                  </div>
                  <div className="profile-follow-stat">
                    <strong>{me?.following ?? 0}</strong>
                    <span>Following</span>
                  </div>
                </div>
              </div>
            </div>

            <section className="featured">
              <div className="featured-head">
                <h2>Featured tournaments</h2>
                {!managing && (
                  <button type="button" className="featured-manage" onClick={() => void openManager()}>
                    Manage
                  </button>
                )}
              </div>

              {featured.length === 0 && !managing ? (
                <p className="profile-muted">
                  Nothing featured yet. Pick finished tournaments to show on your profile.
                </p>
              ) : (
                !managing && (
                  <div className="featured-cards">
                    {featured.map((f: FeaturedResult) => (
                      <div key={f.tournamentId} className="featured-card">
                        <span className={`featured-place${f.place === 1 ? " is-first" : ""}`}>
                          {f.place != null ? `#${f.place}` : "—"}
                        </span>
                        <strong className="featured-name">{f.name}</strong>
                        <span className="featured-date">{f.date ? formatDate(f.date) : ""}</span>
                        <span className="featured-winnings">{formatMoney(f.winnings)}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {managing && (
                <div className="featured-manager">
                  <p className="profile-muted">
                    Everyone sees the name, date, place and winnings — nothing else.
                  </p>
                  {managerError && <div className="profile-error">{managerError}</div>}
                  {candidates === null && !managerError ? (
                    <p className="profile-muted">Loading…</p>
                  ) : candidates && candidates.length === 0 ? (
                    <p className="profile-muted">No finished tournaments with a result yet.</p>
                  ) : (
                    <ul className="featured-list">
                      {candidates?.map((c) => (
                        <li key={c.tournament.id}>
                          <label className="featured-row">
                            <input
                              type="checkbox"
                              checked={c.selected}
                              onChange={() => toggle(c.tournament.id)}
                            />
                            <span className="featured-row-meta">
                              <strong>{c.tournament.name}</strong>
                              <span>
                                {c.tournament.dateTime ? `${formatDate(c.tournament.dateTime)} · ` : ""}
                                Place {c.place} · {formatMoney(c.winnings)}
                              </span>
                            </span>
                          </label>
                          {c.selected && (
                            <input
                              type="text"
                              className="featured-rename"
                              maxLength={120}
                              value={c.name}
                              onChange={(e) => rename(c.tournament.id, e.target.value)}
                              placeholder="Display name"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="featured-actions">
                    <button type="button" onClick={() => setManaging(false)} disabled={saving}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="featured-save"
                      onClick={() => void save()}
                      disabled={saving || candidates === null}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
