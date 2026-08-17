/** Display helpers shared by the tournament pages. */

export function formatDate(iso: string | null): string {
  if (!iso) return "Date not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date not set";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(value: number): string {
  return value === 0 ? "Free" : `$${value.toFixed(2)}`;
}
