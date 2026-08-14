export function OverviewCard({
  label,
  value,
  change,
  isCurrencyChange = false,
}: {
  label: string;
  value: string;
  change?: number | null;
  isCurrencyChange?: boolean;
}) {
  return (
    <div className="overview-card">
      <div className="overview-label">{label}</div>
      <div className="overview-value-row">
        <span className="overview-value">{value}</span>
        {change != null && (
          <span className={`overview-change ${change >= 0 ? "up" : "down"}`}>
            {change >= 0 ? "▲" : "▼"}{" "}
            {isCurrencyChange ? "$" : ""}
            {Math.abs(change).toFixed(1)}
            {isCurrencyChange ? "" : "%"}
          </span>
        )}
      </div>
    </div>
  );
}
