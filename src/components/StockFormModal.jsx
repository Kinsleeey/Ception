import { useState } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { addStockItem, updateStockItem } from "../api.js";

// The Add / Edit Stock form, shown as a small modal. Shared by "new" and
// "edit" — same pattern as ProductFormModal on the bar side.
//
// EDIT mode is deliberately restricted: only Category, Unit and Description can
// change. Name is frozen (it's the item's identity across history) and Quantity
// is frozen (it moves only via Top-up, which records a history row). So in edit
// mode the Name and Quantity fields are not shown at all.
//
// Props:
//   mode       -> "new" | "edit"
//   item       -> the stock item being edited (edit mode)
//   categories -> [{ id, name }] for the dropdown
//   onClose    -> close the popup
//   onSaved    -> called after a successful save (refreshes the grid)
export default function StockFormModal({
  mode = "new", item, categories = [], onClose, onSaved,
}) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(item?.name || "");
  // Track the category by id. Default to the item's category, else the first
  // available category.
  const [categoryId, setCategoryId] = useState(
    item?.category_id ?? (categories[0]?.id ?? "")
  );
  const [quantity, setQuantity] = useState(
    item ? String(item.quantity) : "1"
  );
  const [unit, setUnit] = useState(item?.unit || "");
  const [description, setDescription] = useState(item?.description || "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    // Name is only required (and only editable) when creating.
    if (!isEdit && !name.trim()) { setError("Please enter a stock name."); return; }
    if (!unit.trim()) { setError("Please enter a unit (e.g. Packs)."); return; }

    // Quantity is only entered when creating; in edit mode it isn't touched.
    let quantityNum;
    if (!isEdit) {
      quantityNum = Number(quantity);
      if (!Number.isInteger(quantityNum) || quantityNum < 0) {
        setError("Quantity must be a whole number, 0 or more.");
        return;
      }
    }

    try {
      setBusy(true);
      setError(null);

      // Edit sends only the three allowed fields. New sends everything.
      const fields = isEdit
        ? {
            category_id: categoryId || null,
            unit: unit.trim(),
            description: description.trim(),
          }
        : {
            name: name.trim(),
            category_id: categoryId || null,
            quantity: quantityNum,
            unit: unit.trim(),
            description: description.trim(),
          };

      if (isEdit) {
        await updateStockItem(item.id, fields);
      } else {
        await addStockItem(fields);
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
          <h2 className="modal-title">{isEdit ? "Edit Stock" : "Add New Stock"}</h2>
          <div className="modal-subtitle">
            <span>{isEdit ? item?.name : "Store"}</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div>
            <div className="form-modal-section-label">Stock Details</div>
            <div className="form-modal-body__rule" />
          </div>

          {/* Stock Name — only when creating. Frozen in edit mode. */}
          {!isEdit && (
            <div>
              <label className="field-label-strong">Stock Name</label>
              <input
                className="pill-input"
                placeholder="e.g. Bottled water"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

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

          {/* Quantity + Unit when creating; just Unit when editing. */}
          {isEdit ? (
            <div>
              <label className="field-label-strong">Unit</label>
              <input
                className="pill-input"
                placeholder="e.g. Packs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          ) : (
            <div className="field-row">
              <div>
                <label className="field-label-strong">Quantity</label>
                <input
                  className="pill-input"
                  inputMode="numeric"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label-strong">Unit</label>
                <input
                  className="pill-input"
                  placeholder="e.g. Packs"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="field-label-strong">Description</label>
            {/* textarea.pill-input is already styled in styles.css (16px radius) */}
            <textarea
              className="pill-input"
              rows={2}
              placeholder="e.g. 24 bottles per pack"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>
          )}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : (isEdit ? "Save Changes" : "Add Stock")}
          </button>
        </div>
      </div>
    </div>
  );
}
