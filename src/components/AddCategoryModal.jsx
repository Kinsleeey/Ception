import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { addAcctCategory } from "../api.js";

// Add Category — two fields. `type` decides which list the new category joins:
// expense categories, add-on categories, or out-going categories.
const TYPES = ["Expenses", "Add-ons", "Out-goings"];

export default function AddCategoryModal({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // The dropdown shows friendly labels; the API takes the type key.
  const TYPE_KEY = { "Expenses": "expense", "Add-ons": "addon", "Out-goings": "outgoing" };

  async function handleSave() {
    if (!name.trim()) { setError("Please enter a category name."); return; }
    try {
      setBusy(true);
      setError(null);
      await addAcctCategory(name.trim(), TYPE_KEY[type]);
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
          <div className="modal-subtitle"><span>Accounting</span></div>
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
              placeholder="e.g. Diesel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="field-label-strong">Category Type</label>
            <div className="select-wrap">
              <select className="pill-input" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="select-wrap__chevron"><ChevronDownIcon size={18} /></span>
            </div>
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSave} disabled={busy}>{busy ? "Saving…" : "Add Category"}</button>
        </div>
      </div>
    </div>
  );
}