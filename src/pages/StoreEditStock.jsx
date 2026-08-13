import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import StockFormModal from "../components/StockFormModal.jsx";
import NewStockCategory from "./NewStockCategory.jsx";
import {
  GridIcon, SearchIcon, EditIcon, TrashIcon, PlusIcon,
} from "../components/icons.jsx";
import {
  getStockItems, getStockCategories, deleteStockItem,
} from "../api.js";

// Inventory List is the admin-side store management screen. It mirrors
// BarEditDrinks, with two differences:
//   - there are no location tabs (there is one store, not three bars)
//   - a card shows quantity in stock rather than a price
//
// Adding/editing/deleting an item and creating a category all open as popups
// over this page.
export default function StoreEditStock() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null); // null = "All"

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
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

  async function handleDelete() {
    try {
      await deleteStockItem(pendingDelete.id);
      setPendingDelete(null);
      await loadItems();
    } catch (err) {
      alert(`Couldn't delete: ${err.message}`);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Inventory List</span>
        </header>

        <div className="content">
          {/* Stats strip */}
          <div className="stat-strip">
            <span className="stat-strip__item">
              Total Products <span className="stat-strip__num">{items.length}</span>
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
            <input className="search__input" type="text" placeholder="Search inventory..." />
          </div>

          {/* Stock management grid */}
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading inventory…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : items.length === 0 ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>
              No stock in the store{categoryId ? " for this category" : ""}.
            </p>
          ) : (
            <div className="manage-grid">
              {items.map((item) => (
                <div className="manage-card" key={item.id}>
                  <div className="manage-card__info">
                    <div className="manage-card__name">{item.name}</div>
                    <span className="manage-card__cat">{item.category_name || "—"}</span>
                    <div className="manage-card__price-label">In stock</div>
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
                      className="icon-btn icon-btn--delete"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => setPendingDelete(item)}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>
              ))}
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

      {/* Edit stock */}
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

      {/* Delete confirmation */}
      {pendingDelete && (
        <ConfirmModal
          variant="danger"
          title="Delete Stock Item?"
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        >
          You are about to delete <strong>{pendingDelete.name}</strong> from the store.
          This action cannot be undone.
        </ConfirmModal>
      )}
    </div>
  );
}
