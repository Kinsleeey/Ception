import { useState } from "react";
import { CloseIcon } from "./icons.jsx";
import { topUpStockItem } from "../api.js";

// Add stock to one item. The amount is ADDED to the current quantity and
// recorded as a 'topup' in stock history. Small single-field modal.
export default function StockTopUpModal({ item, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    const amt = Number(amount);
    if (!Number.isInteger(amt) || amt <= 0) {
      setError("Enter a whole number greater than zero.");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      await topUpStockItem(item.id, amt);
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
          <h2 className="modal-title">Top-up Stock</h2>
          <div className="modal-subtitle"><span>{item.name}</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />

          <div className="acct-topup-current">
            <span className="acct-topup-current__label">Current Quantity</span>
            <span className="acct-topup-current__value">
              {Number(item.quantity).toLocaleString()} {item.unit}
            </span>
          </div>

          <div>
            <label className="field-label-strong">Add Quantity ({item.unit})</label>
            <input
              className="pill-input"
              inputMode="numeric"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Add Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}