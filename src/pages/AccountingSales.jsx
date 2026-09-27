import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import SaleDetailsModal from "../components/SaleDetailsModal.jsx";
import { GridIcon, CalendarIcon } from "../components/icons.jsx";
import { getAccountingSales } from "../api.js";

// Rows come from GET /api/accounting/sales, which merges stays and orders.
//
// A reconciliation page: filter by department, date range and paid status, and
// read the three totals off the strip. A sale is "unpaid" when it went on a
// company account rather than being settled at the point of sale.

const DEPARTMENTS = ["All", "Rooms", "Bar"];
const STATUSES = ["All", "Paid", "Unpaid"];

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function AccountingSales() {
  // Filters can arrive in the URL — the Overview table drills through to here
  // with a department, a status and a month already applied.
  const [params] = useSearchParams();

  const [department, setDepartment] = useState(params.get("department") || "All");
  const [status, setStatus] = useState(params.get("status") || "All");
  const [from, setFrom] = useState(params.get("from") || "2026-08-09");
  const [to, setTo] = useState(params.get("to") || "2026-08-12");

  const [viewing, setViewing] = useState(null);

  // Filtering happens server-side, so the rows we get back ARE the rows to
  // show. `unpaid` is decided by the server too — a sale is unpaid when it went
  // on a corporate tab.
  const [visible, setVisible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const rows = await getAccountingSales({ department, from, to, status });
        if (!cancelled) setVisible(rows);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [department, status, from, to]);

  // The three figures are computed from what's visible, so they always agree
  // with the rows on screen.
  const totals = useMemo(() => {
    let total = 0, paid = 0, unpaid = 0;
    for (const s of visible) {
      total += s.amount;
      if (s.unpaid) unpaid += s.amount;
      else paid += s.amount;
    }
    return { total, paid, unpaid };
  }, [visible]);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title sales-title">Sales</span>
        </header>

        <div className="content">
          {/* Department chips left, date range right */}
          <div className="sales-filters">
            <div className="sales-chips">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  className={d === department ? "sales-chip sales-chip--active" : "sales-chip"}
                  onClick={() => setDepartment(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="sales-dates">
              <label className="sales-date">
                <CalendarIcon size={12} />
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <span className="sales-dates__to">to</span>
              <label className="sales-date">
                <CalendarIcon size={12} />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
          </div>

          {/* Status sub-filter — smaller, visually secondary */}
          <div className="sales-substatus">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={s === status ? "sales-subchip sales-subchip--active" : "sales-subchip"}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Totals — right aligned, matching the design */}
          <div className="sales-stats-wrap">
            <div className="sales-stats">
              <div className="sales-stat">
                <span className="sales-stat__label">Total Sales</span>
                <span className="sales-stat__value">{naira(totals.total)}</span>
              </div>
              <span className="sales-stats__divider" />
              <div className="sales-stat">
                <span className="sales-stat__label">Paid</span>
                <span className="sales-stat__value">{naira(totals.paid)}</span>
              </div>
              <span className="sales-stats__divider" />
              <div className="sales-stat">
                <span className="sales-stat__label">Unpaid</span>
                <span className="sales-stat__value">{naira(totals.unpaid)}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading sales…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>
          ) : (
          <div className="sales-card">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th className="is-right">Amount</th>
                  <th>Status</th>
                  <th className="is-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sales-empty">No sales in this period.</td>
                  </tr>
                ) : (
                  visible.map((s) => {
                    const unpaid = s.unpaid;
                    return (
                      /* Unpaid rows carry a faint red wash so they stand out
                         when scanning for what's owed. */
                      <tr key={s.id} className={unpaid ? "sales-row--unpaid" : ""}>
                        <td>
                          <div className="sales-date-main">{formatDate(s.date)}</div>
                          <div className="sales-date-time">{s.time}</div>
                        </td>
                        <td>
                          <span className="sales-source">{s.source}</span>
                        </td>
                        <td className="sales-desc">{s.description}</td>
                        <td>
                          {/* A company name means it's on a tab — purple. */}
                          <span className={unpaid ? "sales-pay sales-pay--account" : "sales-pay"}>
                            {s.payment}
                          </span>
                        </td>
                        <td className="is-right sales-amount">{naira(s.amount)}</td>
                        <td>
                          <span className={unpaid ? "sales-status sales-status--unpaid" : "sales-status sales-status--paid"}>
                            <span className="sales-status__dot" />
                            {unpaid ? "Unpaid" : "Paid"}
                          </span>
                        </td>
                        <td className="is-center">
                          <button className="sales-view" onClick={() => setViewing(s)}>View</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {viewing && (
        <SaleDetailsModal sale={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}