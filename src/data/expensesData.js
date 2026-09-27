// Mock expenses data — frontend only.
//
// The main table lists expenses PAID at the time they were incurred. Unpaid
// ones sit behind the Expenses Card and live in UNPAID_EXPENSES below.

// Category tints, matching the design.
export const CATEGORY_STYLES = {
  "Diesel":       { bg: "#e4ddeb", fg: "#1d1a24" },
  "Utilities":    { bg: "#e0f2fe", fg: "#0369a1" },
  "Bar Restock":  { bg: "#fce7f3", fg: "#be185d" },
  "Maintenance":  { bg: "#fef3c7", fg: "#b45309" },
  "Housekeeping": { bg: "#e0e7ff", fg: "#4338ca" },
};

// Category colours only. Every figure now comes from the API; this stays so
// the table pills and the popup pills read from one place and can't drift.