import { useState } from "react";
import { TopBar } from "../components/TopBar";
import { useTournamentStats } from "../stats/useTournamentEntries";
import { addStatsEntry, deleteStatsEntry } from "../api/stats";
import { errorMessage } from "../api/client";
import { OverviewCard } from "../stats/OverviewCard";
import { ProfitChart } from "../stats/ProfitChart";
import { EntriesTable } from "../stats/EntriesTable";
import { AddEntryModal } from "../stats/AddEntryModal";
import "../stats/stats.css";

export function StatsPage() {
  const { stats, ready, error, reload } = useTournamentStats();
  const [showAdd, setShowAdd] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { overview, entries, chart } = stats;

  const remove = async (id: string) => {
    setActionError(null);
    try {
      await deleteStatsEntry(id);
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  return (
    <div>
      <TopBar />
      <main className="stats-main">
        <h1>Performance Overview</h1>

        {(error || actionError) && (
          <p className="stats-error">{actionError ?? error}</p>
        )}

        {!ready ? (
          <p className="stats-empty">Loading…</p>
        ) : (
          <>
            <div className="overview-grid">
              <OverviewCard
                label="Win Rate"
                value={`${overview.winRate.toFixed(1)}%`}
                change={overview.winRateChange}
              />
              <OverviewCard
                label="Earnings"
                value={`$${overview.totalWin.toFixed(2)}`}
                change={overview.earningsChange}
                isCurrencyChange
              />
              <OverviewCard
                label="ROI"
                value={`${overview.roi.toFixed(1)}%`}
                change={overview.roiChange}
              />
              <OverviewCard
                label="Net Profit"
                value={`$${overview.profitLoss.toFixed(2)}`}
              />
            </div>

            <h2>Profit Over Time</h2>
            <ProfitChart data={chart} />

            <h2>Tournament Entries</h2>
            <div className="stats-add-row">
              <button className="stats-add-btn" onClick={() => setShowAdd(true)}>
                + Add Tournament
              </button>
            </div>
            <div style={{ height: 12 }} />
            <EntriesTable entries={entries} onDelete={(id) => void remove(id)} />
          </>
        )}
      </main>

      {showAdd && (
        <AddEntryModal
          onClose={() => setShowAdd(false)}
          onSave={async (entry) => {
            await addStatsEntry(entry);
            await reload();
          }}
        />
      )}
    </div>
  );
}
