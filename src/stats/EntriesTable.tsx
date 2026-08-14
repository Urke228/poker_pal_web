import type { TournamentEntry } from "./statsMath";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatEntryDate(raw: string): string {
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : dateFormatter.format(parsed);
}

export function EntriesTable({
  entries,
  onDelete,
}: {
  entries: TournamentEntry[];
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) {
    return <p className="stats-empty">No tournament results yet.</p>;
  }
  const sorted = [...entries].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  return (
    <table className="stats-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th className="num">Investment</th>
          <th className="num">Win</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((e) => (
          <tr key={e.id ?? `${e.date}-${e.title}`}>
            <td>{e.title}</td>
            <td>{formatEntryDate(e.date)}</td>
            <td className="num">${(e.buyin + e.rebuy).toFixed(2)}</td>
            <td className="num">${e.win.toFixed(2)}</td>
            <td>
              {e.id && (
                <button className="delete-btn" onClick={() => onDelete(e.id!)}>
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
