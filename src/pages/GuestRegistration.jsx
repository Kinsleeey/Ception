import { useState } from "react";
import Modal from "../components/Modal.jsx";
import { ChevronDownIcon } from "../components/icons.jsx";

// Guest Registration is the receptionist's check-in form, shown as a modal.
// In the Figma it's a multi-step modal; here it's a single well-organized
// form with a toggle between adding a new guest and searching an existing one.

// A pill-shaped <select> with a chevron, used for the dropdown fields.
function Select({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <div className="select-wrap">
        <select className="pill-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="select-wrap__chevron">
          <ChevronDownIcon size={18} />
        </span>
      </div>
    </div>
  );
}

export default function GuestRegistration({ onClose }) {
  const close = onClose;

  // Form state
  const [nights, setNights] = useState("3 Nights");
  const [payment, setPayment] = useState("Direct Bank Transfer");
  const [guestMode, setGuestMode] = useState("new"); // "new" | "existing"

  // Amount is derived from the number of nights × the room rate.
  const rate = 60000;
  const nightCount = parseInt(nights, 10) || 1;
  const amount = (rate * nightCount).toLocaleString();

  const subtitle = (
    <>
      <strong>RM 001</strong>
      <span className="dot" />
      <span>₦60,000 per night</span>
    </>
  );

  const footer = (
    <>
      <button className="modal-btn modal-btn--ghost" onClick={close}>
        Cancel
      </button>
      <button
        className="modal-btn modal-btn--solid"
        onClick={() => {
          alert("Guest registered! (This is a demo — no data is saved yet.)");
          close();
        }}
      >
        Register Guest
      </button>
    </>
  );

  return (
    <Modal title="Guest Registration" subtitle={subtitle} onClose={close} footer={footer}>
      {/* Booking details */}
      <div>
        <div className="section-divider" style={{ marginBottom: "11px" }}>
          <span className="section-divider__label">Booking Details</span>
          <span className="section-divider__line" />
        </div>

        <div className="field-row" style={{ marginBottom: "11px" }}>
          <Select
            label="Duration of Stay"
            value={nights}
            onChange={setNights}
            options={["1 Night", "2 Nights", "3 Nights", "4 Nights", "5 Nights", "7 Nights"]}
          />
          <div className="field">
            <label className="field__label">Amount to Pay</label>
            <div className="pill-readout">
              <div className="pill-readout__value">₦{amount}</div>
              <div className="pill-readout__hint">
                {nightCount} {nightCount === 1 ? "night" : "nights"} × ₦{rate.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <Select
          label="Mode of Payment"
          value={payment}
          onChange={setPayment}
          options={["Direct Bank Transfer", "Cash", "Card", "POS"]}
        />
      </div>

      {/* Guest details */}
      <div>
        <div className="section-divider" style={{ marginBottom: "15.5px" }}>
          <span className="section-divider__label">Guest Details</span>
          <span className="section-divider__line" />
        </div>

        {/* Toggle between adding a new guest and finding an existing one */}
        <div className="segmented" style={{ marginBottom: "16px" }}>
          <button
            className={guestMode === "new" ? "segmented__btn segmented__btn--active" : "segmented__btn"}
            onClick={() => setGuestMode("new")}
          >
            Add New Guest
          </button>
          <button
            className={guestMode === "existing" ? "segmented__btn segmented__btn--active" : "segmented__btn"}
            onClick={() => setGuestMode("existing")}
          >
            Search Existing Guest
          </button>
        </div>

        {guestMode === "new" ? (
          <div className="guest-form-grid">
            <div className="field">
              <label className="field__label">Full Name</label>
              <input className="pill-input" placeholder="John Doe" />
            </div>
            <div className="field">
              <label className="field__label">Phone Number</label>
              <input className="pill-input" placeholder="+234 800 000 0000" />
            </div>
            <div className="field">
              <label className="field__label">Email Address</label>
              <input className="pill-input" placeholder="guest@email.com" />
            </div>
            <div className="field">
              <label className="field__label">Address</label>
              <input className="pill-input" placeholder="Residential City" />
            </div>
          </div>
        ) : (
          <div className="field">
            <label className="field__label">Search by name, email, or phone</label>
            <input className="pill-input" placeholder="Start typing a guest's name…" />
          </div>
        )}
      </div>
    </Modal>
  );
}
