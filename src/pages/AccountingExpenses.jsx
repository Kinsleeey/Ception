import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import OutstandingExpensesModal from "../components/OutstandingExpensesModal.jsx";
import VoidReasonModal from "../components/VoidReasonModal.jsx";
import { GridIcon, SearchIcon, ChevronDownIcon } from "../components/icons.jsx";
import { CATEGORY_STYLES } from "../data/expensesData.js";
import {
  getExpenses, getUnpaidExpenses, getAcctCategories, voidExpense,
} from "../api.js";

// The main table lists expenses PAID at the time they were incurred. Unpaid
// ones sit behind the Expenses Card, top-right, and open in their own popup.

const PAGE_SIZE = 8;

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Category pill colours come from the data file so the table and the popup
// can't drift apart.
function CategoryPill({ name, muted }) {
  const s = CATEGORY_STYLES[name] || { bg: "#e4ddeb", fg: "#1d1a24" };
  return (
    <span
      className="exp-cat"
      style={muted ? { background: "#ccc3d8", color: "#4a4455" } : { background: s.bg, color: s.fg }}
    >
      {name}
    </span>
  );
}

export default function AccountingExpenses() {
  // The Overview drills through to here with a month applied.
  const [params] = useSearchParams();

  // A drill-through arrives with from/to. Otherwise the month dropdown drives
  // the range — one filter, two ways of setting it, so they can't disagree.
  // A drill-through arrives with a range, not a label — work the label back out
  // so the dropdown shows the month actually being displayed.
  const initialFrom = params.get("from") || "";
  const [month, setMonth] = useState(() => {
    if (!initialFrom) return "All Months";
    const [y, m] = initialFrom.split("-");
    const name = ["January","February","March","April","May","June","July",
                  "August","September","October","November","December"][Number(m) - 1];
    return name ? `${name} ${y}` : "All Months";
  });
  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");
  const [category, setCategory] = useState(params.get("category") || "All Categories");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [showUnpaid, setShowUnpaid] = useState(false);
  const [viewingVoid, setViewingVoid] = useState(null);

  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [card, setCard] = useState({ totalOutstanding: 0, count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expense categories for the filter dropdown.
  useEffect(() => {
    getAcctCategories("expense")
      .then((c) => setCategories(c.map((x) => x.name)))
      .catch(() => setCategories([]));
  }, []);

  // The card total is independent of the table's filters.
  async function loadCard() {
    try {
      setCard(await getUnpaidExpenses());
    } catch {
      setCard({ totalOutstanding: 0, count: 0, items: [] });
    }
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setRows(await getExpenses({ from, to, category, q: query }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCard(); }, []);
  useEffect(() => { load(); }, [from, to, category, query]);

  // Picking a month sets the range it covers.
  function chooseMonth(label) {
    setMonth(label);
    setPage(1);
    if (label === "All Months") { setFrom(""); setTo(""); return; }
    const [name, year] = label.split(" ");
    const idx = ["January","February","March","April","May","June","July",
                 "August","September","October","November","December"].indexOf(name);
    if (idx < 0) { setFrom(""); setTo(""); return; }
    const start = new Date(Date.UTC(Number(year), idx, 1));
    const end = new Date(Date.UTC(Number(year), idx + 1, 0));
    setFrom(start.toISOString().slice(0, 10));
    setTo(end.toISOString().slice(0, 10));
  }

  // The months that actually have expenses, newest first — so the dropdown
  // can't offer a month with nothing in it.
  const monthOptions = useMemo(() => {
    const seen = new Set(rows.map((e) => e.spendDate.slice(0, 7)));
    return [...seen].sort().reverse().map((ym) => {
      const [y, m] = ym.split("-");
      const name = ["January","February","March","April","May","June","July",
                    "August","September","October","November","December"][Number(m) - 1];
      return `${name} ${y}`;
    });
  }, [rows]);

  // The server applies the filters, so what comes back is what we show.
  const visible = rows;

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Headline figures. Voided expenses don't count toward the total.
  const totalExpenses = rows.filter((e) => !e.voided).reduce((s, e) => s + e.amount, 0);
  const paidCount = rows.filter((e) => !e.voided).length;

  const cardOutstanding = card.totalOutstanding;

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title sales-title">Expenses</span>
        </header>

        <div className="content">
          {/* Top row: two figure cards, then the Expenses Card */}
          <div className="exp-toprow">
            <div className="exp-figures">
              <div className="exp-figure">
                <div className="exp-figure__label">Total Expenses</div>
                <div className="exp-figure__value">{naira(totalExpenses)}</div>
              </div>
              <div className="exp-figure">
                <div className="exp-figure__label">Paid</div>
                <div className="exp-figure__value">{paidCount}</div>
              </div>
            </div>

            {/* The Expenses Card — styled like an account card. Unpaid expenses
                live behind it. */}
            <div className="exp-card">
              <div className="exp-card__head">
                <span className="exp-card__title">Expenses Card</span>
                <span className="exp-card__status">
                  <span className="exp-card__dot" />
                  Active
                </span>
              </div>
              <div className="exp-card__body">
                <div className="exp-card__amount">{naira(cardOutstanding)}.00</div>
                <div className="exp-card__count">
                  {card.count} Unpaid Expense{card.count === 1 ? "" : "s"}
                </div>
              </div>
              <button className="exp-card__link" onClick={() => setShowUnpaid(true)}>
                View Expenses
              </button>
            </div>
          </div>

          {/* Table card */}
          {error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>
          ) : (
          <div className="exp-table-card">
            {/* Filter bar */}
            <div className="exp-filterbar">
              <div className="exp-filterbar__left">
                <div className="exp-select">
                  <select value={month} onChange={(e) => chooseMonth(e.target.value)}>
                    <option>All Months</option>
                    {monthOptions.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <span className="exp-select__chevron"><ChevronDownIcon size={14} /></span>
                </div>
                <div className="exp-select">
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                    <option>All Categories</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="exp-select__chevron"><ChevronDownIcon size={14} /></span>
                </div>
              </div>

              <div className="exp-search">
                <span className="exp-search__icon"><SearchIcon size={14} /></span>
                <input
                  type="text"
                  placeholder="Search description or vendor"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Heading */}
            <div className="exp-tablehead">
              <h3 className="exp-tablehead__title">Paid Expenses</h3>
              <p className="exp-tablehead__sub">
                Expenses settled at the time they were incurred. Unpaid items are on the
                Expenses Card.
              </p>
            </div>

            {/* The table */}
            <div className="exp-tablewrap">
              <table className="exp-table">
                <thead>
                  <tr>
                    <th>Spend Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Vendor</th>
                    <th className="is-right">Amount</th>
                    <th>Method</th>
                    <th>Recorded By</th>
                    <th>Recorded On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="sales-empty">Loading expenses…</td></tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="sales-empty">No expenses match these filters.</td>
                    </tr>
                  ) : (
                    pageRows.map((e) => (
                      /* A voided row is greyed and struck through; clicking it
                         shows the reason it was voided. */
                      <tr
                        key={e.id}
                        className={e.voided ? "exp-row--voided" : ""}
                        onClick={e.voided ? () => setViewingVoid(e) : undefined}
                      >
                        <td>{formatDate(e.spendDate)}</td>
                        <td><CategoryPill name={e.category} muted={e.voided} /></td>
                        <td className="exp-desc">{e.description}</td>
                        <td>{e.vendor}</td>
                        <td className="is-right exp-amount">{naira(e.amount)}</td>
                        <td>{e.method}</td>
                        <td>{e.recordedBy}</td>
                        <td>{e.recordedOn}</td>
                        <td>
                          {e.voided ? (
                            <span className="exp-voided-pill">Voided</span>
                          ) : (
                            /* Voiding is same-day only — see the note in the
                               patches doc about enabling that check. */
                            <button
                              className="exp-void"
                              onClick={async () => {
                                const reason = window.prompt("Why is this being voided?");
                                if (!reason) return;
                                try {
                                  await voidExpense(e.id, reason);
                                  await load();
                                  await loadCard();
                                } catch (err) {
                                  alert(`Couldn't void: ${err.message}`);
                                }
                              }}
                            >
                              Void
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="exp-pagination">
              <span className="exp-pagination__count">
                Showing {visible.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                –{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}
              </span>
              <button
                className="exp-page exp-page--nav"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === page ? "exp-page exp-page--active" : "exp-page"}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="exp-page exp-page--nav"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {showUnpaid && (
        <OutstandingExpensesModal
          onClose={() => setShowUnpaid(false)}
          onChanged={async () => { await loadCard(); await load(); }}
        />
      )}

      {viewingVoid && (
        <VoidReasonModal expense={viewingVoid} onClose={() => setViewingVoid(null)} />
      )}
    </div>
  );
}