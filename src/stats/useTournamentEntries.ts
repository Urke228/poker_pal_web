import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../api/client";
import { getMyStats } from "../api/stats";
import type { StatsResponse } from "../api/types";

const EMPTY: StatsResponse = {
  overview: {
    played: 0,
    totalBuyin: 0,
    totalRebuy: 0,
    totalCost: 0,
    totalWin: 0,
    profitLoss: 0,
    winRate: 0,
    roi: 0,
    winRateChange: null,
    earningsChange: null,
    roiChange: null,
  },
  entries: [],
  chart: [],
};

/**
 * Loads statistics from the API, which owns the arithmetic. The web client no
 * longer computes win rate, ROI or the profit series itself, so it cannot
 * drift away from what the mobile app reports.
 *
 * There is no live listener here: a user's own history only changes in
 * response to their own actions, so refetching after a write is enough.
 */
export function useTournamentStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsResponse>(EMPTY);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      setStats(await getMyStats());
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, ready, error, reload };
}
