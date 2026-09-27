import { useState, useMemo, useEffect } from "react";
import { CloseIcon, SearchIcon, ChevronDownIcon } from "./icons.jsx";
import { CATEGORY_STYLES } from "../data/expensesData.js";
import { getUnpaidExpenses, payExpense } from "../api.js";

// Expenses recorded against the Expenses Card — incurred but not yet paid.
// Opened by "View Expenses" on the card.
//
// Clicking a row's pay icon slides a payment strip open directly beneath that
// row, inside the list. Only one row is open at a time, so nobody half-fills
// three payments at once.

const METHODS = ["Cash", "Transfer", "POS"];

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// The banknote icon on the pay button.
function CashIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

// `onChanged` lets the page refresh its card total after a payment lands.
export default function OutstandingExpensesModal({ onClose, onChanged }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalOutstanding: 0, count: 0, oldest: null });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Which row's payment strip is open, plus its inputs.
  const [payingId, setPayingId] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(METHODS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const data = await getUnpaidExpenses();
      setRows(data.items);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totalOutstanding = summary.totalOutstanding;
  const oldest = summary.oldest;

  // Opening a row pre-fills the full outstanding amount — paying in full is the
  // common case, so it should be one click.
  function openPay(e) {
    setPayingId(e.id);
    setAmount(String(e.outstanding));
    setMethod(METHODS[0]);
    setError(null);
  }

  async function confirmPay(e) {
    const amt = Number(String(amount).replace(/,/g, ""));
    if (Number.isNaN(amt) || amt <= 0) { setError("Enter an amount above zero."); return; }
    // The server also caps this at what's owed, so an overpay is refused there.
    try {
      setBusy(true);
      setError(null);
      await payExpense(e.id, amt, method);
      setPayingId(null);
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card outexp" onClick={(ev) => ev.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Outstanding Expenses</h2>
          <div className="modal-subtitle"><span>Expenses Card</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {/* Summary */}
          <div className="order-summary">
            <div className="order-summary__item">
              <div className="order-summary__label">Total Outstanding</div>
              <div className="order-summary__value outexp-total">{naira(totalOutstanding)}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Unpaid Items</div>
              <div className="order-summary__value">{rows.length}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Oldest</div>
              <div className="order-summary__value" style={{ fontSize: "14px" }}>
                {oldest ? formatDate(oldest) : "—"}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="search search--wide">
            <span className="search__icon"><SearchIcon size={16} /></span>
            <input
              className="search__input"
              type="text"
              placeholder="Filter by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* The list */}
          <div>
            <div className="section-divider" style={{ marginBottom: "8px" }}>
              <span className="section-divider__label">Unpaid</span>
              <span className="section-divider__line" />
            </div>

            {loading ? (
              <p className="outexp-empty">Loading…</p>
            ) : visible.length === 0 ? (
              <p className="outexp-empty">
                {query ? "Nothing matches that filter." : "Nothing outstanding — the card is clear."}
              </p>
            ) : (
              <div className="outexp-list">
                {visible.map((e) => {
                  const owed = e.outstanding;
                  const partly = (e.paid || 0) > 0;
                  const pct = Math.round(((e.paid || 0) / e.amount) * 100);
                  const isOpen = payingId === e.id;
                  const cat = CATEGORY_STYLES[e.category] || { bg: "#e4ddeb", fg: "#1d1a24" };

                  return (
                    <div key={e.id}>
                      <div className="outexp-row">
                        <div className="outexp-row__info">
                          <div className="outexp-row__top">
                            <span className="outexp-row__name">{e.description}</span>
                            <span className="exp-cat" style={{ background: cat.bg, color: cat.fg }}>
                              {e.category}
                            </span>
                          </div>
                          <div className="outexp-row__date">
                            {e.vendor} · {formatDate(e.spendDate)}
                          </div>
                        </div>

                        <div className="outexp-row__money">
                          <div className="outexp-row__owed">{naira(owed)}</div>
                          {partly && (
                            <>
                              <div className="outexp-row__part">
                                {naira(e.paid)} of {naira(e.amount)} paid
                              </div>
                              <div className="outexp-bar">
                                <div className="outexp-bar__fill" style={{ width: `${pct}%` }} />
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          className={isOpen ? "outexp-pay outexp-pay--active" : "outexp-pay"}
                          onClick={() => (isOpen ? setPayingId(null) : openPay(e))}
                          aria-label={`Pay ${e.description}`}
                        >
                          <CashIcon size={16} />
                        </button>
                      </div>

                      {/* The payment strip, inline beneath its row. */}
                      {isOpen && (
                        <div className="outexp-paystrip">
                          <div className="outexp-paystrip__field">
                            <label className="field-label-strong">Amount to Pay</label>
                            <div className="price-input">
                              <span className="price-input__naira">₦</span>
                              <input
                                className="pill-input"
                                inputMode="numeric"
                                value={amount}
                                onChange={(ev) => setAmount(ev.target.value)}
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="outexp-paystrip__field">
                            <label className="field-label-strong">Payment Method</label>
                            <div className="select-wrap">
                              <select
                                className="pill-input"
                                value={method}
                                onChange={(ev) => setMethod(ev.target.value)}
                              >
                                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <span className="select-wrap__chevron">
                                <ChevronDownIcon size={18} />
                              </span>
                            </div>
                          </div>

                          <button className="btn-pill-primary outexp-paystrip__go"
                            onClick={() => confirmPay(e)} disabled={busy}>
                            {busy ? "Paying…" : "Pay"}
                          </button>
                          <button className="outexp-paystrip__cancel" onClick={() => setPayingId(null)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p style={{ padding: "0 24px", color: "#c0392b", fontSize: "14px" }}>{error}</p>
        )}

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}