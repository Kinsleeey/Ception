import { useState, useEffect } from "react";
import { CloseIcon, ChevronDownIcon, ChevronUpIcon } from "./icons.jsx";
import { getGuestProfile } from "../api.js";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
  });
}
// Nights between two timestamps (0 if missing / not yet checked out).
function nights(a, b) {
  if (!a || !b) return 0;
  const n = Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
  return n > 0 ? n : 0;
}

// One stay-history card with an expandable co-guests panel.
function StayCard({ stay }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="stay-card">
      <div className="stay-card__head">
        <div className="stay-card__left">
          <span className="stay-card__room">{stay.room}</span>
          <span className="stay-card__cat">{stay.category}</span>
        </div>
        <span className="stay-card__dates">{stay.range}</span>
      </div>

      <div className="stay-card__grid">
        <div className="stay-card__cell">
          <span className="stay-card__cell-label">Check-in</span>
          <span className="stay-card__cell-value">{stay.checkIn}</span>
        </div>
        <div className="stay-card__cell">
          <span className="stay-card__cell-label">Check-out</span>
          <span className="stay-card__cell-value">{stay.checkOut}</span>
        </div>
        <div className="stay-card__cell">
          <span className="stay-card__cell-label">Payment</span>
          <span className="stay-card__cell-value">{stay.payment}</span>
        </div>
        <div className="stay-card__cell">
          <span className="stay-card__cell-label">Amount Paid</span>
          <span className="stay-card__cell-value">{stay.amount}</span>
        </div>
      </div>

      {stay.coGuests && stay.coGuests.length > 0 && (
        <>
          <button className="coguest-toggle" onClick={() => setOpen((v) => !v)}>
            View Co-guests {open ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
          </button>
          {open && (
            <div className="coguest-panel">
              {stay.coGuests.map((c, i) => (
                <div className="coguest-block" key={i}>
                  <div className="coguest-field">
                    <span className="coguest-field__label">Full Name</span>
                    <span className="coguest-field__value">{c.name}</span>
                  </div>
                  <div className="coguest-field">
                    <span className="coguest-field__label">Phone Number</span>
                    <span className="coguest-field__value">{c.phone || "—"}</span>
                  </div>
                  <div className="coguest-field">
                    <span className="coguest-field__label">Email</span>
                    <span className="coguest-field__value">{c.email || "—"}</span>
                  </div>
                  <div className="coguest-field">
                    <span className="coguest-field__label">Address</span>
                    <span className="coguest-field__value">{c.address || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Props:
//   guestId -> which guest's profile to load
//   onClose -> close the popup
export default function GuestDetailsModal({ guestId, onClose }) {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getGuestProfile(guestId);
        if (!cancelled) setGuest(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [guestId]);

  // Map the API shape into what the cards expect.
  const initials = (guest?.name || "?")
    .split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const stays = (guest?.stays || []).map((s) => ({
    room: s.room_number,
    category: s.room_category,
    range: `${fmtDate(s.check_in)} — ${s.check_out ? fmtDate(s.check_out) : "ongoing"}`,
    checkIn: fmtDateTime(s.check_in),
    checkOut: s.check_out ? fmtDateTime(s.check_out) : "In stay",
    payment: s.payment_method || "—",
    amount: naira(s.amount_paid),
    coGuests: s.co_guests || [],
  }));

  // Totals derived from the stays.
  const totalStays = guest?.stays?.length || 0;
  const totalNights = (guest?.stays || []).reduce((sum, s) => sum + nights(s.check_in, s.check_out), 0);
  const totalSpent = (guest?.stays || []).reduce((sum, s) => sum + Number(s.amount_paid || 0), 0);
  // "Guest since": earliest check-in, else the account's created_at.
  const since = (() => {
    const dates = (guest?.stays || []).map((s) => s.check_in).filter(Boolean).map((d) => new Date(d));
    const earliest = dates.length ? new Date(Math.min(...dates)) : (guest?.created_at ? new Date(guest.created_at) : null);
    return earliest ? earliest.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—";
  })();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guest-popup" onClick={(e) => e.stopPropagation()}>
        <button className="guest-popup__close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        {loading ? (
          <div className="guest-popup__inner"><p style={{ color: "#7b7487" }}>Loading profile…</p></div>
        ) : error ? (
          <div className="guest-popup__inner"><p style={{ color: "#c0392b" }}>Couldn’t load: {error}</p></div>
        ) : (
          <div className="guest-popup__inner">
            {/* Avatar header */}
            <div className="guest-popup__header">
              <div className="guest-popup__avatar">{initials}</div>
              <div className="guest-popup__name">{guest.name}</div>
              <div className="guest-popup__since">Guest since {since}</div>
            </div>

            {/* Summary strip */}
            <div className="guest-summary">
              <div className="guest-summary__item">
                <span className="guest-summary__label">Total Stays</span>
                <span className="guest-summary__value">{totalStays}</span>
              </div>
              <div className="guest-summary__divider" />
              <div className="guest-summary__item">
                <span className="guest-summary__label">Total Nights</span>
                <span className="guest-summary__value">{totalNights}</span>
              </div>
              <div className="guest-summary__divider" />
              <div className="guest-summary__item">
                <span className="guest-summary__label">Total Spent</span>
                <span className="guest-summary__value">{naira(totalSpent)}</span>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <div className="guest-section__head">
                <span className="guest-section__title">Personal Details</span>
                <span className="guest-section__line" />
              </div>
              <div className="guest-detail-rows">
                <div className="guest-detail-row">
                  <span className="guest-detail-row__label">Phone</span>
                  <span className="guest-detail-row__value">{guest.phone || "—"}</span>
                </div>
                <div className="guest-detail-row">
                  <span className="guest-detail-row__label">Email</span>
                  <span className="guest-detail-row__value">{guest.email || "—"}</span>
                </div>
                <div className="guest-detail-row">
                  <span className="guest-detail-row__label">Address</span>
                  <span className="guest-detail-row__value">{guest.address || "—"}</span>
                </div>
              </div>
            </div>

            {/* Stay History */}
            <div>
              <div className="guest-section__head">
                <span className="guest-section__title">Stay History</span>
                <span className="guest-section__line" />
              </div>
              {stays.length === 0 ? (
                <p style={{ color: "#7b7487", fontSize: "14px" }}>No stays yet.</p>
              ) : (
                <div>
                  {stays.map((stay, i) => <StayCard stay={stay} key={i} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}