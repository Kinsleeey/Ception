import { useState } from "react";
import { CloseIcon } from "../components/icons.jsx";
import { addBarCategory } from "../api.js";

// Add Category is a small modal with a single text field. Saves to the backend.
//
// Props:
//   onClose -> close the popup
//   onSaved -> called after a successful save (refreshes the category list)
export default function NewCategory({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    if (!name.trim()) { setError("Please enter a category name."); return; }
    try {
      setBusy(true);
      setError(null);
      await addBarCategory(name.trim());
      if (onSaved) onSaved(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Category</h2>
          <div className="modal-subtitle">
            <span>Bar</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
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
          {error && (
            <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>
          )}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
