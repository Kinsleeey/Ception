import { CloseIcon } from "./icons.jsx";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function signedNaira(direction, n) {
  return (direction === "in" ? "+₦" : "−₦") + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
// Same-day movements can still be voided.
function isToday(iso) {
  return iso === new Date().toISOString().slice(0, 10);
}

// One cash movement, opened by View on the Cash table.
export default function CashMovementModal({ movement: m, onClose }) {
  const isIn = m.direction === "in";
  // The balance before this movement — the column shows the position after.
  const balanceBefore = isIn ? m.balance - m.amount : m.balance + m.amount;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>
            Cash Movement
            <span className={`cash-type cash-type--${m.direction}`} style={{ marginLeft: 12 }}>
              {m.type}
            </span>
          </h2>
          <div className="modal-subtitle">
            <span>
              #{String(m.id).padStart(6, "0")} · {isIn ? "Cash-in" : "Cash-out"} ·{" "}
              {formatDate(m.date)}, {m.time}
            </span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {/* Summary strip */}
          <div className="order-summary">
            <div className="order-summary__item">
              <div className="order-summary__label">Amount</div>
              <div className={`order-summary__value cash-${m.direction}`}>
                {signedNaira(m.direction, m.amount)}
              </div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Method</div>
              <div className="order-summary__value">{m.method}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Recorded by</div>
              <div className="order-summary__value" style={{ fontSize: "14px" }}>
                {m.staff || "—"}
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Details</span>
              <span className="section-divider__line" />
            </div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-row__label">Direction</span>
                <span className="detail-row__value">{isIn ? "Cash-in" : "Cash-out"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Type</span>
                <span className="detail-row__value">{m.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Date</span>
                <span className="detail-row__value">{formatDate(m.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Description</span>
                <span className="detail-row__value">{m.description}</span>
              </div>
            </div>
          </div>

          {/* Only movements that came from elsewhere in the system have a
              source to jump to. Manual add-ons and out-goings don't. */}
          {m.link && (
            <div>
              <div className="section-divider" style={{ marginBottom: "12px" }}>
                <span className="section-divider__label">Linked Record</span>
                <span className="section-divider__line" />
              </div>
              <div className="cash-link">
                <span className="cash-link__label">{m.link.label}</span>
                <button className="sales-view">View</button>
              </div>
            </div>
          )}

          {/* What this movement did to the till. */}
          <div>
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Cash Position</span>
              <span className="section-divider__line" />
            </div>
            <div className="cash-position">
              <div className="detail-row">
                <span className="detail-row__label">Balance before</span>
                <span className="detail-row__value cash-balance">{naira(balanceBefore)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Balance after</span>
                <span className="detail-row__value cash-position__after">{naira(m.balance)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Close</button>
          {/* Voiding is same-day only, matching the expenses rule. */}
          {isToday(m.date) && (
            <button className="cash-void">Void</button>
          )}
        </div>
      </div>
    </div>
  );
}