import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
import StockDetailsModal from "../components/StockDetailsModal.jsx";
import { GridIcon, CalendarIcon } from "../components/icons.jsx";
import { getStockMovements } from "../api.js";

// Format a timestamp as a short time, e.g. "2:34 PM".
function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
// Format a date the way the design writes it: "10th July, 2026".
function formatLongDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.getDate();
  // 1st, 2nd, 3rd, 4th … 11th–13th are the exceptions.
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  return `${day}${suffix} ${month}, ${d.getFullYear()}`;
}
// A movement id is padded to six digits in the design: #000124.
function movementId(id) {
  return "#" + String(id).padStart(6, "0");
}
// CSS class for the type badge.
function typeClass(direction) {
  return direction === "issue"
    ? "report-pill report-pill--issue"
    : "report-pill report-pill--return";
}

// Today as YYYY-MM-DD, for the date input's default value.
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// History is the store's audit trail: every issue and every return, newest
// first, for one day at a time. Clicking View opens the movement's detail
// popup — same relationship as Bar Report -> Bar Order Details.
export default function StockHistory() {
  const [date, setDate] = useState(todayISO());
  const dateInputRef = useRef(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which movement's detail popup is open (its id), or null.
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getStockMovements(date);
        setMovements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date]);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">History</span>
        </header>

        <div className="content">
          <div className="report-block">
            <h3 className="report-block__title">Daily Stock History</h3>

            {/* Date picker. Clicking the calendar icon opens the native date
                picker via showPicker(); choosing a date refetches the table.
                The input still sits over the row as a fallback for browsers/
                clicks that open it directly. */}
            <div className="stock-date">
              <span className="stock-date__text">{formatLongDate(date)}</span>
              <button
                type="button"
                className="stock-date__icon-btn"
                onClick={() => {
                  const el = dateInputRef.current;
                  if (el?.showPicker) el.showPicker();  // modern browsers
                  else el?.focus();                     // fallback: focus opens it
                }}
                aria-label="Filter by date"
              >
                <CalendarIcon size={20} />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                className="stock-date__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Show stock history for this date"
              />
            </div>

            <div className="report-panel">
              {loading ? (
                <p style={{ padding: "24px", color: "#7b7487" }}>Loading history…</p>
              ) : error ? (
                <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th className="is-left">Time</th>
                      <th className="is-left">Stock ID</th>
                      <th>Type</th>
                      <th className="is-left">To / From</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "20px", color: "#7b7487" }}>
                          No stock movements on this day.
                        </td>
                      </tr>
                    ) : (
                      movements.map((row) => (
                        <tr key={row.id}>
                          <td className="is-left">{formatTime(row.created_at)}</td>
                          <td className="is-left is-id">{movementId(row.id)}</td>
                          <td>
                            <span className={typeClass(row.direction)}>{row.direction}</span>
                          </td>
                          <td className="is-left">{row.party}</td>
                          <td>
                            <button className="report-view-btn" onClick={() => setViewingId(row.id)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movement details popup for the clicked row. */}
      {viewingId && (
        <StockDetailsModal movementId={viewingId} onClose={() => setViewingId(null)} />
      )}
    </div>
  );
}