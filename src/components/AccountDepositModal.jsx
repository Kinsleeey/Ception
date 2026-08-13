import { CloseIcon } from "./icons.jsx";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDateTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// A deposit isn't an order or a stay, so it gets its own small popup showing
// what the top-up was. `txn` is the transaction object from the summary.
export default function AccountDepositModal({ txn, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Deposit</h2>
          <div className="modal-subtitle"><span>{formatDateTime(txn.created_at)}</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />
          <div className="acct-kv">
            <span className="acct-kv__label">Amount</span>
            <span className="acct-kv__value acct-txn__amount--in">{naira(txn.amount)}</span>
          </div>
          <div className="acct-kv">
            <span className="acct-kv__label">Method</span>
            <span className="acct-kv__value">{txn.note || "Top-up"}</span>
          </div>
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}