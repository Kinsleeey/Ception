import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ProductFormModal from "../components/ProductFormModal.jsx";
import NewCategory from "./NewCategory.jsx";
import {
  GridIcon, SearchIcon, EditIcon, TrashIcon, PlusIcon,
} from "../components/icons.jsx";
import { products, manageCategories, barLocations, barStats } from "../data/barData.js";

// Add/Edit Drinks is the admin-side bar management screen. Adding/editing a
// product, creating a category, and confirming a delete all open as popups
// *over* this page (blurred behind them) instead of separate screens.
export default function BarEditDrinks() {
  const [location, setLocation] = useState(barLocations[0]);
  const [category, setCategory] = useState("All");
  const [pendingDelete, setPendingDelete] = useState(null); // product awaiting delete confirm
  const [editing, setEditing] = useState(null);             // product being edited
  const [modal, setModal] = useState(null);                 // "new" | "category" | null

  const visible =
    category === "All" ? products : products.filter((p) => p.category === category);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Products</span>
        </header>

        <div className="content">
          {/* Bar location tabs (reuses the category tab styling) */}
          <CategoryTabs categories={barLocations} active={location} onChange={setLocation} />

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

          {/* Category filter pills + a create-category link at the end */}
          <div className="pills-row">
            {manageCategories.map((cat) => (
              <button
                key={cat}
                className={cat === category ? "filter-pill filter-pill--active" : "filter-pill"}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <button className="create-category-link" onClick={() => setModal("category")}>
              <PlusIcon size={12} /> Create New Category
            </button>
          </div>

          {/* Search */}
          <div className="search search--wide">
            <span className="search__icon">
              <SearchIcon size={18} />
            </span>
            <input className="search__input" type="text" placeholder="Search products..." />
          </div>

          {/* Product management grid */}
          <div className="manage-grid">
            {visible.map((product) => (
              <div className="manage-card" key={product.name}>
                <div className="manage-card__info">
                  <div className="manage-card__name">{product.name}</div>
                  <span className="manage-card__cat">{product.category}</span>
                  <div className="manage-card__price-label">Price per unit</div>
                  <div className="manage-card__price">{product.price}</div>
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

          {/* Add new product (dashed) */}
          <button className="add-dashed" onClick={() => setModal("new")}>
            <PlusIcon size={14} /> Add New Product
          </button>
        </div>
      </div>

      {/* Popups render over this page (blurred behind them). */}
      {modal === "new" && (
        <ProductFormModal mode="new" onClose={() => setModal(null)} />
      )}
      {editing && (
        <ProductFormModal
          mode="edit"
          initial={{
            name: editing.name,
            category: editing.category,
            price: String(editing.price).replace(/[₦,]/g, ""),
            description: "",
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {modal === "category" && <NewCategory onClose={() => setModal(null)} />}

      {/* Delete confirmation appears on top when a product is pending deletion */}
      {pendingDelete && (
        <ConfirmModal
          variant="danger"
          title="Delete Product?"
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            alert(`Deleted ${pendingDelete.name}. (Demo — nothing is removed yet.)`);
            setPendingDelete(null);
          }}
        >
          You are about to delete <strong>{pendingDelete.name}</strong> from {location}.
          This action cannot be undone.
        </ConfirmModal>
      )}
    </div>
  );
}
