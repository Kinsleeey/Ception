import { CloseIcon } from "./icons.jsx";

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// The read-only "who reserved this" popup, opened by the View link on the
// Reservations table. Matches the small-modal pattern used elsewhere.
export default function ReserverDetailsModal({ reserver, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Reserver Details</h2>
          <div className="modal-subtitle">
            <span>{reserver.category}</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />

          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-row__label">Full Name</span>
              <span className="detail-row__value">{reserver.reserver}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Phone Number</span>
              <span className="detail-row__value">{reserver.phone || "—"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Email</span>
              <span className="detail-row__value">{reserver.email || "—"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Address</span>
              <span className="detail-row__value">{reserver.address || "—"}</span>
            </div>
          </div>

          <div className="form-modal-body__rule" />

          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-row__label">Check-in</span>
              <span className="detail-row__value">{formatDate(reserver.start_date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Check-out</span>
              <span className="detail-row__value">{formatDate(reserver.end_date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Payment</span>
              <span className="detail-row__value">{reserver.payment_method || "—"}</span>
            </div>
          </div>
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}