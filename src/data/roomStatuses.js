// Shared definitions for the five room statuses.
//
// Each status has a dot color (used in the filter panel and as a corner dot)
// and a soft tint (used as the room card background). Keeping these here means
// the filter panel and the room cards always agree on colors.


export const STATUSES = [
  { id: "Available",  dot: "#22c55e", tint: "rgba(34, 197, 94, 0.08)",  panelTint: "#f0fdf4" },
  { id: "Booked",     dot: "#3b82f6", tint: "#eff5fe",                   panelTint: "#eff5fe" },
  { id: "1hour Left", dot: "#f59e0b", tint: "rgba(245, 158, 11, 0.08)",  panelTint: "#fff7ed" },
  { id: "Overdue",    dot: "#ef4444", tint: "rgba(239, 68, 68, 0.08)",   panelTint: "#fef2f2" },
];

// Quick lookup by id, e.g. statusById["Booked"].dot
export const statusById = Object.fromEntries(STATUSES.map((s) => [s.id, s]));
