// api.js — one place that knows how to talk to our backend.
//
// Every screen imports the helpers from here instead of writing fetch() calls
// all over the place. If the backend address ever changes, we edit ONE line.

// Where the backend lives. (Your Express server runs on port 4000.)
const BASE_URL = "http://localhost:4000";

// A small wrapper around fetch that:
//   - prefixes the base URL
//   - sends/receives JSON
//   - throws a clear error if the response isn't OK, so callers can catch it
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Try to read the JSON body (works for both success and error responses).
  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some responses (or failures) may have no JSON body — that's fine.
  }

  // fetch() only rejects on network failure, NOT on 400/500 responses. So we
  // check response.ok ourselves and throw, using the server's error message.
  if (!response.ok) {
    const message = (data && data.error) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

// ----- Rooms -----

// Get rooms, optionally filtered by category and/or status.
// Builds a query string like "?category=VIP&status=Available".
export function getRooms({ category, status, activeOnly } = {}) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (status) params.append("status", status);
  if (activeOnly) params.append("active_only", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/rooms${query}`);
}

// ----- Guests -----

export function searchGuests(term) {
  return request(`/api/guests/search?q=${encodeURIComponent(term)}`);
}

export function addGuest(guest) {
  return request("/api/guests", {
    method: "POST",
    body: JSON.stringify(guest),
  });
}

// ----- Check-in / checkout -----

export function checkIn(payload) {
  return request("/api/checkin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getRoomGuest(roomId) {
  return request(`/api/rooms/${roomId}/guest`);
}

export function checkOut(roomId) {
  return request(`/api/rooms/${roomId}/checkout`, { method: "POST" });
}

// ----- Reservations -----
//
// A reservation is a HEADER (who, when, how paid) plus one row per reserved
// ROOM. Rooms are auto-assigned at creation; reception can swap or cancel any
// individual room afterwards from the Reservations table.

// How many rooms of each category are free across a date range, with prices.
// Feeds the "N available" and price columns on the create form.
export function getRoomAvailability(start, end) {
  const params = new URLSearchParams({ start, end });
  return request(`/api/rooms/availability?${params.toString()}`);
}

// Create a reservation across one or more categories.
// payload: { guest_id, start_date, end_date, payment_method,
//            rooms: [ { category, qty, amount } ] }
export function createReservation(payload) {
  return request("/api/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Every upcoming reservation, one entry per reserved room. Each entry carries
// the reserver's details and the rooms it could be swapped to (room_options).
export function getReservations() {
  return request("/api/reservations");
}

// Swap the room assigned to one reserved room.
export function assignReservationRoom(id, roomId) {
  return request(`/api/reservation-rooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ room_id: roomId }),
  });
}

// Cancel ONE reserved room. Refunds that room's share to the account if it was
// paid on a tab; removes the whole reservation if it was the last room.
export function cancelReservationRoom(id) {
  return request(`/api/reservation-rooms/${id}`, { method: "DELETE" });
}

// Turn one reserved room into a stay. Does NOT charge again — the money was
// taken when the reservation was made.
// payload: { primary_guest_id, co_guest_ids: [] }
export function checkInReservationRoom(id, payload) {
  return request(`/api/reservation-rooms/${id}/checkin`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----- Bar: products & categories -----

export function getProducts({ bar_location, category_id } = {}) {
  const params = new URLSearchParams();
  if (bar_location) params.append("bar_location", bar_location);
  if (category_id) params.append("category_id", category_id);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/products${query}`);
}

export function getBarCategories() {
  return request("/api/bar-categories");
}

// ----- Bar: cart -----

export function getCart(barLocation) {
  return request(`/api/cart?bar_location=${encodeURIComponent(barLocation)}`);
}

export function addToCart(productId, barLocation) {
  return request("/api/cart", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, bar_location: barLocation }),
  });
}

export function updateCartItem(id, quantity) {
  return request(`/api/cart/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(id) {
  return request(`/api/cart/${id}`, { method: "DELETE" });
}

// ----- Bar: checkout (Print Receipt) -----

export function checkoutOrder(barLocation, paymentMethod) {
  return request("/api/checkout-order", {
    method: "POST",
    body: JSON.stringify({ bar_location: barLocation, payment_method: paymentMethod }),
  });
}

// ----- Admin: room management -----

export function disableRoom(id, isDisabled) {
  return request(`/api/rooms/${id}/disable`, {
    method: "PATCH",
    body: JSON.stringify({ is_disabled: isDisabled }),
  });
}

export function updateRoom(id, fields) {
  return request(`/api/rooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export function getRoomGuestCount(id) {
  return request(`/api/rooms/${id}/guest-count`);
}

// ----- Admin: bar product management -----

export function addProduct(product) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updateProduct(id, fields) {
  return request(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export function addBarCategory(name) {
  return request("/api/bar-categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// ----- Admin: reports -----

export function getReportOrders(limit = 10) {
  return request(`/api/reports/orders?limit=${limit}`);
}

export function getOrderDetail(id) {
  return request(`/api/orders/${id}`);
}

export function getReportSummary() {
  return request("/api/reports/summary");
}

// ----- Admin: guest database -----

export function getRankedGuests(page = 1, pageSize = 10, search = "") {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.append("search", search);
  return request(`/api/guests/ranked?${params.toString()}`);
}

export function getGuestProfile(id) {
  return request(`/api/guests/${id}/profile`);
}

// ----- Admin: dashboard -----

export function getDashboardStats() {
  return request("/api/dashboard/stats");
}

export function getOccupiedRooms() {
  return request("/api/dashboard/occupied-rooms");
}

export function deleteProduct(id) {
  return request(`/api/products/${id}`, { method: "DELETE" });
}

export function getRevenueByBar() {
  return request("/api/reports/revenue-by-bar");
}

export function getRevenueByCategory() {
  return request("/api/dashboard/revenue-by-category");
}

export function getOccupancyByCategory() {
  return request("/api/dashboard/occupancy-by-category");
}

export function getRoomStatusCounts({ category, activeOnly } = {}) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (activeOnly) params.append("active_only", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/rooms/status-counts${query}`);
}

// ----- Store: stock & categories -----

export function getStockItems({ category_id } = {}) {
  const params = new URLSearchParams();
  if (category_id) params.append("category_id", category_id);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/stock${query}`);
}

export function getStockCategories() {
  return request("/api/stock-categories");
}

export function addStockCategory(name) {
  return request("/api/stock-categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// ----- Admin: store stock management -----

export function addStockItem(item) {
  return request("/api/stock", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export function updateStockItem(id, fields) {
  return request(`/api/stock/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}


// ----- Store: movements & history -----

export function getStockMovements(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return request(`/api/stock-movements${query}`);
}

export function getStockMovementDetail(id) {
  return request(`/api/stock-movements/${id}`);
}

export function createStockMovement(payload) {
  return request("/api/stock-movements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----- Admin: corporate accounts -----

export function getAccounts() {
  return request("/api/accounts");
}

export function getAccountStats() {
  return request("/api/accounts/stats");
}

export function getAccount(id) {
  return request(`/api/accounts/${id}`);
}

export function getAccountSummary(id) {
  return request(`/api/accounts/${id}/summary`);
}

export function createAccount(payload) {
  return request("/api/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAccount(id, fields) {
  return request(`/api/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export function setAccountStatus(id, status) {
  return request(`/api/accounts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function depositToAccount(id, amount) {
  return request(`/api/accounts/${id}/deposit`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function getStayGuests(stayId) {
  return request(`/api/stays/${stayId}/guests`);
}

export function topUpStockItem(id, amount) {
  return request(`/api/stock/${id}/topup`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}