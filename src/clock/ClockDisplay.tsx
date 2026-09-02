import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { ClockDoc } from "./clockMath";
import {
  activeLevel,
  formatClock,
  levelNumber,
  levelsUntilBreak,
  payoutPercents,
} from "./clockMath";
import { useNow } from "./useNow";
import { useBeep } from "./useBeep";
import { useAutoFit } from "./useAutoFit";
import { useClockTheme, toggleFullscreen } from "./useClockTheme";
import "./clock.css";

const nf = new Intl.NumberFormat("en-US");

export function ClockDisplay({
  doc,
  onBack,
  chrome = true,
  theme: themeOverride,
}: {
  doc: ClockDoc;
  /** When provided, the corner back control calls this instead of linking to
   * /clocks — used by the tournament display to leave fullscreen in place. */
  onBack?: () => void;
  /** Set false to hide the corner buttons (back/fullscreen/theme) when the
   * board is embedded in the tournament display, which owns those controls. */
  chrome?: boolean;
  /** When provided, use this palette (from the display) instead of the clock's
   * own so the board matches the rest of the display. */
  theme?: string;
}) {
  const now = useNow();
  const { theme: internalTheme, cycleTheme } = useClockTheme();
  const theme = themeOverride ?? internalTheme;
  const innerRef = useRef<HTMLDivElement>(null);

  const levels = doc.levels ?? [];
  const { index, remainingMs } = activeLevel(doc, now);
  const level = levels[index] ?? {
    smallBlind: 0,
    bigBlind: 0,
    ante: 0,
    isBreak: false,
    durationMinutes: 0,
  };

  useBeep(remainingMs, Boolean(doc.isRunning));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "t" || e.key === "T") cycleTheme();
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cycleTheme]);

  useAutoFit(innerRef, [remainingMs, index, theme]);

  const next = levels[index + 1];
  const breakIn = levelsUntilBreak(levels, index);

  const entries = doc.entries ?? 0;
  const remaining = doc.playersRemaining ?? 0;
  const rebuys = doc.rebuys ?? 0;
  const addOns = doc.addOns ?? 0;
  const stack = doc.startingStack ?? 0;
  const buyIn = doc.buyIn ?? 0;
  const chips = (entries + rebuys + addOns) * stack;
  const avg = remaining > 0 ? Math.round(chips / remaining) : 0;
  const pool = (entries + rebuys + addOns) * buyIn;
  const percents = pool > 0 ? payoutPercents(doc) : [];

  const clockClass =
    doc.isRunning && remainingMs <= 60_000 && remainingMs > 0
      ? "urgent"
      : remainingMs <= 0
        ? "over"
        : "";

  return (
    <div className="clock-page" data-theme={theme}>
      {chrome && (
        <>
          {onBack ? (
            <button
              className="clock-corner-btn clock-back-btn"
              title="Exit fullscreen"
              onClick={onBack}
            >
              ←
            </button>
          ) : (
            <Link to="/clocks" className="clock-corner-btn clock-back-btn" title="Back">
              ←
            </Link>
          )}
          <button
            className="clock-corner-btn clock-fs-btn"
            title="Fullscreen (F)"
            onClick={toggleFullscreen}
          >
            ⛶
          </button>
          <button
            className="clock-corner-btn clock-theme-btn"
            title="Change colors (T)"
            onClick={cycleTheme}
          >
            🎨
          </button>
        </>
      )}

      <div className="clock-board">
        <div className="clock-board-inner" ref={innerRef}>
          <div className="clock-tourney-name">{doc.tournamentName ?? ""}</div>

          <div className="clock-level-row">
            <span className="clock-level-badge">
              {level.isBreak ? "BREAK" : `LEVEL ${levelNumber(levels, index)}`}
            </span>
            {!doc.isRunning && <span className="clock-paused">PAUSED</span>}
          </div>

          <div className={`clock-time ${clockClass}`}>{formatClock(remainingMs)}</div>

          {level.isBreak ? (
            <div className="clock-blinds">BREAK</div>
          ) : (
            <>
              <div className="clock-blinds">
                {nf.format(level.smallBlind)} / {nf.format(level.bigBlind)}
              </div>
              {level.ante > 0 && (
                <div className="clock-ante">Ante {nf.format(level.ante)}</div>
              )}
            </>
          )}

          {next && (
            <div className="clock-next">
              Next: {next.isBreak ? "Break" : `${nf.format(next.smallBlind)} / ${nf.format(next.bigBlind)}`}
            </div>
          )}
          {breakIn && <div className="clock-breakin">Break in {breakIn} levels</div>}

          <div className="clock-stats">
            <div className="clock-stat">
              <div className="clock-stat-label">Players</div>
              <div className="clock-stat-value">
                {remaining} / {entries}
              </div>
            </div>
            <div className="clock-stat">
              <div className="clock-stat-label">Avg stack</div>
              <div className="clock-stat-value">{nf.format(avg)}</div>
            </div>
            <div className="clock-stat">
              <div className="clock-stat-label">Chips in play</div>
              <div className="clock-stat-value">{nf.format(chips)}</div>
            </div>
            <div className="clock-stat">
              <div className="clock-stat-label">Prize pool</div>
              <div className="clock-stat-value">${nf.format(pool)}</div>
            </div>
          </div>

          {percents.length > 0 && (
            <div className="clock-payouts">
              {percents.map((p, i) => (
                <div className="clock-payout" key={i}>
                  <span className="place">{i + 1}.</span>$
                  {nf.format(Math.round(p * pool))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
