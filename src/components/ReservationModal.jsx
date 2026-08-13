import { useState } from "react";
import { CloseIcon, ChevronDownIcon, CalendarIcon, SearchIcon } from "../components/icons.jsx";
import { addGuest, searchGuests, createReservation } from "../api.js";

// A pill-shaped date/time field. Uses a real datetime picker so the value is
// something the backend can store directly. `value`/`onChange` bind it to state.
function DateField({ label, value, onChange }) {
  return (
    <div className="field" style={{ flex: 1, minWidth: 0 }}>
      <label className="field__label">{label}</label>
      <div className="date-field">
        <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="date-field__icon"><CalendarIcon size={18} /></span>
      </div>
    </div>
  );
}

// Props:
//   room    -> the room being reserved (from the dashboard)
//   onClose -> close the popup
//   onDone  -> close AND refresh the room list
export default function ReservationModal({ room, onClose, onDone }) {
  const number = room?.number || "Room";
  const rate = Number(room?.price) || 60000;

  // Reservation fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payment, setPayment] = useState("Bank Transfer");

  // Guest selection (same pattern as check-in)
  const [guestMode, setGuestMode] = useState("new"); // "new" | "existing"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);

  // UI flags
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Amount = nights between the two dates × nightly rate (falls back to 1 night).
  const nightCount = (() => {
    if (!startDate || !endDate) return 1;
    const ms = new Date(endDate) - new Date(startDate);
    const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  })();
  const amount = rate * nightCount;

  // --- Guest actions (identical to check-in) -------------------------------
  async function handleAddGuest() {
    if (!name.trim()) {
      setError("Please enter the guest's full name.");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      const guest = await addGuest({ name, phone, email, address });
      setSelectedGuest(guest);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch() {
    if (!searchText.trim()) return;
    try {
      setBusy(true);
      setError(null);
      const found = await searchGuests(searchText);
      setResults(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // --- Submit the reservation ----------------------------------------------
  async function handleReserve() {
    if (!selectedGuest) {
      setError("Please add or select a guest first.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please choose a start and end date.");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      await createReservation({
        room_id: room.id,
        guest_id: selectedGuest.id,
        start_date: startDate,      // datetime-local value; Postgres accepts it
        end_date: endDate,
        amount_paid: amount,
        payment_method: payment,
      });
      if (onDone) onDone();
      else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card reservation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Reservation</h2>
          <div className="modal-subtitle">
            <strong>{number}</strong>
            <span className="dot" />
            <span>₦{rate.toLocaleString()} per night</span>
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
              <DateField label="Start Date & Time" value={startDate} onChange={setStartDate} />
              <DateField label="End Date & Time" value={endDate} onChange={setEndDate} />
            </div>

            <div className="field-row">
              <div className="field" style={{ flex: 1, minWidth: 0 }}>
                <label className="field__label">Amount to Pay</label>
                <div className="pill-readout">
                  <div className="pill-readout__value">₦{amount.toLocaleString()}</div>
                  <div className="pill-readout__hint">
                    {nightCount} {nightCount === 1 ? "night" : "nights"} × ₦{rate.toLocaleString()}
                  </div>
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

            {/* Locked-in guest summary, or the add/search UI. */}
            {selectedGuest ? (
              <div className="guest-suggestion">
                <div className="guest-suggestion__info">
                  <span className="guest-suggestion__name">{selectedGuest.name}</span>
                  <span className="guest-suggestion__phone">
                    {selectedGuest.phone || "no phone"} · {selectedGuest.email || "no email"}
                  </span>
                </div>
                <button
                  className="guest-suggestion__select"
                  onClick={() => { setSelectedGuest(null); setResults([]); }}
                  disabled={busy}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
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
                        <input className="pill-input" placeholder="John Doe"
                          value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field__label">Phone Number</label>
                        <input className="pill-input" placeholder="+234 800 000 0000"
                          value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field__label">Email Address</label>
                        <input className="pill-input" placeholder="guest@email.com"
                          value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field__label">Address</label>
                        <input className="pill-input" placeholder="Residential City"
                          value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                    </div>
                    <div className="add-guest-actions">
                      <button className="btn-outline-sm" onClick={handleAddGuest} disabled={busy}>
                        {busy ? "Saving…" : "Save"}
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
                      <input
                        placeholder="Search existing guest by name…"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      />
                    </div>
                    {results.length > 0 && (
                      <div className="guest-suggestions">
                        {results.map((g) => (
                          <div className="guest-suggestion" key={g.id}>
                            <div className="guest-suggestion__info">
                              <span className="guest-suggestion__name">{g.name}</span>
                              <span className="guest-suggestion__phone">{g.phone || "no phone"}</span>
                            </div>
                            <button className="guest-suggestion__select" onClick={() => setSelectedGuest(g)}>
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {error && (
              <p style={{ marginTop: "12px", color: "#c0392b", fontSize: "14px" }}>{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="modal-btn modal-btn--solid"
            onClick={handleReserve}
            disabled={busy || !selectedGuest}
          >
            {busy ? "Working…" : "Reserve"}
          </button>
        </div>
      </div>
    </div>
  );
}