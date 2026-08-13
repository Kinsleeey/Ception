import { useState } from "react";
import { MinusIcon, PlusIcon, ReceiptIcon } from "./icons.jsx";

function naira(n) {
  return "₦" + Number(n).toLocaleString();
}

// New prop: paymentOptions — array of strings for the dropdown (base methods
// plus active account names). onPrint now receives the chosen method.
export default function OrderPanel({
  location, items, paymentOptions = [], onInc, onDec, onClear, onPrint,
}) {
  const subtotal = items.reduce((sum, it) => sum + Number(it.price) * it.qty, 0);
  const vat = Math.round(subtotal * 0.075);
  const total = subtotal + vat;

  const [method, setMethod] = useState(paymentOptions[0] || "Cash");


  return (
    <aside className="order-panel">
      {/* Header */}
      <div className="order-panel__head">
        <h2 className="order-panel__title">Current Order</h2>
        <div className="order-panel__location">
          <CocktailDot /> <span>{location}</span>
        </div>
      </div>

      {/* Item list */}
      <div className="order-panel__list">
        {items.length === 0 ? (
          <p className="order-panel__empty">
            No drinks yet. Tap a product on the left to add it to the order.
          </p>
        ) : (
          items.map((it) => (
            <div className="order-line" key={it.id}>
              <div className="order-line__info">
                <div className="order-line__name">{it.name}</div>
                <div className="order-line__meta">{it.unit}</div>
              </div>
              <div className="order-line__right">
                <div className="qty-stepper">
                  <button className="qty-stepper__btn" aria-label={`Remove one ${it.name}`} onClick={() => onDec(it)}>
                    <MinusIcon size={14} />
                  </button>
                  <span className="qty-stepper__count">{it.qty}</span>
                  <button className="qty-stepper__btn" aria-label={`Add one ${it.name}`} onClick={() => onInc(it)}>
                    <PlusIcon size={14} />
                  </button>
                </div>
                <div className="order-line__total">{naira(Number(it.price) * it.qty)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="order-pay">
          <label className="order-pay__label" htmlFor="order-pay-select">Payment Method</label>
          <select
            id="order-pay-select"
            className="pill-input"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {paymentOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

      {/* Totals footer */}
      <div className="order-panel__footer">
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
          <span className="order-panel__grand">{naira(total)}</span>
        </div>

        

        <button className="order-btn-clear" onClick={onClear} disabled={items.length === 0}>
          Clear Order
        </button>
        <button
          className="order-btn-print"
          onClick={() => onPrint(method)}
          disabled={items.length === 0}
        >
          <ReceiptIcon size={18} /> Print Receipt
        </button>
      </div>
    </aside>
  );
}

// A tiny cocktail-glass dot used next to the location label.
function CocktailDot() {
  return (
    <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 3h14l-7 8z" />
      <path d="M12 11v8M8 21h8" />
    </svg>
  );
}