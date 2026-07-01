import { MinusIcon, PlusIcon, ReceiptIcon } from "./icons.jsx";

// Formats a number as Naira, e.g. 17000 -> "₦17,000".
function naira(n) {
  return "₦" + n.toLocaleString();
}

// The "Current Order" panel on the right of the Bartender Dashboard. It lists
// the drinks the bartender has added for a customer, with a quantity stepper
// on each line, and a totals footer with Clear Order / Print Receipt.
//
// Props:
//   location  -> the bar name shown under the title (e.g. "Bar 1")
//   items     -> array of { name, category, unit, priceValue, qty }
//   onInc     -> (name) => void, increase a line's quantity
//   onDec     -> (name) => void, decrease a line's quantity
//   onClear   -> () => void, empty the order
//   onPrint   -> () => void, print/checkout the order
export default function OrderPanel({ location, items, onInc, onDec, onClear, onPrint }) {
  const subtotal = items.reduce((sum, it) => sum + it.priceValue * it.qty, 0);
  const vat = Math.round(subtotal * 0.075);
  const total = subtotal + vat;

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
            <div className="order-line" key={it.name}>
              <div className="order-line__info">
                <div className="order-line__name">{it.name}</div>
                <div className="order-line__meta">{it.category} · {it.unit}</div>
              </div>
              <div className="order-line__right">
                <div className="qty-stepper">
                  <button className="qty-stepper__btn" aria-label={`Remove one ${it.name}`} onClick={() => onDec(it.name)}>
                    <MinusIcon size={14} />
                  </button>
                  <span className="qty-stepper__count">{it.qty}</span>
                  <button className="qty-stepper__btn" aria-label={`Add one ${it.name}`} onClick={() => onInc(it.name)}>
                    <PlusIcon size={14} />
                  </button>
                </div>
                <div className="order-line__total">{naira(it.priceValue * it.qty)}</div>
              </div>
            </div>
          ))
        )}
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
        <button className="order-btn-print" onClick={onPrint} disabled={items.length === 0}>
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
