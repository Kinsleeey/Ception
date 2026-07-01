import Modal from "../components/Modal.jsx";
import GuestInfoCard from "../components/GuestInfoCard.jsx";

// Booking Details is a modal opened from a booked room on the reception
// dashboard. It renders over that page (blurred behind it) and closes via
// the onClose prop.
//
// The data is hard-coded for now. Later you'd pass the booking in as a prop
// and look up the matching record.
const booking = {
  room: "RM 001",
  pricePerNight: "₦60,000 per night",
  duration: "3 Nights",
  amountPaid: "₦180,000",
  payment: "Cash",
  checkIn: { date: "17 Jun 2026", time: "2:00 PM" },
  checkOut: { date: "20 Jun 2026", time: "12:00 PM" },
  guests: [
    {
      tag: "Guest 1",
      fields: [
        { label: "Full Name", value: "Emeka Okafor" },
        { label: "Phone Number", value: "08012345678" },
        { label: "Email", value: "emeka@gmail.com" },
        { label: "Address", value: "12 Broad Street, Lagos" },
      ],
    },
  ],
};

export default function BookingDetails({ onClose }) {
  const close = onClose;

  const subtitle = (
    <>
      <strong>{booking.room}</strong>
      <span className="dot" />
      <span>{booking.pricePerNight}</span>
    </>
  );

  const footer = (
    <>
      <button className="modal-btn modal-btn--ghost" onClick={close}>
        Cancel
      </button>
      <button
        className="modal-btn modal-btn--solid"
        onClick={() => alert("Check-out flow comes in a later batch.")}
      >
        Checkout Guest
      </button>
    </>
  );

  return (
    <Modal title="Booking Details" subtitle={subtitle} onClose={close} footer={footer}>
      {/* Booking facts */}
      <div>
        <div className="section-divider">
          <span className="section-divider__label">Booking Details</span>
          <span className="section-divider__line" />
        </div>
        <div className="detail-rows">
          <div className="detail-row">
            <span className="detail-row__label">Duration of Stay</span>
            <span className="detail-row__value">{booking.duration}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Amount Paid</span>
            <span className="detail-row__value">{booking.amountPaid}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Mode of Payment</span>
            <span className="detail-row__value">{booking.payment}</span>
          </div>
        </div>
      </div>

      {/* Check-in / check-out timeline */}
      <div className="timeline">
        <div>
          <div className="timeline__label">Check-in</div>
          <div className="timeline__date">{booking.checkIn.date}</div>
          <div className="timeline__time">{booking.checkIn.time}</div>
        </div>
        <div className="timeline__connector" />
        <div className="timeline__end">
          <div className="timeline__label">Expected Check-out</div>
          <div className="timeline__date">{booking.checkOut.date}</div>
          <div className="timeline__time">{booking.checkOut.time}</div>
        </div>
      </div>

      {/* Guests */}
      <div>
        <div className="section-divider" style={{ marginBottom: "12px" }}>
          <span className="section-divider__label">Guest Details</span>
          <span className="section-divider__line" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {booking.guests.map((guest) => (
            <GuestInfoCard key={guest.tag} tag={guest.tag} fields={guest.fields} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
