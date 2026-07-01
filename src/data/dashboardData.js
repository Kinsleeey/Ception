// All the numbers shown on the admin dashboard live here, separated
// from the page layout. When you connect a real backend later, this is
// the file you'd replace with fetched data — the page won't need to change.

export const revenueRows = [
  { period: "Daily", executive: "₦145,000", premium: "₦92,000", standard: "₦55,000", total: "₦292,000" },
  { period: "Weekly", executive: "₦1,015,000", premium: "₦644,000", standard: "₦385,000", total: "₦2,044,000" },
  { period: "Monthly", executive: "₦4,350,000", premium: "₦2,760,000", standard: "₦1,650,000", total: "₦8,760,000" },
];

export const occupancyRows = [
  { period: "Daily", executive: "8", premium: "12", standard: "24", total: "44" },
  { period: "Weekly", executive: "52", premium: "84", standard: "168", total: "304" },
  { period: "Monthly", executive: "210", premium: "340", standard: "720", total: "1,270" },
];

// Column headers shared by both tables (first column has no header in the design).
export const roomColumns = ["Executive", "Premium", "Standard", "Total"];

export const monthlyTargetPercent = 72; // drives the progress bars
