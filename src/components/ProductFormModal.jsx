import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { addProduct, updateProduct } from "../api.js";

// The Add / Edit Product form, shown as a small modal. Shared by "new" and
// "edit". Categories (with ids) and the bar location are passed in so the form
// saves real, linked data.
//
// Props:
//   mode       -> "new" | "edit"
//   product    -> the product being edited (edit mode)
//   location   -> the bar this product belongs to (e.g. "Bar 1")
//   categories -> [{ id, name }] for the dropdown
//   onClose    -> close the popup
//   onSaved    -> called after a successful save (refreshes the grid)
export default function ProductFormModal({
  mode = "new", product, location, categories = [], onClose, onSaved,
}) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(product?.name || "");
  // Track the category by id. Default to the product's category, else the
  // first available category.
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? (categories[0]?.id ?? "")
  );
  const [price, setPrice] = useState(
    product ? String(product.price).replace(/[₦,]/g, "") : ""
  );
  const [unit, setUnit] = useState(product?.unit || "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter a drink name."); return; }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) { setError("Please enter a valid price."); return; }

    try {
      setBusy(true);
      setError(null);

      if (isEdit) {
        // Send only what this form edits.
        await updateProduct(product.id, {
          name,
          price: priceNum,
          category_id: categoryId || null,
          unit,
        });
      } else {
        await addProduct({
          name,
          price: priceNum,
          category_id: categoryId || null,
          bar_location: location,   // new products belong to the current bar
          unit,
        });
      }
      if (onSaved) onSaved(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <div className="modal-subtitle">
            <span>{location || "Bar"}</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div>
            <div className="form-modal-section-label">Product Details</div>
            <div className="form-modal-body__rule" />
          </div>

          <div>
            <label className="field-label-strong">Drink Name</label>
            <input
              className="pill-input"
              placeholder="e.g. Hennessy VS"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label-strong">Category</label>
              <div className="select-wrap">
                <select
                  className="pill-input"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <span className="select-wrap__chevron">
                  <ChevronDownIcon size={18} />
                </span>
              </div>
            </div>
            <div>
              <label className="field-label-strong">Price Per Unit</label>
              <div className="price-input">
                <span className="price-input__naira">₦</span>
                <input
                  className="pill-input"
                  inputMode="numeric"
                  placeholder="8500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="field-label-strong">Unit</label>
            <input
              className="pill-input"
              placeholder="e.g. Shot, Bottle, Glass"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>
          )}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : (isEdit ? "Save Changes" : "Add Product")}
          </button>
        </div>
      </div>
    </div>
  );
}