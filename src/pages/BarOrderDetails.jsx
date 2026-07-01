import { CloseIcon } from "../components/icons.jsx";
import { sampleOrder } from "../data/barData.js";

// Formats a number as Naira, e.g. 17000 -> "₦17,000".
function naira(n) {
  return "₦" + n.toLocaleString();
}

// Bar Order Details shows a single order's line items and a price breakdown.
// It's a modal opened from the Bar Report table and closes via onClose.
export default function BarOrderDetails({ onClose }) {
  const close = onClose;

  const order = sampleOrder;
  const subtotal = order.items.reduce((sum, item) => sum + item.unit * item.qty, 0);
  const vat = Math.round(subtotal * order.vatRate);
  const total = subtotal + vat;
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Order Details</h2>
          <div className="modal-subtitle">
            <span>{order.id} · {order.location} · {order.time}</span>
          </div>
        </div>
        <button className="modal-close" onClick={close} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {/* Summary strip */}
          <div className="order-summary">
            <div className="order-summary__item">
              <div className="order-summary__label">Items</div>
              <div className="order-summary__value">{itemCount}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Payment</div>
              <div className="order-summary__value">{order.payment}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Served By</div>
              <div className="order-summary__value">{order.servedBy}</div>
            </div>
          </div>

          {/* Items list */}
          <div>
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Items Ordered</span>
              <span className="section-divider__line" />
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div className="order-item" key={item.name}>
                  <div className="order-item__info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="order-item__name">{item.name}</div>
                    <div className="order-item__unit">{naira(item.unit)} each</div>
                  </div>
                  <div className="order-item__qty">×{item.qty}</div>
                  <div className="order-item__total">{naira(item.unit * item.qty)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="order-totals">
            <div className="order-total-row">
              <span className="order-total-row__label">Subtotal</span>
              <span className="order-total-row__value">{naira(subtotal)}</span>
            </div>
            <div className="order-total-row">
              <span className="order-total-row__label">VAT (7.5%)</span>
              <span className="order-total-row__value">{naira(vat)}</span>
            </div>
            <div className="order-total-row order-total-row--grand">
              <span className="order-total-row__label">Total</span>
              <span className="order-total-row__value">{naira(total)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  );
}
