import { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import { ChevronDownIcon, PlusIcon, SearchIcon } from "../components/icons.jsx";
import { addGuest, searchGuests, checkIn, getAccounts } from "../api.js";

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

// `room` is the room being checked into; `onClose` closes; `onDone` closes +
// refreshes the dashboard.
export default function GuestRegistration({ room, onClose, onDone }) {
  const rate = Number(room?.price) || 60000;

  // Booking fields
  const [nights, setNights] = useState("3 Nights");
  const [payment, setPayment] = useState("Direct Bank Transfer");

  // The running list of guests. First one = primary, rest = co-guests.
  const [guests, setGuests] = useState([]);

  // The "add a guest" sub-panel. `adding` = is it open? (auto-open when empty)
  const [adding, setAdding] = useState(true);
  const [guestMode, setGuestMode] = useState("new"); // "new" | "existing"

  // New-guest form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Search
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);

  // UI flags
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // Only ACTIVE accounts can be charged, so only those appear as options.
    getAccounts()
      .then((rows) => setAccounts(rows.filter((a) => a.status === "Active")))
      .catch(() => setAccounts([]));
  }, []);

  const nightCount = parseInt(nights, 10) || 1;
  const amount = rate * nightCount;

  const subtitle = (
    <>
      <strong>{room?.number || "Room"}</strong>
      <span className="dot" />
      <span>₦{rate.toLocaleString()} per night</span>
    </>
  );

  // Clear the add-guest sub-panel inputs.
  function resetAddPanel() {
    setName(""); setPhone(""); setEmail(""); setAddress("");
    setSearchText(""); setResults([]);
    setError(null);
  }

  // Push a guest onto the list and close the add panel.
  function addToList(guest) {
    // Avoid adding the same guest twice.
    if (guests.some((g) => g.id === guest.id)) {
      setError("That guest is already in the list.");
      return;
    }
    setGuests((prev) => [...prev, guest]);
    resetAddPanel();
    setAdding(false);
  }

  function removeFromList(id) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  }

  // "Add New Guest" -> create in DB, then add to the list.
  async function handleAddNew() {
    if (!name.trim()) { setError("Please enter the guest's full name."); return; }
    try {
      setBusy(true); setError(null);
      const guest = await addGuest({ name, phone, email, address });
      addToList(guest);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // "Search" -> fetch matches.
  async function handleSearch() {
    if (!searchText.trim()) return;
    try {
      setBusy(true); setError(null);
      const found = await searchGuests(searchText);
      setResults(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // "Register Guest" -> check in the whole list (first = primary).
  async function handleRegister() {
    if (guests.length === 0) { setError("Add at least one guest."); return; }
    try {
      setBusy(true); setError(null);
      await checkIn({
        room_id: room.id,
        primary_guest_id: guests[0].id,
        co_guest_ids: guests.slice(1).map((g) => g.id),
        amount_paid: amount,
        payment_method: payment,
        nights: nightCount,
      });
      if (onDone) onDone(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const footer = (
    <>
      <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={busy}>
        Cancel
      </button>
      <button
        className="modal-btn modal-btn--solid"
        onClick={handleRegister}
        disabled={busy || guests.length === 0}
      >
        {busy ? "Working…" : "Register Guest"}
      </button>
    </>
  );

  return (
    <Modal title="Guest Registration" subtitle={subtitle} onClose={onClose} footer={footer}>
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
              <div className="pill-readout__value">₦{amount.toLocaleString()}</div>
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
          options={[
            "Direct Bank Transfer", "Cash", "Card", "POS",
            ...accounts.map((a) => a.name),
          ]}
        />
      </div>

      {/* Guest details */}
      <div>
        <div className="section-divider" style={{ marginBottom: "15.5px" }}>
          <span className="section-divider__label">Guest Details</span>
          <span className="section-divider__line" />
        </div>

        {/* The list of already-added guest cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }}>
          {guests.map((g, i) => (
            <div className="cg-card" key={g.id}>
              <div className="cg-card__top">
                <span className="cg-card__tag">Guest {i + 1}</span>
                <button className="cg-card__remove" onClick={() => removeFromList(g.id)} disabled={busy}>
                  Remove
                </button>
              </div>
              <div className="cg-card__grid">
                <div className="cg-card__col">
                  <div>
                    <div className="cg-field__label">Full Name</div>
                    <div className="cg-field__value">{g.name}</div>
                  </div>
                  <div>
                    <div className="cg-field__label">Email</div>
                    <div className="cg-field__value">{g.email || "—"}</div>
                  </div>
                </div>
                <div className="cg-card__col">
                  <div>
                    <div className="cg-field__label">Phone Number</div>
                    <div className="cg-field__value">{g.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="cg-field__label">Address</div>
                    <div className="cg-field__value">{g.address || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "+ Add another" link — shown when the add panel is closed */}
        {!adding && (
          <button className="cg-add-link" onClick={() => { resetAddPanel(); setAdding(true); }}>
            <PlusIcon size={12} /> Add another guest / Search Existing Guest
          </button>
        )}

        {/* The add-a-guest sub-panel */}
        {adding && (
          <>
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
              <>
                <div className="guest-form-grid">
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
                <div className="add-guest-actions" style={{ marginTop: "12px" }}>
                  <button className="btn-outline-sm" onClick={handleAddNew} disabled={busy}>
                    {busy ? "Saving…" : "Save"}
                  </button>
                  {guests.length > 0 && (
                    <button className="cg-cancel-addition" onClick={() => { resetAddPanel(); setAdding(false); }}>
                      Cancel Addition
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="guest-search">
                  <span className="guest-search__icon"><SearchIcon size={16} /></span>
                  <input
                    placeholder="Search existing guest by name or phone number"
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
                        <button className="guest-suggestion__select" onClick={() => addToList(g)}>
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {guests.length > 0 && (
                  <button className="cg-cancel-addition" style={{ marginTop: "12px" }}
                    onClick={() => { resetAddPanel(); setAdding(false); }}>
                    Cancel Addition
                  </button>
                )}
              </>
            )}
          </>
        )}

        {error && (
          <p style={{ marginTop: "12px", color: "#c0392b", fontSize: "14px" }}>{error}</p>
        )}
      </div>
    </Modal>
  );
}