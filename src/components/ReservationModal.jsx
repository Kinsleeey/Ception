import { useState } from "react";
import { CloseIcon, ChevronDownIcon, CalendarIcon, SearchIcon } from "../components/icons.jsx";

// Reservation popup, opened from an available room's "Reserve for Guest"
// button on the reception dashboard. Matches the Figma RESERVATION frames:
// a Reservation Details section (start/end date-time, amount, payment) and a
// Guest Details section that toggles between "Add New Guest" (a 2x2 form) and
// "Search Existing Guest" (a search box with suggestions).
//
// Props:
//   room    -> { number, price } for the header (optional; defaults shown)
//   onClose -> called when the modal should close

// Sample existing-guest matches for the search variant.
const SUGGESTIONS = [
  { name: "Emeka Okafor", phone: "08012345678" },
  { name: "Chidi Johnson", phone: "07088990011" },
];

// A pill-shaped date/time field with a trailing calendar icon.
function DateField({ label, value }) {
  return (
    <div className="field" style={{ flex: 1, minWidth: 0 }}>
      <label className="field__label">{label}</label>
      <div className="date-field">
        <input defaultValue={value} />
        <span className="date-field__icon"><CalendarIcon size={18} /></span>
      </div>
    </div>
  );
}

export default function ReservationModal({ room, onClose }) {
  const number = room?.number || "RM 001";
  const price = room?.price || "₦60,000";

  const [guestMode, setGuestMode] = useState("new"); // "new" | "existing"
  const [payment, setPayment] = useState("Bank Transfer");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card reservation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Reservation</h2>
          <div className="modal-subtitle">
            <strong>{number}</strong>
            <span className="dot" />
            <span>{price} per night</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {/* Reservation Details */}
          <div>
            <div className="section-divider" style={{ marginBottom: "11px" }}>
              <span className="section-divider__label">RESERVATION DETAILS</span>
              <span className="section-divider__line" />
            </div>

            <div className="field-row" style={{ marginBottom: "8px" }}>
              <DateField label="Start Date & Time" value="Oct 24, 2023 - 12:00 PM" />
              <DateField label="End Date & Time" value="Oct 27, 2023 - 11:00 AM" />
            </div>

            <div className="field-row">
              <div className="field" style={{ flex: 1, minWidth: 0 }}>
                <label className="field__label">Amount to Pay</label>
                <div className="pill-readout">
                  <div className="pill-readout__value">₦180,000</div>
                  <div className="pill-readout__hint">3 nights × ₦60,000</div>
                </div>
              </div>
              <div className="field" style={{ flex: 1, minWidth: 0 }}>
                <label className="field__label">Mode of Payment</label>
                <div className="select-wrap">
                  <select className="pill-input" value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>Card</option>
                    <option>POS</option>
                  </select>
                  <span className="select-wrap__chevron"><ChevronDownIcon size={18} /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div>
            <div className="section-divider" style={{ marginBottom: "15.5px" }}>
              <span className="section-divider__label">GUEST DETAILS</span>
              <span className="section-divider__line" />
            </div>

            <div className="segmented" style={{ marginBottom: "15.5px" }}>
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
              <>
                <div className="guest-form-grid" style={{ marginBottom: "12px" }}>
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
                <div className="add-guest-actions">
                  <button className="btn-outline-sm" onClick={() => alert("Guest saved to this reservation. (Demo — nothing is stored yet.)")}>
                    Save
                  </button>
                  <button className="link-cancel-addition" onClick={() => setGuestMode("existing")}>
                    Cancel Addition
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="guest-search">
                  <span className="guest-search__icon"><SearchIcon size={16} /></span>
                  <input placeholder="Search existing guest by name…" />
                </div>
                <div className="guest-suggestions">
                  {SUGGESTIONS.map((g) => (
                    <div className="guest-suggestion" key={g.name}>
                      <div className="guest-suggestion__info">
                        <span className="guest-suggestion__name">{g.name}</span>
                        <span className="guest-suggestion__phone">{g.phone}</span>
                      </div>
                      <button className="guest-suggestion__select" onClick={() => alert(`Selected ${g.name}. (Demo)`)}>
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="modal-btn modal-btn--solid"
            onClick={() => {
              alert("Reservation created! (Demo — nothing is stored yet.)");
              onClose();
            }}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
