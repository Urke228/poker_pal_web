/**
 * Wire types mirroring poker_pal_api/src/types/models.ts.
 *
 * Field names follow the stored Firestore documents, which is why a
 * tournament has `buyIn` while a stats entry has `buyin`. Keep them as they
 * are — both clients and the existing data depend on it.
 *
 * `erasableSyntaxOnly` is on in this project, so unions of string literals
 * are used instead of enums.
 */

export const PAYOUT_STRUCTURES = [
  "standard",
  "top-heavy",
  "flat",
  "winner-takes-all",
  "manual",
] as const;
export type PayoutStructure = (typeof PAYOUT_STRUCTURES)[number];

export const PAYOUT_LABELS: Record<PayoutStructure, string> = {
  standard: "Standard (50/30/20)",
  "top-heavy": "Top Heavy (70/20/10)",
  flat: "Flat (40/30/20/10)",
  "winner-takes-all": "Winner Takes All",
  manual: "Manual Input",
};

export type TournamentStatus = "open" | "finished";

export interface TournamentResult {
  uid: string | null;
  name: string;
  place: number;
  winnings: number;
}

export interface Tournament {
  id: string;
  name: string;
  /** ISO 8601, or null when the stored value was unreadable. */
  dateTime: string | null;
  buyIn: number;
  playerLimit: number;
  payoutStructure: PayoutStructure;
  manualPayouts?: number[];
  isPublic: boolean;
  inviteCode?: string;
  description: string;
  rules: string;
  allowRebuys: boolean;
  allowAddons: boolean;
  lateRegistration: boolean;
  createdBy: string;
  createdAt: string | null;
  participants: string[];
  status: TournamentStatus;
  results?: TournamentResult[];
  finalizedAt?: string | null;
  /** Guest players (roster rows without an account); only sent by the list. */
  guestCount?: number;
}

export interface TournamentDetail extends Tournament {
  organizerName: string;
  participantCount: number;
  guestCount: number;
}

export interface Player {
  id: string;
  uid: string | null;
  name: string;
  isGuest: boolean;
  buyInPaid: boolean;
  rebuys: number;
  addOns: number;
}

/**
 * A published seating chart. `tables[t][s]` is the seated player's display name
 * or null for an empty seat (table `t + 1`, seat `s + 1`). Published from the
 * organizer app; the web display is read-only.
 */
export interface Seating {
  tables: (string | null)[][];
  publishedAt: string | null;
}

/** The body accepted by POST and PUT /tournaments. */
export interface TournamentInput {
  name: string;
  dateTime: string;
  buyIn: number;
  playerLimit: number;
  payoutStructure: PayoutStructure;
  manualPayouts?: number[];
  isPublic: boolean;
  inviteCode?: string;
  description: string;
  rules: string;
  allowRebuys: boolean;
  allowAddons: boolean;
  lateRegistration: boolean;
}

export interface StatsEntry {
  id: string;
  date: string;
  title: string;
  buyin: number;
  rebuy: number;
  win: number;
}

export interface StatsOverview {
  played: number;
  totalBuyin: number;
  totalRebuy: number;
  totalCost: number;
  totalWin: number;
  profitLoss: number;
  winRate: number;
  roi: number;
  winRateChange: number | null;
  earningsChange: number | null;
  roiChange: number | null;
}

export interface StatsChartPoint {
  dateMs: number;
  cumulative: number;
  label: string;
}

export interface StatsResponse {
  overview: StatsOverview;
  entries: StatsEntry[];
  chart: StatsChartPoint[];
}
