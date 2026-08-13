// Sample room data for the Room Dashboard and Room Details screens.
//
// Each room belongs to a category (Executive / VIP / Standard) and has a
// status. The screens filter this one list by the selected category + status.
// When you add a backend, replace this array with data fetched from your API.

export const CATEGORIES = [
  "Standard", "Standard King", "Standard Queen", "Deluxe King",
  "Deluxe Queen", "King/Queen", "Superior Double", "Superior King/Queen",
];

export const STATUSES = [
  { id: "Available",  dot: "#22c55e", tint: "rgba(34, 197, 94, 0.08)",  panelTint: "#f0fdf4" },
  { id: "Booked",     dot: "#3b82f6", tint: "#eff5fe",                   panelTint: "#eff5fe" },
  { id: "1hour Left", dot: "#f59e0b", tint: "rgba(245, 158, 11, 0.08)",  panelTint: "#fff7ed" },
  { id: "Overdue",    dot: "#ef4444", tint: "rgba(239, 68, 68, 0.08)",   panelTint: "#fef2f2" },
];

export const rooms = [
  // --- Executive ---
  { number: "RM 301", category: "Executive", price: "₦60,000", status: "Available", guestsSoFar: 148 },
  { number: "RM 302", category: "Executive", price: "₦60,000", status: "Available", guestsSoFar: 132 },
  { number: "RM 303", category: "Executive", price: "₦60,000", status: "Available", guestsSoFar: 96 },
  { number: "RM 304", category: "Executive", price: "₦60,000", status: "Booked", guestsSoFar: 210 },
  { number: "RM 305", category: "Executive", price: "₦60,000", status: "Booked", guestsSoFar: 187 },
  { number: "RM 306", category: "Executive", price: "₦60,000", status: "1hour Left", guestsSoFar: 173 },
  { number: "RM 307", category: "Executive", price: "₦60,000", status: "Overdue", guestsSoFar: 145 },
  { number: "RM 308", category: "Executive", price: "₦60,000", status: "Reserved", guestsSoFar: 119 },

  // --- VIP ---
  { number: "RM 201", category: "VIP", price: "₦120,000", status: "Available", guestsSoFar: 88 },
  { number: "RM 202", category: "VIP", price: "₦120,000", status: "Available", guestsSoFar: 76 },
  { number: "RM 203", category: "VIP", price: "₦120,000", status: "Booked", guestsSoFar: 64 },
  { number: "RM 204", category: "VIP", price: "₦120,000", status: "Reserved", guestsSoFar: 51 },

  // --- Standard ---
  { number: "RM 101", category: "Standard", price: "₦35,000", status: "Available", guestsSoFar: 320 },
  { number: "RM 102", category: "Standard", price: "₦35,000", status: "Available", guestsSoFar: 298 },
  { number: "RM 103", category: "Standard", price: "₦35,000", status: "Booked", guestsSoFar: 276 },
  { number: "RM 104", category: "Standard", price: "₦35,000", status: "1hour Left", guestsSoFar: 254 },
  { number: "RM 105", category: "Standard", price: "₦35,000", status: "Overdue", guestsSoFar: 233 },
];

// Counts how many rooms of a given category fall into each status.
// Used to show the numbers next to the status filter rows.
export function countByStatus(category) {
  const counts = {};
  for (const room of rooms) {
    if (room.category === category) {
      counts[room.status] = (counts[room.status] || 0) + 1;
    }
  }
  return counts;
}
