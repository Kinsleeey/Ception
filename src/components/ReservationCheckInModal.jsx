import { useState } from "react";
import { CloseIcon, SearchIcon, PlusIcon } from "./icons.jsx";
import { addGuest, searchGuests, checkInReservationRoom } from "../api.js";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Check a guest into a RESERVED room.
//
// This is the reservation variant of GuestRegistration. The difference: there
// are no booking or payment fields, because the reservation already fixed the
// room, the dates and the money. It only collects WHO is staying — the reserver
// often isn't the guest.
//
// Props:
//   row     -> the reservation row from GET /api/reservations
//   onClose -> close the popup
//   onDone  -> called after a successful check-in (refreshes the table)
export default function ReservationCheckInModal({ row, onClose, onDone }) {
  const [guests, setGuests] = useState([]);
  const [adding, setAdding] = useState(true);
  const [mode, setMode] = useState("new");        // "new" | "existing"

  // New-guest form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Search
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function resetPanel() {
    setName(""); setPhone(""); setEmail(""); setAddress("");
    setSearchText(""); setResults([]); setError(null);
  }

  function addToList(guest) {
    if (guests.some((g) => g.id === guest.id)) {
      setError("That guest is already in the list.");
      return;
    }
    setGuests((prev) => [...prev, guest]);
    resetPanel();
    setAdding(false);
  }

  function removeFromList(id) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  }

  // Convenience: the reserver is often the guest, so offer them in one click.
  function useReserver() {
    addToList({
      id: row.guest_id, name: row.reserver,
      phone: row.phone, email: row.email, address: row.address,
    });
  }

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

  async function handleSearch() {
    if (!searchText.trim()) return;
    try {
      setBusy(true); setError(null);
      setResults(await searchGuests(searchText));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckIn() {
    if (guests.length === 0) { setError("Add at least one guest."); return; }
    try {
      setBusy(true); setError(null);
      await checkInReservationRoom(row.id, {
        primary_guest_id: guests[0].id,
        co_guest_ids: guests.slice(1).map((g) => g.id),
      });
      if (onDone) onDone(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Guest Registration</h2>
          <div className="modal-subtitle">
            <strong>{row.room_number}</strong>
            <span className="dot" />
            <span>{formatDate(row.start_date)} – {formatDate(row.end_date)}</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {/* Reservation facts — read-only. The money is already settled. */}
          <div>
            <div className="section-divider" style={{ marginBottom: "11px" }}>
              <span className="section-divider__label">Reservation</span>
              <span className="section-divider__line" />
            </div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-row__label">Reserved by</span>
                <span className="detail-row__value">{row.reserver}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Category</span>
                <span className="detail-row__value">{row.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Payment</span>
                <span className="detail-row__value">
                  {row.payment_method || "—"} · already paid
                </span>
              </div>
            </div>
          </div>

          {/* Who is actually staying */}
          <div>
            <div className="section-divider" style={{ marginBottom: "15.5px" }}>
              <span className="section-divider__label">Guest Details</span>
              <span className="section-divider__line" />
            </div>

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

            {!adding && (
              <button className="cg-add-link" onClick={() => { resetPanel(); setAdding(true); }}>
                <PlusIcon size={12} /> Add another guest
              </button>
            )}

            {adding && (
              <>
                {/* One-click: the reserver is staying */}
                {guests.length === 0 && (
                  <button className="btn-outline-sm" style={{ marginBottom: "16px" }}
                    onClick={useReserver} disabled={busy}>
                    Use reserver ({row.reserver})
                  </button>
                )}

                <div className="segmented" style={{ marginBottom: "16px" }}>
                  <button
                    className={mode === "new" ? "segmented__btn segmented__btn--active" : "segmented__btn"}
                    onClick={() => setMode("new")}
                  >
                    Add New Guest
                  </button>
                  <button
                    className={mode === "existing" ? "segmented__btn segmented__btn--active" : "segmented__btn"}
                    onClick={() => setMode("existing")}
                  >
                    Search Existing Guest
                  </button>
                </div>

                {mode === "new" ? (
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
                        <button className="cg-cancel-addition"
                          onClick={() => { resetPanel(); setAdding(false); }}>
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
                        placeholder="Search by name or phone…"
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
                  </>
                )}
              </>
            )}

            {error && (
              <p style={{ marginTop: "12px", color: "#c0392b", fontSize: "14px" }}>{error}</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="modal-btn modal-btn--solid" onClick={handleCheckIn}
            disabled={busy || guests.length === 0}>
            {busy ? "Working…" : "Check-in Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}