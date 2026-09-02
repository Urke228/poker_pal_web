import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getTournament } from "../../api/tournaments";
import { ApiError, errorMessage } from "../../api/client";
import type { Player, TournamentDetail } from "../../api/types";
import { useDisplayControl } from "../../tournament/useDisplayControl";
import { TournamentDisplayHeader, type DisplayTab } from "./TournamentDisplayHeader";
import { ClockTab } from "./ClockTab";
import { SeatingTab } from "./SeatingTab";
import { EntriesPayoutsTab } from "./EntriesPayoutsTab";
import "./display.css";

const DISPLAY_TABS: DisplayTab[] = ["clock", "seating", "entries"];
const PALETTES = ["felt", "midnight", "charcoal", "light"] as const;

function readTheme(): string {
  try {
    return localStorage.getItem("pp-display-theme") || "felt";
  } catch {
    return "felt";
  }
}

type State =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "ok"; tournament: TournamentDetail; players: Player[] };

export function TournamentDisplayLayout({ tournamentId }: { tournamentId: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [tab, setTab] = useState<DisplayTab>("clock");
  const [refreshKey, setRefreshKey] = useState(0);

  // Remote control from the organizer's phone.
  const control = useDisplayControl(tournamentId);
  const lastTab = useRef<string | null>(null);
  const lastRefresh = useRef<number | null>(null);

  // Fullscreen is owned here (not per-tab) so it survives remote tab switches:
  // the organizer fullscreens once on the TV, then the phone changes tabs and
  // the display stays fullscreen.
  const shellRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void shellRef.current?.requestFullscreen();
    }
  };

  // Colour palette for the whole display (re-added, and shared with the clock).
  const [displayTheme, setDisplayTheme] = useState(readTheme);
  const cyclePalette = () => {
    const next =
      PALETTES[(PALETTES.indexOf(displayTheme as (typeof PALETTES)[number]) + 1) % PALETTES.length];
    setDisplayTheme(next);
    try {
      localStorage.setItem("pp-display-theme", next);
    } catch {
      // ignore storage failures
    }
  };

  // Follow the phone's chosen tab (also on first load, so the TV opens where the
  // organizer left it). Local tab taps still work between remote changes.
  useEffect(() => {
    if (
      control.tab &&
      control.tab !== lastTab.current &&
      (DISPLAY_TABS as string[]).includes(control.tab)
    ) {
      lastTab.current = control.tab;
      setTab(control.tab as DisplayTab);
    }
  }, [control.tab]);

  // Refetch REST data when the phone signals a refresh (skip the initial value).
  useEffect(() => {
    if (control.refreshToken !== null && control.refreshToken !== lastRefresh.current) {
      if (lastRefresh.current !== null) setRefreshKey((k) => k + 1);
      lastRefresh.current = control.refreshToken;
    }
  }, [control.refreshToken]);

  useEffect(() => {
    let live = true;
    getTournament(tournamentId)
      .then((res) => {
        if (live) {
          setState({ status: "ok", tournament: res.tournament, players: res.players });
        }
      })
      .catch((e) => {
        if (live) {
          setState({
            status: "error",
            error: e instanceof ApiError ? e : new ApiError(0, "UNKNOWN", errorMessage(e)),
          });
        }
      });
    return () => {
      live = false;
    };
  }, [tournamentId, refreshKey]);

  if (state.status === "loading") {
    return (
      <div className="display-shell">
        <div className="display-loading">Loading tournament…</div>
      </div>
    );
  }

  if (state.status === "error") {
    const { error } = state;
    const message =
      error.status === 404
        ? "This tournament was not found, or it is private and this account can't view it."
        : error.status === 0
          ? "Could not reach the server. Check your connection and try again."
          : error.message;
    return (
      <div className="display-shell">
        <div className="display-error-page">
          <h2>Can't open this display</h2>
          <p>{message}</p>
          <Link to="/tournaments" className="display-back-link">
            ← Back to tournaments
          </Link>
        </div>
      </div>
    );
  }

  const { tournament, players } = state;
  return (
    <div className="display-shell" ref={shellRef} data-theme={displayTheme}>
      <TournamentDisplayHeader
        tournament={tournament}
        players={players}
        activeTab={tab}
        onTab={setTab}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        onCyclePalette={cyclePalette}
      />
      <main className="display-content">
        {tab === "clock" && (
          <ClockTab
            tournamentId={tournamentId}
            fullscreen={fullscreen}
            theme={displayTheme}
          />
        )}
        {tab === "seating" && (
          <SeatingTab
            tournamentId={tournamentId}
            refreshKey={refreshKey}
            view={control.seatingView ?? "table"}
          />
        )}
        {tab === "entries" && (
          <EntriesPayoutsTab tournament={tournament} players={players} />
        )}
      </main>
      {fullscreen && (
        <div className="display-fs-controls">
          <button
            type="button"
            className="display-fs-exit"
            title="Change colours"
            onClick={cyclePalette}
          >
            🎨
          </button>
          <button
            type="button"
            className="display-fs-exit"
            title="Exit fullscreen"
            onClick={toggleFullscreen}
          >
            ⛶
          </button>
        </div>
      )}
    </div>
  );
}
