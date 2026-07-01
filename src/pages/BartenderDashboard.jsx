import { useState } from "react";
import BarSidebar from "../components/BarSidebar.jsx";
import OrderPanel from "../components/OrderPanel.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { ArrowLeftIcon, SearchIcon } from "../components/icons.jsx";
import { products, barCategories, barStats, barLocations } from "../data/barData.js";

// The bartender's product list ("Products"). Tapping a product adds it to the
// "Current Order" panel on the right, where quantities can be adjusted. This
// matches the Figma frame where selecting drinks reveals the order sidebar.
export default function BartenderDashboard() {
  const [category, setCategory] = useState("All");
  // The order: a map of product name -> quantity. Kept as state so the panel
  // and the selected-card styling update as the bartender taps products.
  const [order, setOrder] = useState({}); // { [name]: qty }
  const [confirmPrint, setConfirmPrint] = useState(false);

  const location = barLocations[0]; // "Bar 1" (matches the active sidebar item)

  const visible =
    category === "All" ? products : products.filter((p) => p.category === category);

  // Add one of a product to the order (tapping its card).
  function addToOrder(name) {
    setOrder((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  }
  // Increase / decrease a line's quantity from the order panel. Dropping to 0
  // removes the line.
  function inc(name) {
    setOrder((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  }
  function dec(name) {
    setOrder((prev) => {
      const next = { ...prev };
      const q = (next[name] || 0) - 1;
      if (q <= 0) delete next[name];
      else next[name] = q;
      return next;
    });
  }
  function clearOrder() {
    setOrder({});
  }

  // Build the ordered list (only products that are in the order), preserving
  // the product catalog order.
  const orderItems = products
    .filter((p) => order[p.name])
    .map((p) => ({ ...p, qty: order[p.name] }));

  const hasOrder = orderItems.length > 0;

  return (
    <div className="dashboard">
      <BarSidebar />

      <div className="main">
        <header className="topbar topbar--bordered">
          <ArrowLeftIcon size={20} />
          <span className="topbar__title">Products</span>
        </header>

        {/* Products area + order panel sit side by side */}
        <div className="bar-layout">
          <div className="content bar-content">
            {/* Stats strip */}
            <div className="stat-strip">
              <span className="stat-strip__item">
                Total Products <span className="stat-strip__num">{barStats.totalProducts}</span>
              </span>
              <span className="stat-strip__divider" />
              <span className="stat-strip__item">
                Categories <span className="stat-strip__num">{barStats.categories}</span>
              </span>
            </div>

            {/* Category filter pills */}
            <div className="filter-pills">
              {barCategories.map((cat) => (
                <button
                  key={cat}
                  className={cat === category ? "filter-pill filter-pill--active" : "filter-pill"}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search search--wide">
              <span className="search__icon">
                <SearchIcon size={18} />
              </span>
              <input className="search__input" type="text" placeholder="Search products..." />
            </div>

            {/* Product grid. Tapping a card adds it to the order; cards already
                in the order get a selected (grey) background. */}
            <div className="product-grid">
              {visible.map((product) => {
                const selected = Boolean(order[product.name]);
                return (
                  <button
                    type="button"
                    className={selected ? "product-card product-card--selected" : "product-card"}
                    key={product.name}
                    onClick={() => addToOrder(product.name)}
                  >
                    <div className="product-card__info">
                      <div className="product-card__name">{product.name}</div>
                      <div className="product-card__label">Price per unit</div>
                    </div>
                    <div className="product-card__price">{product.price}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order panel only appears once at least one drink is selected. */}
          {hasOrder && (
            <OrderPanel
              location={location}
              items={orderItems}
              onInc={inc}
              onDec={dec}
              onClear={clearOrder}
              onPrint={() => setConfirmPrint(true)}
            />
          )}
        </div>
      </div>

      {/* Print/checkout confirmation */}
      {confirmPrint && (
        <ConfirmModal
          variant="default"
          title="Print Receipt?"
          confirmLabel="Print"
          cancelLabel="Cancel"
          onCancel={() => setConfirmPrint(false)}
          onConfirm={() => {
            alert("Receipt printed and order sent. (Demo — nothing is stored yet.)");
            setConfirmPrint(false);
            clearOrder();
          }}
        >
          This will print the receipt for the current order and send it to the kitchen/bar.
        </ConfirmModal>
      )}
    </div>
  );
}
