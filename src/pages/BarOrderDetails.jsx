import { useState, useEffect } from "react";
import { CloseIcon } from "../components/icons.jsx";
import { getOrderDetail } from "../api.js";

// Formats a number as Naira, e.g. 17000 -> "₦17,000".
function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function formatDateTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// Bar Order Details fetches a single order (by id) and shows its line items
// and price breakdown. Opened from the Bar Report table.
//
// Props:
//   orderId -> which order to load
//   onClose -> close the popup
export default function BarOrderDetails({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderDetail(orderId);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [orderId]);

  // Derived values (once loaded).
  const items = order?.items || [];
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + Number(it.line_total), 0);
  const storedTotal = Number(order?.total || 0);
  // VAT shown as the difference between the stored total and the line subtotal
  // (so the breakdown always adds up to the real total).
  const vat = Math.max(0, storedTotal - subtotal);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Order Details</h2>
          <div className="modal-subtitle">
            {order
              ? <span>#{order.id} · {order.bar_location} · {formatDateTime(order.created_at)}</span>
              : <span>Order</span>}
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading order…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : (
            <>
              {/* Summary strip */}
              <div className="order-summary">
                <div className="order-summary__item">
                  <div className="order-summary__label">Items</div>
                  <div className="order-summary__value">{itemCount}</div>
                </div>
                <div className="order-summary__divider" />
                <div className="order-summary__item">
                  <div className="order-summary__label">Payment</div>
                  <div className="order-summary__value">{order.payment_method || "—"}</div>
                </div>
                <div className="order-summary__divider" />
                <div className="order-summary__item">
                  <div className="order-summary__label">Date</div>
                  <div className="order-summary__value" style={{ fontSize: "14px" }}>
                    {formatDateTime(order.created_at)}
                  </div>
                </div>
              </div>

              {/* Items list */}
              <div>
                <div className="section-divider" style={{ marginBottom: "12px" }}>
                  <span className="section-divider__label">Items Ordered</span>
                  <span className="section-divider__line" />
                </div>
                <div className="order-items">
                  {items.map((item, i) => (
                    <div className="order-item" key={i}>
                      <div className="order-item__info" style={{ flex: 1, minWidth: 0 }}>
                        <div className="order-item__name">{item.name || "Deleted product"}</div>
                        <div className="order-item__unit">{naira(item.unit_price)} each</div>
                      </div>
                      <div className="order-item__qty">×{item.quantity}</div>
                      <div className="order-item__total">{naira(item.line_total)}</div>
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
                  <span className="order-total-row__label">VAT</span>
                  <span className="order-total-row__value">{naira(vat)}</span>
                </div>
                <div className="order-total-row order-total-row--grand">
                  <span className="order-total-row__label">Total</span>
                  <span className="order-total-row__value">{naira(storedTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}