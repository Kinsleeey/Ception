import { useState, useEffect } from "react";
import { CloseIcon } from "../components/icons.jsx";
import { getRoomReservation } from "../api.js";

// "View Details" popup for a reserved room. Fetches the reservation for the
// given room on open, then shows booking facts, the start/end dates, the guest
// card, and a "Cancel Reservation" button.
//
// Props:
//   roomId   -> which room's reservation to load
//   onClose  -> close the popup
//   onCancel -> called when "Cancel Reservation" is confirmed (wired in the
//               dashboard to hit the API + refresh)

// --- Small date helpers: turn a timestamp into a date + a time string. ---
function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }); // e.g. "17 Jun 2026"
}
function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }); // e.g. "2:00 PM"
}
// Nights between two timestamps (at least 1).
function nightsBetween(start, end) {
  if (!start || !end) return null;
  const nights = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}
// Format a number as naira.
function naira(n) {
  if (n == null) return "—";
  return "₦" + Number(n).toLocaleString();
}

export default function ReservationDetailsModal({ roomId, onClose, onCancel }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the reservation once, when the popup opens.
  useEffect(() => {
    let cancelled = false; // guard against setting state if it closes mid-fetch
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await getRoomReservation(roomId);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [roomId]);

  // Derived display values (only meaningful once data has loaded).
  const nights = data ? nightsBetween(data.start_date, data.end_date) : null;
  const bookingRows = data
    ? [
        { label: "Duration of Stay", value: nights ? `${nights} ${nights === 1 ? "Night" : "Nights"}` : "—" },
        { label: "Amount Paid", value: naira(data.amount_paid) },
        { label: "Mode of Payment", value: data.payment_method || "—" },
      ]
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Reservation Details</h2>
          <div className="modal-subtitle">
            <strong>Reserved room</strong>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading reservation…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : (
            <>
              {/* Booking Details */}
              <div>
                <div className="section-divider" style={{ marginBottom: "0" }}>
                  <span className="section-divider__label">BOOKING DETAILS</span>
                  <span className="section-divider__line" />
                </div>
                <div className="detail-rows">
                  {bookingRows.map((row) => (
                    <div className="detail-row" key={row.label}>
                      <span className="detail-row__label">{row.label}</span>
                      <span className="detail-row__value">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start / End dates with dashed connector */}
              <div className="res-dates">
                <div>
                  <div className="res-dates__label">Start Date and Time</div>
                  <div className="res-dates__value">{formatDate(data.start_date)}</div>
                  <div className="res-dates__time">{formatTime(data.start_date)}</div>
                </div>
                <div className="res-dates__connector" />
                <div className="res-dates__end">
                  <div className="res-dates__label">End Date and Time</div>
                  <div className="res-dates__value">{formatDate(data.end_date)}</div>
                  <div className="res-dates__time">{formatTime(data.end_date)}</div>
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <div className="section-divider" style={{ marginBottom: "15.5px" }}>
                  <span className="section-divider__label">GUEST DETAILS</span>
                  <span className="section-divider__line" />
                </div>
                <div className="res-guest-card">
                  <span className="res-guest-card__tag">Guest 1</span>
                  <div className="res-guest-grid">
                    <div className="res-guest-col">
                      <div>
                        <div className="res-guest-field__label">Full Name</div>
                        <div className="res-guest-field__value">{data.name}</div>
                      </div>
                      <div>
                        <div className="res-guest-field__label">Email</div>
                        <div className="res-guest-field__value">{data.email || "—"}</div>
                      </div>
                    </div>
                    <div className="res-guest-col">
                      <div>
                        <div className="res-guest-field__label">Phone Number</div>
                        <div className="res-guest-field__value">{data.phone || "—"}</div>
                      </div>
                      <div>
                        <div className="res-guest-field__label">Address</div>
                        <div className="res-guest-field__value">{data.address || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer: single purple button. Uses onCancel (wired in the dashboard). */}
        <div className="modal-footer">
          <button
            className="modal-btn modal-btn--solid modal-btn--solid-full"
            onClick={onCancel}
            disabled={loading || !!error}
          >
            Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  );
}