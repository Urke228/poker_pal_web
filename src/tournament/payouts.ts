import type { Player, Tournament } from "../api/types";

/**
 * Payout split for a structure, as fractions of the prize pool. This is the one
 * source of truth the whole web app uses; it mirrors the backend
 * `payoutFractions` (services/tournaments.ts) and the clock exactly, so every
 * surface shows the same amounts.
 */
export function payoutFractions(
  structure?: string,
  manualPayouts?: number[],
): number[] {
  switch (structure) {
    case "winner-takes-all":
      return [1];
    case "top-heavy":
      return [0.7, 0.2, 0.1];
    case "flat":
      return [0.4, 0.3, 0.2, 0.1];
    case "manual":
      return manualPayouts && manualPayouts.length
        ? manualPayouts.map((p) => p / 100)
        : [1];
    case "standard":
    default:
      return [0.5, 0.3, 0.2];
  }
}

export interface EntriesSummary {
  paidEntries: number;
  totalRebuys: number;
  totalAddOns: number;
  prizePool: number;
}

/**
 * Prize pool the same way the backend, roster and clock compute it:
 * `(paid entries + rebuys + add-ons) × buy-in`. The raw inputs come from the
 * server (`GET /tournaments/:id` players); only this trivial sum is done here.
 */
export function entriesSummary(players: Player[], buyIn: number): EntriesSummary {
  const paidEntries = players.filter((p) => p.buyInPaid).length;
  const totalRebuys = players.reduce((sum, p) => sum + p.rebuys, 0);
  const totalAddOns = players.reduce((sum, p) => sum + p.addOns, 0);
  return {
    paidEntries,
    totalRebuys,
    totalAddOns,
    prizePool: (paidEntries + totalRebuys + totalAddOns) * buyIn,
  };
}

export interface PayoutRow {
  place: number;
  amount: number;
}

export function payoutRows(
  t: Pick<Tournament, "payoutStructure" | "manualPayouts">,
  pool: number,
): PayoutRow[] {
  if (pool <= 0) return [];
  return payoutFractions(t.payoutStructure, t.manualPayouts).map((f, i) => ({
    place: i + 1,
    amount: Math.round(f * pool),
  }));
}

/** What a player has put into the pool: (buy-in if paid + rebuys + add-ons) × buy-in. */
export function playerTotal(p: Player, buyIn: number): number {
  return ((p.buyInPaid ? 1 : 0) + p.rebuys + p.addOns) * buyIn;
}
