import { useClockDoc } from "../../clock/useClockDoc";
import { ClockDisplay } from "../../clock/ClockDisplay";
import { useNow } from "../../clock/useNow";
import {
  activeLevel,
  formatClock,
  levelNumber,
  levelsUntilBreak,
} from "../../clock/clockMath";

const nf = new Intl.NumberFormat("en-US");

/**
 * The Clock tab. Fullscreen is owned by the display shell (so it persists when
 * the phone remote switches tabs): when the shell is fullscreen this renders the
 * full auto-fitting ClockDisplay board (the same component the standalone /clock
 * route uses, with its own chrome hidden); otherwise a contained live clock that
 * leaves the shell layout untouched.
 */
export function ClockTab({
  tournamentId,
  fullscreen,
  theme,
}: {
  tournamentId: string;
  fullscreen: boolean;
  theme: string;
}) {
  const state = useClockDoc(tournamentId);
  const now = useNow();

  if (state.status === "loading") {
    return <div className="display-panel display-muted">Connecting to the clock…</div>;
  }
  if (state.status === "not-found") {
    return (
      <div className="display-panel display-empty">
        <p>No clock started for this tournament yet.</p>
        <p className="display-hint">The organizer starts the clock from the app.</p>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="display-panel display-error">
        Could not read the clock: {state.message}
      </div>
    );
  }

  const doc = state.doc;
  if (fullscreen) {
    return <ClockDisplay doc={doc} chrome={false} theme={theme} />;
  }

  const levels = doc.levels ?? [];
  const { index, remainingMs } = activeLevel(doc, now);
  const level =
    levels[index] ?? {
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      isBreak: false,
      durationMinutes: 0,
    };
  const next = levels[index + 1];
  const breakIn = levelsUntilBreak(levels, index);
  const urgent = doc.isRunning && remainingMs <= 60_000 && remainingMs > 0;

  return (
    <div className="clocktab">
      <div className="clocktab-board">
        {doc.tournamentName && (
          <div className="clocktab-name">{doc.tournamentName}</div>
        )}
        <div className="clocktab-level">
          {level.isBreak ? "BREAK" : `LEVEL ${levelNumber(levels, index)}`}
          {!doc.isRunning && <span className="clocktab-paused"> · PAUSED</span>}
        </div>
        <div className={`clocktab-time ${urgent ? "is-urgent" : ""}`}>
          {formatClock(remainingMs)}
        </div>
        {level.isBreak ? (
          <div className="clocktab-blinds">BREAK</div>
        ) : (
          <>
            <div className="clocktab-blinds">
              {nf.format(level.smallBlind)} / {nf.format(level.bigBlind)}
            </div>
            {level.ante > 0 && (
              <div className="clocktab-ante">Ante {nf.format(level.ante)}</div>
            )}
          </>
        )}
        {next && (
          <div className="clocktab-next">
            Next:{" "}
            {next.isBreak
              ? "Break"
              : `${nf.format(next.smallBlind)} / ${nf.format(next.bigBlind)}`}
          </div>
        )}
        {breakIn && <div className="clocktab-breakin">Break in {breakIn} levels</div>}
      </div>
    </div>
  );
}
