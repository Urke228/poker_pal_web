import type { Player, TournamentDetail } from "../../api/types";
import { PAYOUT_LABELS } from "../../api/types";
import { entriesSummary, payoutRows, playerTotal } from "../../tournament/payouts";
import { formatMoney } from "../../format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="entries-stat">
      <div className="entries-stat-label">{label}</div>
      <div className="entries-stat-value">{value}</div>
    </div>
  );
}

/**
 * Tournament-wide financial display (not personal stats): summary, the player
 * table, the payout structure, and final results once finished. Every value
 * comes from GET /tournaments/:id; only the prize pool and payout amounts are
 * derived (shared util, same formula as the backend/clock).
 */
export function EntriesPayoutsTab({
  tournament,
  players,
}: {
  tournament: TournamentDetail;
  players: Player[];
}) {
  const summary = entriesSummary(players, tournament.buyIn);
  const rows = payoutRows(tournament, summary.prizePool);
  const results = tournament.status === "finished" ? tournament.results ?? [] : [];

  return (
    <div className="entries">
      <div className="entries-summary">
        <Stat label="Prize pool" value={formatMoney(summary.prizePool)} />
        <Stat
          label="Players"
          value={`${tournament.participantCount + tournament.guestCount}`}
        />
        <Stat label="Entries" value={`${summary.paidEntries}`} />
        {tournament.allowRebuys && (
          <Stat label="Rebuys" value={`${summary.totalRebuys}`} />
        )}
        {tournament.allowAddons && (
          <Stat label="Add-ons" value={`${summary.totalAddOns}`} />
        )}
      </div>

      {players.length === 0 ? (
        <div className="display-panel display-empty">
          <p>No players registered yet.</p>
        </div>
      ) : (
        <div className="entries-table-wrap">
          <table className="entries-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Buy-in</th>
                <th>Rebuys</th>
                <th>Add-ons</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name}
                    {p.isGuest && <span className="entries-tag">Guest</span>}
                  </td>
                  <td>
                    {p.buyInPaid ? (
                      <span className="entries-paid">Paid</span>
                    ) : (
                      <span className="entries-unpaid">—</span>
                    )}
                  </td>
                  <td>{p.rebuys}</td>
                  <td>{p.addOns}</td>
                  <td>{formatMoney(playerTotal(p, tournament.buyIn))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="entries-block">
        <h3 className="entries-block-title">
          Payouts
          <span className="entries-block-sub">
            {PAYOUT_LABELS[tournament.payoutStructure]}
          </span>
        </h3>
        {rows.length === 0 ? (
          <p className="display-hint">
            Payouts appear once players have paid in.
          </p>
        ) : (
          <ol className="entries-payout-list">
            {rows.map((r) => (
              <li key={r.place}>
                <span className="place">{r.place}</span>
                <span className="amount">{formatMoney(r.amount)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {results.length > 0 && (
        <section className="entries-block">
          <h3 className="entries-block-title">Final results</h3>
          <ol className="entries-result-list">
            {results
              .slice()
              .sort((a, b) => a.place - b.place)
              .map((r) => (
                <li key={`${r.place}-${r.name}`}>
                  <span className="place">{r.place}</span>
                  <span className="name">{r.name}</span>
                  <span className="amount">
                    {r.winnings > 0 ? formatMoney(r.winnings) : ""}
                  </span>
                </li>
              ))}
          </ol>
        </section>
      )}
    </div>
  );
}
