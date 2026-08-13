import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { CATEGORIES } from "../data/roomsData.js";
import { updateRoom } from "../api.js";

// Edit Room Details popup. Shows the room number (read-only), a category
// dropdown, and the price. Saving sends the changes to the backend.
//
// Props:
//   room     -> the room being edited (has id, number, category, price)
//   onClose  -> close the popup
//   onSaved  -> called after a successful save (refreshes the list)
export default function EditRoomModal({ room, onClose, onSaved }) {
  const [category, setCategory] = useState(room.category);
  // Strip any ₦ / commas so the input holds a plain number.
  const [price, setPrice] = useState(String(room.price).replace(/[₦,]/g, ""));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    // Basic check: price must be a number.
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      // Send only the fields this popup edits. The backend updates just these.
      await updateRoom(room.id, { category, price: priceNum });
      if (onSaved) onSaved();   // refresh the list + close
      else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);           // keep the popup open so they can retry
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Room Details</h2>
          <div className="modal-subtitle">
            <span>{room.number} · {room.category}</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          <div>
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Room Details</span>
              <span className="section-divider__line" />
            </div>

            <div className="edit-rows">
              <div className="edit-row">
                <span className="edit-row__label">Room Number</span>
                <span className="edit-row__readonly">{room.number}</span>
              </div>

              <div className="edit-row">
                <span className="edit-row__label">Room Category</span>
                <div className="edit-row__select-wrap">
                  <div className="select-wrap">
                    <select className="pill-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className="select-wrap__chevron">
                      <ChevronDownIcon size={18} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="edit-row">
                <span className="edit-row__label">Price Per Night</span>
                <input
                  className="edit-row__input"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p style={{ marginTop: "12px", color: "#c0392b", fontSize: "14px" }}>{error}</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="modal-btn modal-btn--solid" onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}