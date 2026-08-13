import { useState, useEffect } from "react";
import { CloseIcon } from "../components/icons.jsx";
import { getAccount, depositToAccount } from "../api.js";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Top-up — the only way money enters an account after creation. The admin
// types an amount; it's added to the running balance and recorded as a deposit.
// Small single-field modal, matching NewCategory's shape.
export default function AccountTopUpModal({ accountId, onClose, onSaved }) {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAccount(accountId)
      .then((a) => { if (!cancelled) setAccount(a); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [accountId]);

  async function handleSave() {
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) { setError("Enter an amount greater than zero."); return; }
    try {
      setBusy(true);
      setError(null);
      await depositToAccount(accountId, amt);
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
          <h2 className="modal-title">Top-up Account</h2>
          <div className="modal-subtitle"><span>{account ? account.name : "Accounts"}</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />

          {account && (
            <div className="acct-topup-current">
              <span className="acct-topup-current__label">Current Balance</span>
              <span className={`acct-topup-current__value ${Number(account.balance) < 0 ? "acct-card__value--negative" : ""}`}>
                {naira(account.balance)}
              </span>
            </div>
          )}

          <div>
            <label className="field-label-strong">Deposit Amount</label>
            <div className="price-input">
              <span className="price-input__naira">₦</span>
              <input
                className="pill-input"
                inputMode="numeric"
                placeholder="500,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Add Deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}
