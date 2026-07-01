import { useState } from "react";
import { CloseIcon } from "../components/icons.jsx";

// Add Category is a small modal with a single text field, opened from the
// Add/Edit Drinks screen and closed via onClose.
export default function NewCategory({ onClose }) {
  const close = onClose;
  const [name, setName] = useState("");

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Category</h2>
          <div className="modal-subtitle">
            <span>Bar 1</span>
          </div>
        </div>
        <button className="modal-close" onClick={close} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />
          <div>
            <label className="field-label-strong">Category Name</label>
            <input
              className="pill-input"
              placeholder="e.g. Cocktails"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={close}>Cancel</button>
          <button
            className="btn-pill-primary"
            onClick={() => {
              alert(`Added category "${name || "Untitled"}". (Demo — nothing is stored yet.)`);
              close();
            }}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}
