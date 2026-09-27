import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import CashMovementModal from "../components/CashMovementModal.jsx";
import { GridIcon, ChevronDownIcon, CalendarIcon } from "../components/icons.jsx";
import { CASH_TYPES } from "../data/cashData.js";
import { getCashMovements } from "../api.js";

// A cashbook: every movement in and out, newest first, with a running balance.
// The Type dropdown's options depend on Direction — cash-in and cash-out have
// entirely different kinds of movement.

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
// Money in is green and prefixed +, money out red and prefixed −.
function signedNaira(direction, n) {
  return (direction === "in" ? "+₦" : "−₦") + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function AccountingCash() {
  // The Overview drills through to here with a direction, a type and a month.
  const [params] = useSearchParams();

  const [direction, setDirection] = useState(params.get("direction") || "All");
  // The Overview links here with ?kind=… (the server's name for it). Accept
  // ?type= too, so an older bookmarked URL still works.
  const [type, setType] = useState(params.get("kind") || params.get("type") || "All");
  // Default to the current month so today's movements are visible on arrival.
  const [from, setFrom] = useState(
    params.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(
    params.get("to") || new Date().toISOString().slice(0, 10)
  );

  const [viewing, setViewing] = useState(null);

  // Type options follow Direction. With "All" selected, every type is offered.
  const typeOptions = useMemo(() => {
    if (direction === "in") return CASH_TYPES.in;
    if (direction === "out") return CASH_TYPES.out;
    return [...CASH_TYPES.in, ...CASH_TYPES.out];
  }, [direction]);

  // Changing direction can strand the chosen type, so reset it.
  function changeDirection(d) {
    setDirection(d);
    setType("All");
  }

  // The server filters AND computes the running balance — the balance is summed
  // over every movement, then the filter is applied, so it stays meaningful.
  const [visible, setVisible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const rows = await getCashMovements({ direction, kind: type, from, to });
        if (!cancelled) setVisible(rows);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [direction, type, from, to]);

  // The three figures reflect exactly what's on screen.
  const totals = useMemo(() => {
    let cashIn = 0, cashOut = 0;
    for (const m of visible) {
      if (m.direction === "in") cashIn += m.amount;
      else cashOut += m.amount;
    }
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [visible]);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title sales-title">Cash</span>
        </header>

        <div className="content">
          {/* Filters: two dependent dropdowns, then the date range */}
          <div className="cash-filters">
            <div className="cash-field">
              <label className="cash-field__label" htmlFor="cash-direction">Direction</label>
              <div className="cash-select">
                <select
                  id="cash-direction"
                  value={direction}
                  onChange={(e) => changeDirection(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="in">Cash-in</option>
                  <option value="out">Cash-out</option>
                </select>
                <span className="cash-select__chevron"><ChevronDownIcon size={14} /></span>
              </div>
            </div>

            <div className="cash-field">
              <label className="cash-field__label" htmlFor="cash-type">Type</label>
              <div className="cash-select">
                <select id="cash-type" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="All">All</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="cash-select__chevron"><ChevronDownIcon size={14} /></span>
              </div>
            </div>

            <span className="cash-filters__divider" />

            <div className="cash-field">
              <label className="cash-field__label" htmlFor="cash-from">From</label>
              <div className="cash-dateinput">
                <input id="cash-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <span className="cash-dateinput__icon"><CalendarIcon size={14} /></span>
              </div>
            </div>

            <div className="cash-field">
              <label className="cash-field__label" htmlFor="cash-to">To</label>
              <div className="cash-dateinput">
                <input id="cash-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                <span className="cash-dateinput__icon"><CalendarIcon size={14} /></span>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="sales-stats-wrap">
            <div className="sales-stats">
              <div className="sales-stat">
                <span className="sales-stat__label">Cash In</span>
                <span className="sales-stat__value cash-in">{naira(totals.cashIn)}</span>
              </div>
              <span className="sales-stats__divider" />
              <div className="sales-stat">
                <span className="sales-stat__label">Cash Out</span>
                <span className="sales-stat__value cash-out">{naira(totals.cashOut)}</span>
              </div>
              <span className="sales-stats__divider" />
              <div className="sales-stat">
                <span className="sales-stat__label">Net</span>
                <span className="sales-stat__value">{naira(totals.net)}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading cash movements…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>
          ) : (
          <div className="sales-card">
            <table className="cash-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Method</th>
                  <th className="is-right">Amount</th>
                  <th className="is-right">Balance</th>
                  <th className="is-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sales-empty">No cash movements in this period.</td>
                  </tr>
                ) : (
                  visible.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="sales-date-main">{formatDate(m.date)}</div>
                        <div className="cash-time">{m.time}</div>
                      </td>
                      <td>
                        {/* Tinted by direction so in/out reads at a glance. */}
                        <span className={`cash-type cash-type--${m.direction}`}>{m.type}</span>
                      </td>
                      <td className="cash-desc">{m.description}</td>
                      <td><span className="cash-method">{m.method}</span></td>
                      <td className={`is-right cash-amount cash-${m.direction}`}>
                        {signedNaira(m.direction, m.amount)}
                      </td>
                      <td className="is-right cash-balance">{naira(m.balance)}</td>
                      <td className="is-right">
                        <button className="sales-view" onClick={() => setViewing(m)}>View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {viewing && (
        <CashMovementModal movement={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}