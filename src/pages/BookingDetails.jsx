import { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import GuestInfoCard from "../components/GuestInfoCard.jsx";
import { getRoomGuest, getStayGuests } from "../api.js";

// Booking Details is opened from a booked room. It fetches the room's active
// guest(s) on open and shows the booking facts, the check-in timeline, and a
// card per guest (primary + any co-guests).
//
// Props:
//   roomId     -> which room's booking to load
//   onClose    -> close the popup
//   onCheckout -> called when "Checkout Guest" is clicked (wired in the
//                 dashboard to hit the API + refresh)

// --- Date/number helpers (same style as the reservation popup). ---
function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
function naira(n) {
  if (n == null) return "—";
  return "₦" + Number(n).toLocaleString();
}

export default function BookingDetails({ roomId, stayId, onClose, onCheckout }) {
  const [guests, setGuests] = useState([]);   // array of guest rows from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the room's active guest(s) once, on open.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Prefer stayId (history: a specific, possibly past stay).
        // Fall back to roomId (dashboard: the room's active stay).
        const rows = stayId ? await getStayGuests(stayId) : await getRoomGuest(roomId);
        if (!cancelled) setGuests(rows);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [roomId, stayId]);

  // The stay-level facts (amount, payment, check-in time) are the same on every
  // returned row, so we read them from the first guest.
  const stay = guests[0] || null;

  const subtitle = (
    <>
      <strong>Booked room</strong>
    </>
  );

  const footer = (
    <>
      <button className="modal-btn modal-btn--ghost" onClick={onClose}>
        Cancel
      </button>
      {onCheckout && (
        <button className="modal-btn modal-btn--solid" onClick={onCheckout} disabled={loading || !!error}>
          Checkout Guest
        </button>
      )}
    </>
  );

  // Turn each API guest row into the { tag, fields } shape GuestInfoCard wants.
  // Primary guest is "Guest 1"; co-guests are numbered separately.
  let coCount = 0;
  const guestCards = guests.map((g, i) => {
    const tag = g.is_primary ? "Guest 1" : `Co-guest ${++coCount}`;
    return {
      key: g.id ?? i,
      tag,
      fields: [
        { label: "Full Name", value: g.name || "—" },
        { label: "Phone Number", value: g.phone || "—" },
        { label: "Email", value: g.email || "—" },
        { label: "Address", value: g.address || "—" },
      ],
    };
  });

  return (
    <Modal title="Booking Details" subtitle={subtitle} onClose={onClose} footer={footer}>
      {loading ? (
        <p style={{ padding: "24px", color: "#7b7487" }}>Loading booking…</p>
      ) : error ? (
        <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
      ) : (
        <>
          {/* Booking facts */}
          <div>
            <div className="section-divider">
              <span className="section-divider__label">Booking Details</span>
              <span className="section-divider__line" />
            </div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-row__label">Amount Paid</span>
                <span className="detail-row__value">{naira(stay?.amount_paid)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Mode of Payment</span>
                <span className="detail-row__value">{stay?.payment_method || "—"}</span>
              </div>
            </div>
          </div>

          {/* Check-in timeline (expected check-out isn't stored yet). */}
          <div className="timeline">
            <div>
              <div className="timeline__label">Check-in</div>
              <div className="timeline__date">{formatDate(stay?.check_in)}</div>
              <div className="timeline__time">{formatTime(stay?.check_in)}</div>
            </div>
            <div className="timeline__connector" />
            <div className="timeline__end">
              <div className="timeline__label">Expected Check-out</div>
              <div className="timeline__date">{formatDate(stay?.expected_checkout)}</div>
              <div className="timeline__time">{formatTime(stay?.expected_checkout)}</div>
            </div>
          </div>

          {/* Guests (primary + co-guests) */}
          <div>
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Guest Details</span>
              <span className="section-divider__line" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {guestCards.map((guest) => (
                <GuestInfoCard key={guest.key} tag={guest.tag} fields={guest.fields} />
              ))}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
