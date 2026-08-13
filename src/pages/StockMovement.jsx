import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "../components/icons.jsx";
import { getStockItems, getStockCategories, createStockMovement } from "../api.js";

const COPY = {
  issue:  { panelTitle: "Stock to be issued",   partyLabel: "Issued to",     partyPlaceholder: "Enter recipient name or department", switchTo: "Return Stock" },
  return: { panelTitle: "Stock to be Returned", partyLabel: "Returned from", partyPlaceholder: "Enter name or department",           switchTo: "Issue Stock" },
};

function BoxIcon() {
  return (
    <svg className="stock-header__icon" viewBox="0 0 23 18" fill="none" aria-hidden="true"
      style={{ width: 23, height: 18 }}>
      <path d="M1 5.2 11.5 1 22 5.2v9.1L11.5 17 1 14.3V5.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M1 5.2 11.5 9m0 0L22 5.2M11.5 9v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

// StockMovement is the storekeeper's issue / return screen. It is a standalone
// full-width screen (no admin sidebar). Like the other pages it fetches its own
// data (stock items + categories) and saves itself. `mode` decides which flow
// this is; the two thin wrappers at the bottom set it.
export default function StockMovement({ mode = "issue" }) {
  const navigate = useNavigate();
  const copy = COPY[mode] ?? COPY.issue;

  // ----- data from the database -----
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----- screen state -----
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("");
  const [selected, setSelected] = useState({}); // { [id]: { quantity, unit } }
  const [saving, setSaving] = useState(false);

  // Fetch stock + categories. Pulled out of the effect so a save can call it
  // again to refresh on-hand quantities after a movement.
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [rows, cats] = await Promise.all([getStockItems(), getStockCategories()]);
      setProducts(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          subtitle: r.description || "",
          category: r.category_name || "Uncategorised",
          quantity: r.quantity,
          unit: r.unit,
          units: [r.unit],
        }))
      );
      setCategories(cats.map((c) => c.name));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pills = useMemo(() => ["All", ...categories], [categories]);
  const categoryCount = categories.length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const inStock = p.quantity > 0;                    // hide anything at 0 — can't issue it
      const inCategory = activeCategory === "All" || p.category === activeCategory;
      const matches = !q || p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q);
      return inStock && inCategory && matches;
    });
  }, [products, activeCategory, query]);

  const selectedEntries = useMemo(
    () =>
      Object.entries(selected).map(([id, value]) => {
        const product = products.find((p) => String(p.id) === String(id));
        return { ...value, id, product };
      }),
    [selected, products]
  );

  const hasSelection = selectedEntries.length > 0;

  function toggleProduct(product) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[product.id]) delete next[product.id];
      else next[product.id] = { quantity: 1, unit: product.unit };
      return next;
    });
  }

  function updateSelection(id, patch) {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function handleSave() {
    if (saving) return;
    try {
      setSaving(true);
      await createStockMovement({
        direction: mode,             // "issue" | "return"
        party: party.trim(),
        staff_name: null,            // no auth yet
        items: selectedEntries.map(({ product, quantity, unit }) => ({
          stock_item_id: product.id,
          quantity: Number(quantity),
          unit,
        })),
      });
      // Return to the normal empty state — no navigation. Clear the cart and
      // the party field, and refresh stock so on-hand quantities reflect the
      // movement just made. The storekeeper stays on this full-width screen.
      setSelected({});
      setParty("");
      await load();
    } catch (err) {
      alert(`Couldn't save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const canSave = hasSelection && party.trim().length > 0 && !saving;

  if (loading) {
    return <p style={{ padding: "24px", color: "#7b7487" }}>Loading stock…</p>;
  }
  if (error) {
    return <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>;
  }

  return (
    <div className="stock">
      <header className="stock-header">
        <div className="stock-header__brand">
          <BoxIcon />
          <h2 className="stock-header__title">Stock</h2>
        </div>
      </header>

      <div className="stock-layout">
        <main className={`stock-main ${hasSelection ? "stock-main--narrow" : ""}`}>
          {/* Stats */}
          <div className="stat-strip">
            <span className="stat-strip__item">
              Total Products <span className="stat-strip__num">{products.length}</span>
            </span>
            <span className="stat-strip__divider" />
            <span className="stat-strip__item">
              Categories <span className="stat-strip__num">{categoryCount}</span>
            </span>
          </div>

          {/* Category filters */}
          <div className="filter-pills" role="tablist" aria-label="Product categories">
            {pills.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={activeCategory === category ? "filter-pill filter-pill--active" : "filter-pill"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="search search--wide">
            <span className="search__icon"><SearchIcon size={18} /></span>
            <input
              type="search"
              className="search__input"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>

          {/* Product grid */}
          <div className={`stock-grid ${hasSelection ? "stock-grid--3" : "stock-grid--4"}`}>
            {visible.map((product) => {
              const isSelected = Boolean(selected[product.id]);
              return (
                <button
                  key={product.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={`stock-card ${isSelected ? "stock-card--selected" : ""}`}
                  onClick={() => toggleProduct(product)}
                >
                  <span className="stock-card__info">
                    <span className="stock-card__name">{product.name}</span>
                    <span className="stock-card__subtitle">{product.subtitle}</span>
                  </span>
                  <span className="stock-card__stock">
                    {product.quantity} {product.unit}
                  </span>
                </button>
              );
            })}

            {visible.length === 0 && (
              <p className="stock-empty">No products match that search. Try another term or category.</p>
            )}
          </div>

          {/* Cross-flow CTA */}
          <button
            type="button"
            className="stock-cta"
            onClick={() => navigate(`/stock/${mode === "issue" ? "return" : "issue"}`)}
          >
            {copy.switchTo}
          </button>
        </main>

        {/* Right panel — only once something is selected */}
        {hasSelection && (
          <aside className="stock-panel">
            <h2 className="stock-panel__title">{copy.panelTitle}</h2>

            <div className="stock-panel__list">
              {selectedEntries.map(({ id, product, quantity, unit }) => (
                <div className="stock-line" key={id}>
                  <span className="stock-line__name">{product.name}</span>

                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    className="stock-line__qty"
                    value={quantity}
                    onChange={(e) => updateSelection(id, { quantity: e.target.value })}
                    aria-label={`Quantity of ${product.name}`}
                  />

                  <select
                    className="stock-line__unit"
                    value={unit}
                    onChange={(e) => updateSelection(id, { unit: e.target.value })}
                    aria-label={`Unit for ${product.name}`}
                  >
                    {product.units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="stock-line__remove"
                    onClick={() => toggleProduct(product)}
                    aria-label={`Remove ${product.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="stock-party">
                <label className="stock-party__label" htmlFor="stock-party-input">
                  {copy.partyLabel}
                </label>
                <input
                  id="stock-party-input"
                  className="stock-party__input"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  placeholder={copy.partyPlaceholder}
                />
              </div>

              <button type="button" className="stock-cta" disabled={!canSave} onClick={handleSave}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export const IssueStock  = () => <StockMovement mode="issue" />;
export const ReturnStock = () => <StockMovement mode="return" />;