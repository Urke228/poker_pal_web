import { useEffect, useState } from "react";
import { getTournamentSeating } from "../../api/seating";
import { errorMessage } from "../../api/client";
import type { Seating } from "../../api/types";
import { SeatingGraphical } from "./SeatingGraphical";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; seating: Seating | null };

/** Read-only display of the seating the organizer published from the app. */
export function SeatingTab({
  tournamentId,
  refreshKey = 0,
  view = "table",
}: {
  tournamentId: string;
  /** Bump to refetch — driven by the phone's "refresh display" signal. */
  refreshKey?: number;
  /** "table" (list) or "graphical" (poker-table ovals), chosen from the phone. */
  view?: string;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let live = true;
    getTournamentSeating(tournamentId)
      .then((seating) => live && setState({ status: "ok", seating }))
      .catch((e) => live && setState({ status: "error", message: errorMessage(e) }));
    return () => {
      live = false;
    };
  }, [tournamentId, refreshKey]);

  if (state.status === "loading") {
    return <div className="display-panel display-muted">Loading seating…</div>;
  }
  if (state.status === "error") {
    return <div className="display-panel display-error">{state.message}</div>;
  }

  const seating = state.seating;
  if (!seating || seating.tables.length === 0) {
    return (
      <div className="display-panel display-empty">
        <p>No seating published yet.</p>
        <p className="display-hint">
          The organizer generates and publishes seating from the app.
        </p>
      </div>
    );
  }

  const anySeated = seating.tables.some((table) => table.some((seat) => seat));
  if (!anySeated) {
    return (
      <div className="display-panel display-empty">
        <p>No players are seated yet.</p>
      </div>
    );
  }

  if (view === "graphical") {
    return <SeatingGraphical tables={seating.tables} />;
  }

  return (
    <div className="seating-grid">
      {seating.tables.map((seats, ti) => (
        <section className="seating-table" key={ti}>
          <h3 className="seating-table-title">Table {ti + 1}</h3>
          <ol className="seating-seats">
            {seats.map((name, si) => (
              <li className={`seating-seat ${name ? "" : "is-empty"}`} key={si}>
                <span className="seating-seat-no">Seat {si + 1}</span>
                <span className="seating-seat-name">{name ?? "Empty"}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
