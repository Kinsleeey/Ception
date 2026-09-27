import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BarSidebar from "../components/BarSidebar.jsx";
import OrderPanel from "../components/OrderPanel.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { ArrowLeftIcon, SearchIcon } from "../components/icons.jsx";
import {
  getProducts, getBarCategories, getCart,
  addToCart, updateCartItem, removeCartItem, checkoutOrder, getAccounts,
  getStockRequests, getIssues,
} from "../api.js";
import BarReceipt from "../components/BarReceipt.jsx";
import RequestStockModal from "../components/RequestStockModal.jsx";
import StockRequestsModal from "../components/StockRequestsModal.jsx";
import DeptIssueModal from "../components/DeptIssueModal.jsx";
import MyReportsModal from "../components/MyReportsModal.jsx";

// The bartender's product list. The selected BAR lives here (lifted from the
// sidebar) and drives everything: which drinks to fetch and which cart to show.
export default function BartenderDashboard() {
  // --- The single source of truth for "which bar" ---
  const [location, setLocation] = useState("Bar 1");

  // Category filter. `categoryId` null = "All".
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);

  // Products for the current bar + category.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingMethod, setPendingMethod] = useState("Cash");

  // The cart for the current bar (loaded from the server).
  const [cart, setCart] = useState([]);

  const [confirmPrint, setConfirmPrint] = useState(false);
  const [busy, setBusy] = useState(false);

  const [accounts, setAccounts] = useState([]);

  const [receiptId, setReceiptId] = useState(null);

  // Stock requests: which popup is open, and how many are still outstanding
  // (pending or delivered-but-not-confirmed) for the number in the circle.
  const [stockModal, setStockModal] = useState(null);   // "request" | "list" | null
  const [openRequests, setOpenRequests] = useState(0);

  async function loadRequestCount() {
    try {
      const d = await getStockRequests(location);
      setOpenRequests(d.openCount || 0);
    } catch {
      setOpenRequests(0);
    }
  }

  useEffect(() => { loadRequestCount(); }, [location]);

  // Faults reported at this bar.
  const [issueModal, setIssueModal] = useState(null);   // "report" | "list" | null
  const [openIssues, setOpenIssues] = useState(0);

  async function loadIssueCount() {
    try {
      const d = await getIssues("Bar");
      setOpenIssues(d.openCount || 0);
    } catch {
      setOpenIssues(0);
    }
  }

  useEffect(() => { loadIssueCount(); }, []);

  useEffect(() => {
    getAccounts()
      .then((rows) => setAccounts(rows.filter((a) => a.status === "Active")))
      .catch(() => setAccounts([]));
  }, []);

  // Load the category list once (for the filter pills).
  useEffect(() => {
    getBarCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Load products whenever the bar or category changes.
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts({
          bar_location: location,
          category_id: categoryId || undefined,
        });
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [location, categoryId]);

  // Load the cart whenever the bar changes (each bar has its own cart).
  useEffect(() => {
    getCart(location).then(setCart).catch(() => setCart([]));
  }, [location]);

  // Helper: re-fetch this bar's cart (our single source of truth).
  async function refreshCart() {
    try {
      const data = await getCart(location);
      setCart(data);
    } catch {
      setCart([]);
    }
  }

  // Tap a drink -> add to this bar's cart -> refresh the panel.
  async function handleAddDrink(productId) {
    try {
      setBusy(true);
      await addToCart(productId, location);
      await refreshCart();
    } catch (err) {
      alert(`Couldn't add: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Panel +/- : set a line's quantity, then refresh.
  async function handleSetQty(cartItemId, quantity) {
    try {
      await updateCartItem(cartItemId, quantity);
      await refreshCart();
    } catch (err) {
      alert(`Couldn't update: ${err.message}`);
    }
  }

  // Clear order = remove every line in this bar's cart, then refresh.
  async function handleClear() {
    try {
      await Promise.all(cart.map((line) => removeCartItem(line.id)));
      await refreshCart();
    } catch (err) {
      alert(`Couldn't clear: ${err.message}`);
    }
  }

  async function handlePrint(method) {
    try {
      setBusy(true);
      const order = await checkoutOrder(location, method);
      setConfirmPrint(false);
      await refreshCart();
      // Show the receipt for the sale just made.
      // The checkout route returns `order_id`, not `id`.
      if (order?.order_id) setReceiptId(order.order_id);
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Which product ids are already in the cart (for the "selected" card style).
  const inCart = new Set(cart.map((line) => line.product_id));

  // Shape the cart lines into what OrderPanel expects.
  const orderItems = cart.map((line) => ({
    id: line.id,
    name: line.name,
    price: line.price,
    unit: line.unit,
    qty: line.quantity,
    lineTotal: line.line_total,
  }));

  const hasOrder = orderItems.length > 0;

  const paymentOptions = ["Cash", "Direct Bank Transfer", "Card", "POS",
    ...accounts.map((a) => a.name)];

  return (
    <div className="dashboard">
      {/* Sidebar now receives the lifted state + a way to change it. */}
      <BarSidebar activeLocation={location} onSelect={setLocation} />

      <div className="main">
        <header className="topbar topbar--bordered">
          <ArrowLeftIcon size={20} />
          <span className="topbar__title">Products — {location}</span>

          {/* Stock requests live in the top bar because they're about this bar
              as a whole, not about the cart. */}
          <div className="bar-topbar__actions">
            <button className="room-action-link" onClick={() => setStockModal("request")}>
              Request Stock
            </button>
            <button
              className="issue-badge"
              onClick={() => setStockModal("list")}
              aria-label={`${openRequests} open request${openRequests === 1 ? "" : "s"}`}
              title="View requests"
            >
              {openRequests}
            </button>

            <span className="room-actions-row__divider" />

            <button className="room-action-link" onClick={() => setIssueModal("report")}>
              Report an Issue
            </button>
            <button
              className="issue-badge"
              onClick={() => setIssueModal("list")}
              aria-label={`${openIssues} open report${openIssues === 1 ? "" : "s"}`}
              title="View reports"
            >
              {openIssues}
            </button>

            <span className="room-actions-row__divider" />

            <Link className="room-action-link" to="/bar-activity">
              Today's Activity
            </Link>
          </div>
        </header>

        <div className="bar-layout">
          <div className="content bar-content">
            {/* Stats strip (now reflects the loaded products) */}
            <div className="stat-strip">
              <span className="stat-strip__item">
                Total Products <span className="stat-strip__num">{products.length}</span>
              </span>
              <span className="stat-strip__divider" />
              <span className="stat-strip__item">
                Categories <span className="stat-strip__num">{categories.length}</span>
              </span>
            </div>

            {/* Category pills: "All" + one per category from the DB. */}
            <div className="filter-pills">
              <button
                className={categoryId === null ? "filter-pill filter-pill--active" : "filter-pill"}
                onClick={() => setCategoryId(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={cat.id === categoryId ? "filter-pill filter-pill--active" : "filter-pill"}
                  onClick={() => setCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search (visual only for now) */}
            <div className="search search--wide">
              <span className="search__icon"><SearchIcon size={18} /></span>
              <input className="search__input" type="text" placeholder="Search products..." />
            </div>

            {/* Product grid */}
            {loading ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>Loading drinks…</p>
            ) : error ? (
              <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
            ) : products.length === 0 ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>
                No drinks in {location}{categoryId ? " for this category" : ""}.
              </p>
            ) : (
              <div className="product-grid">
                {products.map((product) => {
                  const selected = inCart.has(product.id);
                  return (
                    <button
                      type="button"
                      className={selected ? "product-card product-card--selected" : "product-card"}
                      key={product.id}
                      onClick={() => handleAddDrink(product.id)}
                      disabled={busy}
                    >
                      <div className="product-card__info">
                        <div className="product-card__name">{product.name}</div>
                        <div className="product-card__label">Price per unit</div>
                      </div>
                      <div className="product-card__price">
                        ₦{Number(product.price).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order panel appears once the cart has something in it. */}
          {hasOrder && (
            <OrderPanel
              location={location}
              items={orderItems}
              paymentOptions={paymentOptions}
              onInc={(item) => handleSetQty(item.id, item.qty + 1)}
              onDec={(item) => handleSetQty(item.id, item.qty - 1)}
              onClear={handleClear}
              onPrint={(method) => { setPendingMethod(method); setConfirmPrint(true); }}
            />
          )}
        </div>
      </div>

      {confirmPrint && (
        <ConfirmModal
          variant="default"
          title="Print Receipt?"
          confirmLabel="Print"
          cancelLabel="Cancel"
          onCancel={() => setConfirmPrint(false)}
          onConfirm={() => handlePrint(pendingMethod)}
        >
          This will save the order for {location} ({pendingMethod}) and clear the current cart.
        </ConfirmModal>
      )}

      {stockModal === "request" && (
        <RequestStockModal
          barLocation={location}
          onClose={() => setStockModal(null)}
          onSaved={async () => { setStockModal(null); await loadRequestCount(); }}
        />
      )}
      {stockModal === "list" && (
        <StockRequestsModal
          barLocation={location}
          onClose={() => setStockModal(null)}
          onChanged={loadRequestCount}
        />
      )}

      {issueModal === "report" && (
        <DeptIssueModal
          department="Bar"
          place={location}
          wherePlaceholder="e.g. under-counter fridge, blender, draught tap"
          issuePlaceholder="e.g. Fridge is not holding temperature overnight"
          onClose={() => setIssueModal(null)}
          onSaved={async () => { setIssueModal(null); await loadIssueCount(); }}
        />
      )}

      {issueModal === "list" && (
        <MyReportsModal department="Bar" onClose={() => setIssueModal(null)} />
      )}

      {receiptId && (
        <BarReceipt
          orderId={receiptId}
          autoPrint
          onClose={() => setReceiptId(null)}
        />
      )}
    </div>
  );
}