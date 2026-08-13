import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import StockFormModal from "../components/StockFormModal.jsx";
import StockTopUpModal from "../components/StockTopUpModal.jsx";
import NewStockCategory from "./NewStockCategory.jsx";
import {
  GridIcon, SearchIcon, EditIcon, PlusIcon,
} from "../components/icons.jsx";
import {
  getStockItems, getStockCategories, 
} from "../api.js";

// Top-up/Edit Stock — the admin-side store screen.
//
// A card carries the item's name, its category badge, the description line,
// and the live quantity. Editing a card is how stock gets topped up: the form
// writes a new quantity. Deleting removes the item from the catalogue.
export default function StockTopUp() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null); // null = "All"

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toppingUp, setToppingUp] = useState(null);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(null); // "new" | "category" | null

  // Load categories once (for the filter pills + the form dropdown).
  useEffect(() => {
    getStockCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Load stock for the current category. Separated so we can refresh after
  // add/edit/delete.
  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const data = await getStockItems({ category_id: categoryId || undefined });
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [categoryId]);

  // Also refresh the category list (in case a new one was just added).
  async function refreshCategories() {
    try {
      setCategories(await getStockCategories());
    } catch { /* ignore */ }
  }

  
  // "Total Stock" counts the distinct items the store carries, matching the
  // way the bar screens count products.
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Top-up/Edit Stock</span>
        </header>

        <div className="content">
          {/* Stats strip */}
          <div className="stat-strip">
            <span className="stat-strip__item">
              Total Stock <span className="stat-strip__num">{items.length}</span>
            </span>
            <span className="stat-strip__divider" />
            <span className="stat-strip__item">
              Categories <span className="stat-strip__num">{categories.length}</span>
            </span>
          </div>

          {/* Category filter pills ("All" + real categories) + create link */}
          <div className="pills-row">
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
            <button className="create-category-link" onClick={() => setModal("category")}>
              <PlusIcon size={12} /> Create New Category
            </button>
          </div>

          {/* Search (visual only for now) */}
          <div className="search search--wide">
            <span className="search__icon">
              <SearchIcon size={18} />
            </span>
            <input className="search__input" type="text" placeholder="Search products..." />
          </div>

          {/* Stock cards, two per row */}
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading stock…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : items.length === 0 ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>
              No stock in the store{categoryId ? " for this category" : ""}.
            </p>
          ) : (
            <div className="manage-grid">

              {items.map((item) => {
                const low = Number(item.quantity) < 10;
                return (
                  <div className={`manage-card ${low ? "manage-card--low" : ""}`} key={item.id}>
                    <div className="manage-card__info">
                      {/* Name and category badge sit on one line */}
                      <div className="manage-card__head">
                        <span className="manage-card__name">{item.name}</span>
                        {item.category_name && (
                          <span className="manage-card__cat">{item.category_name}</span>
                        )}
                      </div>
                      <div className="manage-card__price-label">{item.description || "—"}</div>
                      <div className="manage-card__price">
                        {Number(item.quantity).toLocaleString()} {item.unit}
                      </div>
                    </div>
                    <div className="manage-card__actions">
                      <button
                        className="icon-btn icon-btn--edit"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => setEditing(item)}
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        className="icon-btn icon-btn--topup"
                        aria-label={`Top up ${item.name}`}
                        onClick={() => setToppingUp(item)}
                      >
                        <PlusIcon size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* Add new stock (dashed) */}
          <button className="add-dashed" onClick={() => setModal("new")}>
            <PlusIcon size={14} /> Add New Stock
          </button>
        </div>
      </div>

      {/* Add stock */}
      {modal === "new" && (
        <StockFormModal
          mode="new"
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await loadItems(); }}
        />
      )}

      {/* Edit / top up stock */}
      {editing && (
        <StockFormModal
          mode="edit"
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await loadItems(); }}
        />
      )}

      {/* Add category */}
      {modal === "category" && (
        <NewStockCategory
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await refreshCategories(); }}
        />
      )}

      {/* Top-up stock */}
      {toppingUp && (
        <StockTopUpModal
          item={toppingUp}
          onClose={() => setToppingUp(null)}
          onSaved={async () => { setToppingUp(null); await loadItems(); }}
        />
      )}
    </div>
  );
}
