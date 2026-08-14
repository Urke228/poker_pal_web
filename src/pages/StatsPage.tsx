import { useState } from "react";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../auth/AuthContext";
import { useTournamentEntries, addTournamentEntry, deleteTournamentEntry } from "../stats/useTournamentEntries";
import { computeOverview, buildChartData } from "../stats/statsMath";
import { OverviewCard } from "../stats/OverviewCard";
import { ProfitChart } from "../stats/ProfitChart";
import { EntriesTable } from "../stats/EntriesTable";
import { AddEntryModal } from "../stats/AddEntryModal";
import "../stats/stats.css";

export function StatsPage() {
  const { user } = useAuth();
  const { entries, ready } = useTournamentEntries();
  const [showAdd, setShowAdd] = useState(false);

  const overview = computeOverview(entries);
  const chartData = buildChartData(entries);

  return (
    <div>
      <TopBar />
      <main className="stats-main">
        <h1>Performance Overview</h1>

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
                value={`$${overview.earnings.toFixed(2)}`}
                change={overview.earningsChange}
                isCurrencyChange
              />
              <OverviewCard label="ROI" value={`${overview.roi.toFixed(1)}%`} change={overview.roiChange} />
              <OverviewCard label="Net Profit" value={`$${overview.netProfit.toFixed(2)}`} />
            </div>

            <h2>Profit Over Time</h2>
            <ProfitChart data={chartData} />

            <h2>Tournament Entries</h2>
            <div className="stats-add-row">
              <button className="stats-add-btn" onClick={() => setShowAdd(true)}>
                + Add Tournament
              </button>
            </div>
            <div style={{ height: 12 }} />
            <EntriesTable
              entries={entries}
              onDelete={(id) => user && deleteTournamentEntry(user.uid, id)}
            />
          </>
        )}
      </main>

      {showAdd && user && (
        <AddEntryModal
          onClose={() => setShowAdd(false)}
          onSave={(entry) => addTournamentEntry(user.uid, entry)}
        />
      )}
    </div>
  );
}
