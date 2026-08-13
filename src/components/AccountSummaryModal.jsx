import { useState, useEffect } from "react";
import { CloseIcon, ChevronRightIcon } from "./icons.jsx";
import { getAccountSummary, setAccountStatus } from "../api.js";
import BarOrderDetails from "../pages/BarOrderDetails.jsx";
import BookingDetails from "../pages/BookingDetails.jsx";
import AccountDepositModal from "./AccountDepositModal.jsx";

function naira(n) {
  const num = Number(n || 0);
  return "₦" + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// Signed money, e.g. "₦+450,000.00" / "₦-120,500.00" — used in the ledger.
function signedNaira(n) {
  const num = Number(n || 0);
  const sign = num > 0 ? "+" : num < 0 ? "-" : "";
  return "₦" + sign + Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDateTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).replace(",", "").replace(/(\d{4})/, "$1 •");
}

// Account Summary — the read-only View popup. Four sections:
//   1. Account Summary   (current balance, credit limit, available credit)
//   2. Contact Info      (personnel, phone, email)
//   3. Financial Summary (total deposited, total usage, outstanding)
//   4. Transaction History (deposits + charges, newest first)
//
// Footer: Disable/Enable (toggles status) and Edit (Path A divergence — the
// Figma frame only had Disable). "View" on a card opens this.
export default function AccountSummaryModal({ accountId, onClose, onEdit, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [openTxn, setOpenTxn] = useState(null); // the transaction whose popup is open

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAccountSummary(accountId);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [accountId]);

  async function toggleStatus() {
    const next = data.status === "Active" ? "Suspended" : "Active";
    try {
      setBusy(true);
      await setAccountStatus(accountId, next);
      if (onChanged) onChanged(); else onClose();
    } catch (err) {
      alert(`Couldn't update: ${err.message}`);
      setBusy(false);
    }
  }

  const suspended = data?.status === "Suspended";
  const negativeBalance = Number(data?.balance) < 0;
  const availableCredit = data ? Number(data.balance) + Number(data.credit_limit) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>
            {data ? data.name : "Account"}
            {data && (
              <span className={suspended ? "acct-badge acct-badge--suspended" : "acct-badge acct-badge--active"} style={{ marginLeft: 12 }}>
                <span className="acct-badge__dot" />
                {data.status}
              </span>
            )}
          </h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading account…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : (
            <>
              {/* Section 1: Account Summary */}
              <div className="acct-sec">
                <div className="section-divider" style={{ marginBottom: "12px" }}>
                  <span className="section-divider__label">Account Summary</span>
                  <span className="section-divider__line" />
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Current Balance</span>
                  <span className={`acct-kv__value ${negativeBalance ? "acct-card__value--negative" : ""}`}>{naira(data.balance)}</span>
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Credit Limit</span>
                  <span className="acct-kv__value">{naira(data.credit_limit)}</span>
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Available Credit</span>
                  <span className="acct-kv__value acct-kv__value--accent">{naira(availableCredit)}</span>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="acct-sec">
                <div className="section-divider" style={{ marginBottom: "12px" }}>
                  <span className="section-divider__label">Contact Information</span>
                  <span className="section-divider__line" />
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Contact Personnel</span>
                  <span className="acct-kv__value">{data.contact_personnel || "—"}</span>
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Phone</span>
                  <span className="acct-kv__value">{data.phone || "—"}</span>
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Email</span>
                  <span className="acct-kv__value">{data.email || "—"}</span>
                </div>
              </div>

              {/* Section 3: Financial Summary */}
              <div className="acct-sec">
                <div className="section-divider" style={{ marginBottom: "12px" }}>
                  <span className="section-divider__label">Financial Summary</span>
                  <span className="section-divider__line" />
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Total Deposited</span>
                  <span className="acct-kv__value">{naira(data.total_deposited)}</span>
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Total Usage</span>
                  <span className="acct-kv__value">{naira(data.total_usage)}</span>
                </div>
                <div className="acct-kv">
                  <span className="acct-kv__label">Outstanding Balance</span>
                  <span className="acct-kv__value">{naira(data.outstanding)}</span>
                </div>
              </div>

              {/* Section 4: Transaction History */}
              <div className="acct-sec">
                <div className="section-divider" style={{ marginBottom: "12px" }}>
                  <span className="section-divider__label">Transaction History</span>
                  <span className="section-divider__line" />
                </div>
                {data.transactions.length === 0 ? (
                  <p style={{ color: "#7b7487", fontSize: "14px", padding: "8px" }}>No transactions yet.</p>
                ) : (
                  <div className="acct-txns">
                    {data.transactions.map((t, i) => {
                      const isDeposit = t.type === "deposit";
                      return (
                        <button
                          className="acct-txn acct-txn--clickable"
                          key={i}
                          onClick={() => setOpenTxn(t)}
                          type="button"
                        >
                          <div className="acct-txn__info">
                            <div className="acct-txn__label">{t.label}</div>
                            <div className="acct-txn__date">{formatDateTime(t.created_at)}</div>
                          </div>
                          <div className="acct-txn__right">
                            <span className={`acct-txn__amount ${isDeposit ? "acct-txn__amount--in" : "acct-txn__amount--out"}`}>
                              {signedNaira(isDeposit ? t.amount : -Math.abs(t.amount))}
                            </span>
                            <ChevronRightIcon size={14} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {!loading && !error && (
            <>
              <button className="modal-btn modal-btn--ghost" onClick={toggleStatus} disabled={busy}>
                {suspended ? "Enable Account" : "Disable Account"}
              </button>
              <button className="modal-btn modal-btn--solid" onClick={onEdit} disabled={busy}>
                Edit Account
              </button>
            </>
          )}
        </div>

        {openTxn && openTxn.type === "order" && (
          <BarOrderDetails orderId={openTxn.ref_id} onClose={() => setOpenTxn(null)} />
        )}
        {openTxn && openTxn.type === "room" && (
          <BookingDetails stayId={openTxn.ref_id} onClose={() => setOpenTxn(null)} />
        )}
        {openTxn && openTxn.type === "deposit" && (
          <AccountDepositModal txn={openTxn} onClose={() => setOpenTxn(null)} />
        )}
      </div>
    </div>
  );
}
