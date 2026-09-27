import { useState, useEffect } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { addMoneyMovement, getAcctCategories } from "../api.js";

// Add-ons (money in) and Out-goings (money out) are the same form with the
// direction flipped, so they share one component. `direction` decides the
// title, the category list, and whether the money lands in or leaves an
// account.
//
// These are the two movements with no source elsewhere in the system — they're
// entered by hand, which is why they have no "linked record".
const COPY = {
  in: {
    title: "Add-ons",
    subtitle: "Money into the business",
    accountLabel: "Received Into",
    categories: ["Owner Capital", "Loan Received", "Other Non-Sales Income"],
    action: "Record Add-on",
    hint: "Money coming in from outside the business — not from sales.",
  },
  out: {
    title: "Out-goings",
    subtitle: "Money out of the business",
    accountLabel: "Paid From",
    categories: ["Owner Drawings", "Loan Repayment", "Other Non-Expense Payment"],
    action: "Record Out-going",
    hint: "Money leaving the business that isn't an expense.",
  },
};

const ACCOUNTS = ["Cash", "Transfer", "POS"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function MoneyMovementModal({ direction = "in", onClose, onSaved }) {
  const copy = COPY[direction] ?? COPY.in;

  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Categories come from the DB, filtered to this direction's type.
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    getAcctCategories(direction === "in" ? "addon" : "outgoing")
      .then((rows) => {
        setCategories(rows);
        setCategoryId(rows[0]?.id ?? "");
      })
      .catch(() => setCategories([]));
  }, [direction]);

  async function handleSave() {
    const amt = Number(String(amount).replace(/,/g, ""));
    if (!amt || amt <= 0) { setError("Enter an amount greater than zero."); return; }
    if (!description.trim()) { setError("Please describe what this is for."); return; }
    try {
      setBusy(true);
      setError(null);
      await addMoneyMovement({
        direction,
        date,
        amount: amt,
        method: account,
        category_id: categoryId || null,
        description: description.trim(),
      });
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
          <h2 className="modal-title">{copy.title}</h2>
          <div className="modal-subtitle"><span>{copy.subtitle}</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />

          <div className="reserve-grid reserve-grid--2">
            <div>
              <label className="field-label-strong">Date</label>
              <input type="date" className="pill-input" value={date}
                onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label-strong">Amount</label>
              <div className="price-input">
                <span className="price-input__naira">₦</span>
                <input
                  className="pill-input"
                  inputMode="numeric"
                  placeholder="3,000,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="field-label-strong">{copy.accountLabel}</label>
            <div className="select-wrap">
              <select className="pill-input" value={account}
                onChange={(e) => setAccount(e.target.value)}>
                {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <span className="select-wrap__chevron"><ChevronDownIcon size={18} /></span>
            </div>
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

          <div>
            <label className="field-label-strong">Description</label>
            <input
              className="pill-input"
              placeholder={direction === "in"
                ? "e.g. Working capital loan, 18 months"
                : "e.g. Borehole installation"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="addexp__hint">{copy.hint}</p>
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>}
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSave} disabled={busy}>{busy ? "Saving…" : copy.action}</button>
        </div>
      </div>
    </div>
  );
}