import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { CATEGORIES } from "../data/roomsData.js";

// Edit Room Details popup. Shows the room number (read-only), a category
// dropdown, and the price (the highlighted field). It appears as an overlay
// on top of the Room Details page, which stays blurred behind it.
//
// Props:
//   room    -> the room being edited { number, category, price }
//   onClose -> called when the modal should close
export default function EditRoomModal({ room, onClose }) {
  const [category, setCategory] = useState(room.category);
  // Strip the ₦ and commas so the input shows a plain number to edit.
  const [price, setPrice] = useState(String(room.price).replace(/[₦,]/g, ""));

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
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="modal-btn modal-btn--solid"
            onClick={() => {
              alert(`Saved changes to ${room.number}. (Demo — nothing is stored yet.)`);
              onClose();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
