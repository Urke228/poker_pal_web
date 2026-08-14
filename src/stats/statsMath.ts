export interface TournamentEntry {
  id?: string;
  date: string; // ISO yyyy-MM-dd (or legacy display string)
  title: string;
  buyin: number;
  rebuy: number;
  win: number;
}

export interface Overview {
  winRate: number;
  earnings: number;
  roi: number;
  netProfit: number;
  winRateChange: number | null;
  earningsChange: number | null;
  roiChange: number | null;
}

function cost(e: TournamentEntry): number {
  return (e.buyin || 0) + (e.rebuy || 0);
}

function computeFor(entries: TournamentEntry[]) {
  let totalBuyin = 0;
  let totalRebuy = 0;
  let totalWin = 0;
  for (const e of entries) {
    totalBuyin += e.buyin || 0;
    totalRebuy += e.rebuy || 0;
    totalWin += e.win || 0;
  }
  const totalCost = totalBuyin + totalRebuy;
  const profitLoss = totalWin - totalCost;
  const played = entries.length;
  const profitable = entries.filter((e) => e.win > cost(e)).length;
  const winRate = played > 0 ? (profitable / played) * 100 : 0;
  const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
  return { totalWin, totalCost, profitLoss, winRate, roi };
}

/** Mirrors StatsScreen's overview math, including the "vs. previous entry" deltas. */
export function computeOverview(entries: TournamentEntry[]): Overview {
  const cur = computeFor(entries);
  const prevList = entries.length > 1 ? entries.slice(0, -1) : [];
  const hasPrev = prevList.length > 0;
  const prev = computeFor(prevList);

  return {
    winRate: cur.winRate,
    earnings: cur.totalWin,
    roi: cur.roi,
    netProfit: cur.profitLoss,
    winRateChange: hasPrev ? cur.winRate - prev.winRate : null,
    earningsChange: hasPrev ? cur.totalWin - prev.totalWin : null,
    roiChange: hasPrev ? cur.roi - prev.roi : null,
  };
}

export interface ChartPoint {
  dateMs: number;
  cumulative: number;
  label: string;
}

/** Cumulative profit over time, sorted by date — feeds the profit chart. */
export function buildChartData(entries: TournamentEntry[]): ChartPoint[] {
  const sorted = [...entries].sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date),
  );
  let cum = 0;
  return sorted.map((e) => {
    cum += e.win - cost(e);
    const dateMs = Date.parse(e.date) || Date.now();
    return {
      dateMs,
      cumulative: cum,
      label: e.title,
    };
  });
}
