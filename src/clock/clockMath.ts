import { payoutFractions } from "../tournament/payouts";

export interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationMinutes: number;
  isBreak: boolean;
  name?: string;
}

export interface ClockDoc {
  tournamentName?: string;
  buyIn?: number;
  payoutStructure?: string;
  manualPayouts?: number[];
  levels?: BlindLevel[];
  currentLevelIndex?: number;
  isRunning?: boolean;
  levelEndsAtMs?: number | null;
  pausedRemainingMs?: number;
  startingStack?: number;
  entries?: number;
  playersRemaining?: number;
  rebuys?: number;
  addOns?: number;
}

export interface ActiveLevel {
  index: number;
  remainingMs: number;
}

/**
 * The level that's actually active right now, rolling forward through any
 * levels that already elapsed while running — mirrors
 * `ClockState.active()` in the Flutter app so every client (phone, web
 * display) derives the same state from the same stored anchor, without
 * needing a write.
 */
export function activeLevel(doc: ClockDoc, nowMs: number): ActiveLevel {
  const levels = doc.levels ?? [];
  const last = Math.max(0, levels.length - 1);
  if (!doc.isRunning || doc.levelEndsAtMs == null) {
    return {
      index: Math.min(doc.currentLevelIndex ?? 0, last),
      remainingMs: Math.max(0, doc.pausedRemainingMs ?? 0),
    };
  }
  let index = Math.min(doc.currentLevelIndex ?? 0, last);
  let end = doc.levelEndsAtMs;
  while (nowMs > end && index < last) {
    index++;
    end += (levels[index].durationMinutes ?? 0) * 60_000;
  }
  return { index, remainingMs: Math.max(0, end - nowMs) };
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function levelNumber(levels: BlindLevel[], idx: number): number {
  let n = 0;
  for (let i = 0; i <= idx && i < levels.length; i++) {
    if (!levels[i].isBreak) n++;
  }
  return n === 0 ? 1 : n;
}

export function levelsUntilBreak(levels: BlindLevel[], idx: number): number | null {
  for (let i = idx + 1; i < levels.length; i++) {
    if (levels[i].isBreak) return i - idx;
  }
  return null;
}

// Single source of truth, shared with the tournament display's Entries & Payouts.
export function payoutPercents(doc: ClockDoc): number[] {
  return payoutFractions(doc.payoutStructure, doc.manualPayouts);
}
