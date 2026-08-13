import { useState, useEffect } from "react";
import { CloseIcon, ChevronDownIcon } from "../components/icons.jsx";
import { getAccount, updateAccount } from "../api.js";

// Edit Account — credit limit, status, and contact info only.
//
// Deliberate divergences from the Figma frame (agreed as Path A):
//   - Organization Name is READ-ONLY (it links this account to its charges in
//     the payment_method column, so renaming would orphan history).
//   - There is NO Opening Balance field here. Money only enters via Top-up.
export default function AccountEditModal({ accountId, onClose, onSaved }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [creditLimit, setCreditLimit] = useState("");
  const [status, setStatus] = useState("Active");
  const [personnel, setPersonnel] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        const a = await getAccount(accountId);
        if (cancelled) return;
        setAccount(a);
        setCreditLimit(String(a.credit_limit));
        setStatus(a.status);
        setPersonnel(a.contact_personnel || "");
        setPhone(a.phone || "");
        setEmail(a.email || "");
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [accountId]);

  async function handleSubmit() {
    const limit = Number(creditLimit);
    if (Number.isNaN(limit) || limit < 0) { setError("Please enter a valid credit limit."); return; }

    try {
      setBusy(true);
      setError(null);
      await updateAccount(accountId, {
        credit_limit: limit,
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
          <h2 className="modal-title">Edit Account</h2>
          <div className="modal-subtitle"><span>{account ? account.name : "Accounts"}</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          {loading ? (
            <p style={{ color: "#7b7487", fontSize: "14px" }}>Loading account…</p>
          ) : loadError ? (
            <p style={{ color: "#c0392b", fontSize: "14px" }}>Couldn’t load: {loadError}</p>
          ) : (
            <>
              <div>
                <div className="form-modal-section-label">Account Details</div>
                <div className="form-modal-body__rule" />
              </div>

              <div>
                <label className="field-label-strong">Organization Name</label>
                {/* Read-only: the name links charges to this account. */}
                <input className="pill-input" value={account.name} disabled />
              </div>

              <div className="field-row">
                <div>
                  <label className="field-label-strong">Credit Limit</label>
                  <div className="price-input">
                    <span className="price-input__naira">₦</span>
                    <input
                      className="pill-input"
                      inputMode="numeric"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                    />
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
            </>
          )}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSubmit} disabled={busy || loading || !!loadError}>
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
