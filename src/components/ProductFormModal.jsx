import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { manageCategories } from "../data/barData.js";

// The Add / Edit Product form, shown as a small modal. Both screens share
// this one component — only the title, button label, and starting values
// differ, so they're passed in as props.
//
// Props:
//   mode     -> "new" | "edit" (controls the title and button text)
//   initial  -> { name, category, price, description } starting values
//   onClose  -> called when the modal should close
export default function ProductFormModal({ mode = "new", initial = {}, onClose }) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(initial.name || "");
  const [category, setCategory] = useState(initial.category || "Spirits");
  const [price, setPrice] = useState(initial.price || "");
  const [description, setDescription] = useState(initial.description || "");

  // Categories minus the "All" pseudo-option, which isn't a real category.
  const options = manageCategories.filter((c) => c !== "All");

  function handleSubmit() {
    alert(`${isEdit ? "Saved changes to" : "Added"} "${name || "Untitled"}". (Demo — nothing is stored yet.)`);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <div className="modal-subtitle">
            <span>Bar 1</span>
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
                <select className="pill-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
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
            <label className="field-label-strong">Description</label>
            <textarea
              className="pill-input"
              placeholder="e.g. Premium French cognac, smooth and rich"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
