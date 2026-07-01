import { CloseIcon } from "../components/icons.jsx";

// "View Details" popup for a reserved room, opened from the reception
// dashboard. Matches the Figma RESERVATION DETAILS frame: booking facts, the
// start/end date split, a guest card, and a single "Cancel Reservation"
// footer button.
//
// Props:
//   reservation -> the reservation to show (optional; sample defaults shown)
//   onClose     -> called when the modal should close
const SAMPLE = {
  room: "RM 001",
  price: "₦60,000",
  duration: "3 Nights",
  amountPaid: "₦180,000",
  payment: "Cash",
  start: { date: "17 Jun 2026", time: "2:00 PM" },
  end: { date: "20 Jun 2026", time: "12:00 PM" },
  guest: {
    name: "Emeka Okafor",
    phone: "08012345678",
    email: "emeka@gmail.com",
    address: "12 Broad Street, Lagos",
  },
};

export default function ReservationDetailsModal({ reservation, onClose }) {
  const r = reservation || SAMPLE;

  const bookingRows = [
    { label: "Duration of Stay", value: r.duration },
    { label: "Amount Paid", value: r.amountPaid },
    { label: "Mode of Payment", value: r.payment },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Reservation Details</h2>
          <div className="modal-subtitle">
            <strong>{r.room}</strong>
            <span className="dot" />
            <span>{r.price} per night</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
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
              <div className="res-dates__value">{r.start.date}</div>
              <div className="res-dates__time">{r.start.time}</div>
            </div>
            <div className="res-dates__connector" />
            <div className="res-dates__end">
              <div className="res-dates__label">End Date and Time</div>
              <div className="res-dates__value">{r.end.date}</div>
              <div className="res-dates__time">{r.end.time}</div>
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
                    <div className="res-guest-field__value">{r.guest.name}</div>
                  </div>
                  <div>
                    <div className="res-guest-field__label">Email</div>
                    <div className="res-guest-field__value">{r.guest.email}</div>
                  </div>
                </div>
                <div className="res-guest-col">
                  <div>
                    <div className="res-guest-field__label">Phone Number</div>
                    <div className="res-guest-field__value">{r.guest.phone}</div>
                  </div>
                  <div>
                    <div className="res-guest-field__label">Address</div>
                    <div className="res-guest-field__value">{r.guest.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: single full-width-aligned purple button */}
        <div className="modal-footer">
          <button
            className="modal-btn modal-btn--solid modal-btn--solid-full"
            onClick={() => {
              alert("Reservation cancelled. (Demo — nothing is stored yet.)");
              onClose();
            }}
          >
            Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  );
}
