/**
 * Graphical seating: each table drawn as a felt oval with the seats placed
 * around it, mirroring the phone app's seating view. Read-only.
 */
export function SeatingGraphical({ tables }: { tables: (string | null)[][] }) {
  // Adapt the grid so 1 table is roomy and up to ~6 still fit: 1→1 col, 2/3/4→2,
  // 5/6→3. Tables keep a 4:3 aspect and scale their own text (container query),
  // so they shrink gracefully as more are shown.
  const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(tables.length))));
  return (
    <div
      className="seating-graphical"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        maxWidth: cols === 1 ? 560 : undefined,
        marginInline: cols === 1 ? "auto" : undefined,
      }}
    >
      {tables.map((seats, ti) => (
        <PokerTable key={ti} label={`Table ${ti + 1}`} seats={seats} />
      ))}
    </div>
  );
}

function PokerTable({
  label,
  seats,
}: {
  label: string;
  seats: (string | null)[];
}) {
  const k = Math.max(seats.length, 1);
  return (
    <div className="pt">
      <div className="pt-felt">{label}</div>
      {seats.map((name, i) => {
        // Start at the top (−90°) and go clockwise, like the Flutter table.
        const theta = -Math.PI / 2 + (2 * Math.PI * i) / k;
        const x = 50 + 42 * Math.cos(theta);
        const y = 50 + 40 * Math.sin(theta);
        return (
          <div
            key={i}
            className={`pt-seat ${name ? "" : "is-empty"}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className="pt-seat-no">Seat {i + 1}</span>
            <span className="pt-seat-name">{name ?? "Empty"}</span>
          </div>
        );
      })}
    </div>
  );
}
