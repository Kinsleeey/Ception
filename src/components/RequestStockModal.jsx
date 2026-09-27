import { useState, useMemo, useEffect } from "react";
import { CloseIcon, ChevronDownIcon, PlusIcon } from "./icons.jsx";
import { getStockItems, getStockCategories, createStockRequest } from "../api.js";

// The bar asking the store for supplies.
//
// A request holds several items, because restocking a bar means one list to
// the store rather than five separate asks. Items are built one at a time at
// the top and collected in the list below before sending.
export default function RequestStockModal({ barLocation = "Bar 1", onClose, onSaved }) {
  const [stock, setStock] = useState([]);
  const [categories, setCategories] = useState([]);

  const [category, setCategory] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");

  // The lines gathered so far, before sending.
  const [lines, setLines] = useState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getStockItems(), getStockCategories()])
      .then(([items, cats]) => {
        setStock(items);
        setCategories(cats.map((c) => c.name));
        setCategory(cats[0]?.name || "");
      })
      .catch(() => { setStock([]); setCategories([]); });
  }, []);

  const itemsInCategory = useMemo(
    () => stock.filter((s) => s.category_name === category),
    [stock, category]
  );

  // The chosen item drives the unit and the "in store" note.
  const selected = useMemo(
    () => stock.find((s) => String(s.id) === String(itemId)) || null,
    [stock, itemId]
  );

  function changeCategory(next) {
    setCategory(next);
    setItemId("");        // the old item isn't in the new category
  }

  function addLine() {
    if (!selected) { setError("Pick an item first."); return; }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a whole number above zero.");
      return;
    }
    if (lines.some((l) => l.stock_item_id === selected.id)) {
      setError("That item is already on this request.");
      return;
    }
    setLines((prev) => [...prev, {
      stock_item_id: selected.id,
      name: selected.name,
      category: selected.category_name,
      quantity: qty,
      unit: selected.unit,
    }]);
    setItemId("");
    setQuantity("1");
    setError(null);
  }

  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.stock_item_id !== id));
  }

  async function handleSend() {
    if (lines.length === 0) { setError("Add at least one item."); return; }
    try {
      setBusy(true);
      setError(null);
      await createStockRequest({
        bar_location: barLocation,
        note: note.trim() || null,
        items: lines.map(({ stock_item_id, quantity, unit }) => ({
          stock_item_id, quantity, unit,
        })),
      });
      if (onSaved) onSaved(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sr-card" onClick={(e) => e.stopPropagation()}>
        <div className="sr-header">
          <div>
            <h2 className="sr-title">Request Stock</h2>
            <p className="sr-subtitle">{barLocation}</p>
          </div>
          <button className="sr-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={10} />
          </button>
        </div>

        <div className="sr-hairline" />

        <div className="sr-body">
          <div className="sr-row">
            <div className="sr-field">
              <label className="sr-label">Category</label>
              <div className="sr-select">
                <select value={category} onChange={(e) => changeCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="sr-select__chev"><ChevronDownIcon size={12} /></span>
              </div>
            </div>

            <div className="sr-field">
              <label className="sr-label">Item</label>
              <div className="sr-select">
                <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
                  <option value="">Select an item</option>
                  {itemsInCategory.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <span className="sr-select__chev"><ChevronDownIcon size={12} /></span>
              </div>
              {/* What the store actually holds, so nobody asks for more than
                  exists and waits days to find out. */}
              {selected && (
                <span className="sr-avail">
                  <span className="sr-avail__dot" />
                  {selected.quantity} {selected.unit} in store
                </span>
              )}
            </div>
          </div>

          <div className="sr-row">
            <div className="sr-field">
              <label className="sr-label">Quantity</label>
              <input
                className="sr-input"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="sr-field">
              <label className="sr-label">Unit</label>
              {/* Read-only: the unit belongs to the item, not to the request. */}
              <input className="sr-input sr-input--readonly"
                value={selected ? selected.unit : ""} readOnly placeholder="—" />
            </div>
          </div>

          <div className="sr-field">
            <label className="sr-label">Note</label>
            <input
              className="sr-input"
              placeholder="e.g. needed before the weekend"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="sr-addrow">
            <button className="sr-add" onClick={addLine}>
              <PlusIcon size={8} /> Add to request
            </button>
          </div>

          {/* What's been gathered so far */}
          <div className="sr-list">
            <div className="sr-list__head">
              <span className="sr-label">Request</span>
              <span className="sr-count">
                {lines.length} item{lines.length === 1 ? "" : "s"} added
              </span>
            </div>

            {lines.length === 0 ? (
              <p className="sr-empty">Nothing added yet.</p>
            ) : (
              lines.map((l, i) => (
                <div className="sr-line" key={l.stock_item_id}>
                  <div className="sr-line__left">
                    <span className="sr-line__idx">{i + 1}</span>
                    <div>
                      <div className="sr-line__name">{l.name}</div>
                      <div className="sr-line__cat">Category: {l.category}</div>
                    </div>
                  </div>
                  <div className="sr-line__right">
                    <span className="sr-line__qty">{l.quantity} {l.unit}</span>
                    <button className="sr-line__x" onClick={() => removeLine(l.stock_item_id)}
                      aria-label={`Remove ${l.name}`}>
                      <CloseIcon size={9} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {error && <p className="sr-error">{error}</p>}
        </div>

        <div className="sr-hairline" />

        <div className="sr-footer">
          <button className="sr-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="sr-send" onClick={handleSend} disabled={busy}>
            {busy ? "Sending…" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}