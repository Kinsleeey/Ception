import { useState, useEffect } from "react";
import ModuleHeader from "../components/ModuleHeader.jsx";
import { useNavigate } from "react-router-dom";
import { getStoreActivity } from "../api.js";

function clockTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function longDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// The store's day: what went out, what came back, what was restocked, and any
// faults. Same shape and print layout as reception's and the bar's sheets.
export default function StoreActivity() {
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState({ stats: {}, events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const d = await getStoreActivity(date);
        if (!cancelled) setData(d);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [date]);

  const stats = data.stats || {};
  const events = data.events || [];

  function Stat({ label, stat }) {
    return (
      <div className="act-stat">
        <span className="act-stat__label">{label}</span>
        <span className="act-stat__value">{stat?.value ?? 0}</span>
        <span className="act-stat__note">{stat?.note ?? ""}</span>
      </div>
    );
  }

  return (
    <div className="room-page act-page">
      <ModuleHeader module="Store" />

      <div className="room-main">
        <div className="act-head">
          <div>
            <h2 className="act-title">Today's Activity</h2>
            <p className="act-date">{longDate(date)}</p>
          </div>

          <div className="act-controls">
            <input
              type="date"
              className="act-datepick"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Show activity for this date"
            />
            <button className="act-print" onClick={() => window.print()}>Print</button>
            <button className="act-back" onClick={() => navigate("/stock/issue")}>Close</button>
          </div>
        </div>

        <div className="act-stats">
          <Stat label="Issued" stat={stats.issued} />
          <span className="act-stats__divider" />
          <Stat label="Returned" stat={stats.returned} />
          <span className="act-stats__divider" />
          <Stat label="Topped Up" stat={stats.toppedUp} />
          <span className="act-stats__divider" />
          <Stat label="Low Stock" stat={stats.lowStock} />
          <span className="act-stats__divider" />
          <Stat label="Issues Reported" stat={stats.issues} />
        </div>

        <div className="act-card">
          <table className="act-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>To / From</th>
                <th>Items</th>
                <th className="is-right">Units</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="act-empty">Loading…</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="act-empty act-error">Unable to fetch: {error}</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6} className="act-empty">Nothing has happened today yet.</td></tr>
              ) : (
                events.map((e, i) => (
                  <tr key={i}>
                    <td className="act-time">{clockTime(e.at)}</td>
                    <td>
                      <span className={`act-ev act-ev--${e.type.toLowerCase().replace(/\s+/g, "-")}`}>
                        <span className="act-ev__dot" />
                        {e.type}
                      </span>
                    </td>
                    <td className="act-room">{e.place}</td>
                    <td className="act-details">{e.details}</td>
                    <td className="is-right act-amount">{e.units ?? ""}</td>
                    <td className="act-staff">{e.staff}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="act-foot">
            <span>{events.length} event{events.length === 1 ? "" : "s"} recorded</span>
            <span>Generated {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        {/* Print only — the handover signatures. */}
        <div className="act-signoff">
          <div className="act-signoff__block">
            <p className="act-signoff__name">OUTGOING STOREKEEPER</p>
            <div className="act-signoff__line" />
            <p className="act-signoff__cap">Signature &amp; date</p>
          </div>
          <div className="act-signoff__block">
            <p className="act-signoff__name">INCOMING STOREKEEPER</p>
            <div className="act-signoff__line" />
            <p className="act-signoff__cap">Signature &amp; date (verified handover)</p>
          </div>
        </div>
      </div>
    </div>
  );
}