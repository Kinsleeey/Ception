import { useState, useEffect } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { addExpense, getAcctCategories, getExpenses } from "../api.js";

// Add Expense. The payment method carries a special option — "Expenses Card" —
// which means the expense is RECORDED BUT NOT PAID. Everything else means it
// was settled at the time it was incurred.
const METHODS = ["Cash", "Transfer", "POS", "Expenses Card"];

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddExpenseModal({ onClose, onSaved }) {
  const [spendDate, setSpendDate] = useState(today());
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState("");
  const [method, setMethod] = useState(METHODS[0]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // The design shows the last few entries beside the form — useful context when
  // you're entering several in a row.
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getAcctCategories("expense")
      .then((rows) => {
        setCategories(rows);
        setCategoryId(rows[0]?.id ?? "");
      })
      .catch(() => setCategories([]));

    getExpenses()
      .then((rows) => setRecent(rows.slice(0, 5)))
      .catch(() => setRecent([]));
  }, []);

  const unpaid = method === "Expenses Card";

  async function handleSave() {
    const amt = Number(String(amount).replace(/,/g, ""));
    if (!amt || amt <= 0) { setError("Enter an amount greater than zero."); return; }
    if (!description.trim()) { setError("Please describe what the money was for."); return; }
    try {
      setBusy(true);
      setError(null);
      // "Expenses Card" as the method is what makes this unpaid — the server
      // records the cost and writes no cash movement.
      await addExpense({
        spend_date: spendDate,
        category_id: categoryId || null,
        description: description.trim(),
        vendor: vendor.trim(),
        amount: amt,
        method,
      });
      if (onSaved) onSaved(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card addexp" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Add Expense</h2>
          <div className="modal-subtitle"><span>Accounting</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body addexp__body">
          {/* The form */}
          <div className="addexp__form">
            <div className="reserve-grid reserve-grid--2">
              <div>
                <label className="field-label-strong">Spend Date</label>
                <input
                  type="date"
                  className="pill-input"
                  value={spendDate}
                  onChange={(e) => setSpendDate(e.target.value)}
                />
                <p className="addexp__hint">
                  The date the money was spent, not the date you are entering it.
                </p>
              </div>
              <div>
                <label className="field-label-strong">Category</label>
                <div className="select-wrap">
                  <select className="pill-input" value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="select-wrap__chevron"><ChevronDownIcon size={18} /></span>
                </div>
              </div>
            </div>

            <div>
              <label className="field-label-strong">Amount</label>
              <div className="price-input">
                <span className="price-input__naira">₦</span>
                <input
                  className="pill-input"
                  inputMode="numeric"
                  placeholder="145,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="field-label-strong">Description</label>
              <input
                className="pill-input"
                placeholder="e.g. 200 litres for generator"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="reserve-grid reserve-grid--2">
              <div>
                <label className="field-label-strong">Vendor</label>
                <input
                  className="pill-input"
                  placeholder="e.g. Halima Fuel"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label-strong">Payment Method</label>
                <div className="select-wrap">
                  <select className="pill-input" value={method}
                    onChange={(e) => setMethod(e.target.value)}>
                    {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <span className="select-wrap__chevron"><ChevronDownIcon size={18} /></span>
                </div>
              </div>
            </div>

            {/* Choosing the card is the one option that means "not paid yet",
                so it's worth saying out loud. */}
            {unpaid && (
              <p className="addexp__note">
                This expense will be recorded as <strong>unpaid</strong> and added to the
                Expenses Card. Settle it later from there.
              </p>
            )}

            {error && <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>}
          </div>

          {/* Recent entries, for context while entering several */}
          <div className="addexp__recent">
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Recent Entries</span>
              <span className="section-divider__line" />
            </div>
            <p className="addexp__hint" style={{ marginTop: 0 }}>Last expenses entered</p>
            <div className="addexp__recentlist">
              {recent.map((e) => (
                <div className="addexp__recentrow" key={e.id}>
                  <div>
                    <div className="addexp__recentname">{e.description}</div>
                    <div className="addexp__recentmeta">{e.category} · {e.vendor}</div>
                  </div>
                  <span className="addexp__recentamt">{naira(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="modal-btn modal-btn--solid" onClick={handleSave} disabled={busy}>{busy ? "Saving…" : "Add Expense"}</button>
        </div>
      </div>
    </div>
  );
}