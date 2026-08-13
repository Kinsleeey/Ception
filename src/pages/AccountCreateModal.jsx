import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "../components/icons.jsx";
import { createAccount } from "../api.js";

// Create Account — all fields, entered once. Mirrors ProductFormModal's shape.
// Two sections: Account Details (name, credit limit, opening balance, status)
// and Contact Information (personnel, phone, email).
//
// Opening balance seeds the running balance. After creation the balance only
// changes via Top-up (deposits) or charges; you cannot edit it here again.
export default function AccountCreateModal({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [status, setStatus] = useState("Active");
  const [personnel, setPersonnel] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter the organization name."); return; }

    const limit = Number(creditLimit);
    const opening = Number(openingBalance);
    if (Number.isNaN(limit) || limit < 0) { setError("Please enter a valid credit limit."); return; }
    if (Number.isNaN(opening) || opening < 0) { setError("Please enter a valid opening balance."); return; }

    try {
      setBusy(true);
      setError(null);
      await createAccount({
        name: name.trim(),
        credit_limit: limit,
        opening_balance: opening,
        status,
        contact_personnel: personnel.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
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
          <h2 className="modal-title">Create New Account</h2>
          <div className="modal-subtitle"><span>Accounts</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div>
            <div className="form-modal-section-label">Account Details</div>
            <div className="form-modal-body__rule" />
          </div>

          <div>
            <label className="field-label-strong">Organization Name</label>
            <input
              className="pill-input"
              placeholder="e.g. Globex Corporation"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label-strong">Credit Limit</label>
              <div className="price-input">
                <span className="price-input__naira">₦</span>
                <input
                  className="pill-input"
                  inputMode="numeric"
                  placeholder="450,000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="field-label-strong">Opening Balance</label>
              <div className="price-input">
                <span className="price-input__naira">₦</span>
                <input
                  className="pill-input"
                  inputMode="numeric"
                  placeholder="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="field-label-strong">Status</label>
            <div className="select-wrap">
              <select className="pill-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              <span className="select-wrap__chevron"><ChevronDownIcon size={18} /></span>
            </div>
          </div>

          <div>
            <div className="form-modal-section-label">Contact Information</div>
            <div className="form-modal-body__rule" />
          </div>

          <div>
            <label className="field-label-strong">Contact Personnel</label>
            <input
              className="pill-input"
              placeholder="Full Name"
              value={personnel}
              onChange={(e) => setPersonnel(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label-strong">Phone</label>
              <input
                className="pill-input"
                placeholder="+234 800 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label-strong">Email</label>
              <input
                className="pill-input"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
