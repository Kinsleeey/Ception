import { CloseIcon } from "./icons.jsx";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Why an expense was voided. Opened by clicking a greyed-out row.
export default function VoidReasonModal({ expense: e, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(ev) => ev.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Voided Expense</h2>
          <div className="modal-subtitle">
            <span>{e.category} · {formatDate(e.spendDate)}</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />

          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-row__label">Description</span>
              <span className="detail-row__value">{e.description}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Vendor</span>
              <span className="detail-row__value">{e.vendor}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Amount</span>
              <span className="detail-row__value exp-amount">{naira(e.amount)}</span>
            </div>
          </div>

          <div className="form-modal-body__rule" />

          <div>
            <label className="field-label-strong">Reason</label>
            <p className="void-reason">{e.voidReason || "No reason recorded."}</p>
          </div>
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}