import { useState } from "react";
import { CloseIcon, ChevronDownIcon, ChevronUpIcon } from "./icons.jsx";

// Guest Details popup, opened from the "View" button on the Guest Database
// table. Matches the Figma frame: a centered avatar header, a summary strip,
// personal details, and a stay-history list whose cards can expand to show
// co-guests.
//
// Props:
//   guest   -> the guest row to display
//   onClose -> called when the modal should close

// A single stay-history card with an expandable co-guests panel.
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
                    <span className="coguest-field__value">{c.phone}</span>
                  </div>
                  <div className="coguest-field">
                    <span className="coguest-field__label">Email</span>
                    <span className="coguest-field__value">{c.email}</span>
                  </div>
                  <div className="coguest-field">
                    <span className="coguest-field__label">Address</span>
                    <span className="coguest-field__value">{c.address}</span>
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

export default function GuestDetailsModal({ guest, onClose }) {
  // Stay history: use the guest's own history if present, else a sample stay
  // so the section is never empty.
  const stays = guest.stays || [
    {
      room: "RM 004",
      category: "Executive",
      range: "Jan 12 - Jan 15, 2025",
      checkIn: "Jan 12, 14:00",
      checkOut: "Jan 15, 11:00",
      payment: "Card",
      amount: "₦240,000",
      coGuests: [
        { name: "Tunde Bello", phone: "08098765432", email: "tunde@gmail.com", address: "5 Marina Road, Abuja" },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guest-popup" onClick={(e) => e.stopPropagation()}>
        <button className="guest-popup__close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="guest-popup__inner">
          {/* Avatar header */}
          <div className="guest-popup__header">
            <div className="guest-popup__avatar">{guest.initials}</div>
            <div className="guest-popup__name">{guest.name}</div>
            <div className="guest-popup__since">Guest since {guest.since || "Jan 2025"}</div>
          </div>

          {/* Summary strip */}
          <div className="guest-summary">
            <div className="guest-summary__item">
              <span className="guest-summary__label">Total Stays</span>
              <span className="guest-summary__value">{guest.visits ?? 7}</span>
            </div>
            <div className="guest-summary__divider" />
            <div className="guest-summary__item">
              <span className="guest-summary__label">Total Nights</span>
              <span className="guest-summary__value">{guest.totalNights ?? 21}</span>
            </div>
            <div className="guest-summary__divider" />
            <div className="guest-summary__item">
              <span className="guest-summary__label">Total Spent</span>
              <span className="guest-summary__value">{guest.revenue}</span>
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
                <span className="guest-detail-row__value">{guest.phone}</span>
              </div>
              <div className="guest-detail-row">
                <span className="guest-detail-row__label">Email</span>
                <span className="guest-detail-row__value">{guest.email}</span>
              </div>
              <div className="guest-detail-row">
                <span className="guest-detail-row__label">Address</span>
                <span className="guest-detail-row__value">{guest.address || "12 Broad Street, Lagos"}</span>
              </div>
            </div>
          </div>

          {/* Stay History */}
          <div>
            <div className="guest-section__head">
              <span className="guest-section__title">Stay History</span>
              <span className="guest-section__line" />
            </div>
            <div>
              {stays.map((stay, i) => (
                <StayCard stay={stay} key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
