import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ProductFormModal from "../components/ProductFormModal.jsx";
import NewCategory from "./NewCategory.jsx";
import {
  GridIcon, SearchIcon, EditIcon, TrashIcon, PlusIcon,
} from "../components/icons.jsx";
import {
  getProducts, getBarCategories, deleteProduct,
} from "../api.js";

const BAR_LOCATIONS = ["Bar 1", "Bar 2", "Lounge"];

// Add/Edit Drinks is the admin-side bar management screen. Products come from
// the backend; adding/editing/deleting a product and creating a category all
// open as popups over this page.
export default function BarEditDrinks() {
  const [location, setLocation] = useState("Bar 1");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null); // null = "All"

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(null); // "new" | "category" | null

  // Load categories once (for the filter pills + the forms).
  useEffect(() => {
    getBarCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Load products for the current bar + category. Separated so we can refresh
  // after add/edit/delete.
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

  useEffect(() => {
    loadProducts();
  }, [location, categoryId]);

  // Also refresh the category list (in case a new one was just added).
  async function refreshCategories() {
    try {
      setCategories(await getBarCategories());
    } catch { /* ignore */ }
  }

  async function handleDelete() {
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
      await loadProducts();
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
          <span className="topbar__title">Products — {location}</span>
        </header>

        <div className="content">
          {/* Bar location tabs */}
          <CategoryTabs categories={BAR_LOCATIONS} active={location} onChange={setLocation} />

          {/* Stats strip */}
          <div className="stat-strip">
            <span className="stat-strip__item">
              Total Products <span className="stat-strip__num">{products.length}</span>
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

          {/* Product management grid */}
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading products…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : products.length === 0 ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>
              No products in {location}{categoryId ? " for this category" : ""}.
            </p>
          ) : (
            <div className="manage-grid">
              {products.map((product) => (
                <div className="manage-card" key={product.id}>
                  <div className="manage-card__info">
                    <div className="manage-card__name">{product.name}</div>
                    <span className="manage-card__cat">{product.category_name || "—"}</span>
                    <div className="manage-card__price-label">Price per unit</div>
                    <div className="manage-card__price">₦{Number(product.price).toLocaleString()}</div>
                  </div>
                  <div className="manage-card__actions">
                    <button
                      className="icon-btn icon-btn--edit"
                      aria-label={`Edit ${product.name}`}
                      onClick={() => setEditing(product)}
                    >
                      <EditIcon size={18} />
                    </button>
                    <button
                      className="icon-btn icon-btn--delete"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => setPendingDelete(product)}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new product (dashed) */}
          <button className="add-dashed" onClick={() => setModal("new")}>
            <PlusIcon size={14} /> Add New Product
          </button>
        </div>
      </div>

      {/* Add product */}
      {modal === "new" && (
        <ProductFormModal
          mode="new"
          location={location}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await loadProducts(); }}
        />
      )}

      {/* Edit product */}
      {editing && (
        <ProductFormModal
          mode="edit"
          product={editing}
          location={location}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await loadProducts(); }}
        />
      )}

      {/* Add category */}
      {modal === "category" && (
        <NewCategory
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await refreshCategories(); }}
        />
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <ConfirmModal
          variant="danger"
          title="Delete Product?"
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        >
          You are about to delete <strong>{pendingDelete.name}</strong> from {location}.
          This action cannot be undone.
        </ConfirmModal>
      )}
    </div>
  );
}