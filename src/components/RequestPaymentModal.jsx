import { useState } from "react";
import { CloseIcon } from "./icons.jsx";
import { requestMaintenancePayment } from "../api.js";

// Maintenance asking the admin to release money for a fault.
//
// Optional and repeatable — a loose handle needs nothing, and a big job might
// need parts now and a technician next week. So this can be opened against the
// same fault more than once.
export default function RequestPaymentModal({ fault, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    const amt = Number(String(amount).replace(/,/g, ""));
    if (!amt || amt <= 0) { setError("Enter an amount above zero."); return; }
    if (!reason.trim()) { setError("Say what the money is for."); return; }
    try {
      setBusy(true);
      setError(null);
      await requestMaintenancePayment(fault.id, amt, reason.trim());
      if (onSaved) onSaved(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sr-card" onClick={(e) => e.stopPropagation()}>
        <div className="sr-header">
          <div>
            <h2 className="sr-title">Request Payment</h2>
            <p className="sr-subtitle">{fault.place}</p>
          </div>
          <button className="sr-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={10} />
          </button>
        </div>

        <div className="sr-hairline" />

        <div className="sr-body">
          {/* The fault, so nobody has to remember what they're requesting for. */}
          <div className="mt-fault">
            <span className="mt-fault__label">The fault</span>
            <p className="mt-fault__text">{fault.issue}</p>
          </div>

          <div className="sr-field">
            <label className="sr-label">Amount Needed</label>
            <div className="price-input">
              <span className="price-input__naira">₦</span>
              <input
                className="pill-input"
                inputMode="numeric"
                placeholder="45,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="sr-field">
            <label className="sr-label">What it's for</label>
            <textarea
              className="sr-input mt-textarea"
              rows={3}
              placeholder="e.g. New compressor motor, refrigerant refill and technician labour"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <span className="mt-hint">
              The admin sees this, and it becomes the expense description.
            </span>
          </div>

          {error && <p className="sr-error">{error}</p>}
        </div>

        <div className="sr-hairline" />

        <div className="sr-footer">
          <button className="sr-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="sr-send" onClick={handleSubmit} disabled={busy}>
            {busy ? "Sending…" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}