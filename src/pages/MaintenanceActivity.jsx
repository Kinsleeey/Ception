import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModuleHeader from "../components/ModuleHeader.jsx";
import { getIssues, getMaintenanceRequests } from "../api.js";

function naira(n) {
  return n ? "₦" + Number(n).toLocaleString() : "";
}
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
function onDate(ts, iso) {
  if (!ts) return false;
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === iso;
}

// Maintenance's day: faults that came in, money asked for, money decided, and
// what got fixed.
//
// No new endpoint — it reads the same two lists the queue does and keeps the
// ones that happened on the chosen day. Fewer moving parts than a bespoke
// route, and it can't disagree with the queue.
export default function MaintenanceActivity() {
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [issues, setIssues] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [iss, reqs] = await Promise.all([getIssues(), getMaintenanceRequests()]);
        if (!cancelled) {
          setIssues(iss.issues || []);
          setRequests(reqs.requests || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const reported = issues.filter((i) => onDate(i.createdAt, date));
  // A fault reported last week and fixed today is TODAY's event. Filtering
  // only on createdAt is why yesterday's fault never appeared once resolved.
  const resolved = issues.filter((i) => i.resolvedAt && onDate(i.resolvedAt, date));
  const asked = requests.filter((r) => onDate(r.createdAt, date));
  const decided = requests.filter(
    (r) => r.status !== "Pending" && onDate(r.decidedAt || r.createdAt, date)
  );

  const events = [
    ...reported.map((i) => ({
      type: "Reported", at: i.createdAt, place: i.place,
      details: `${i.issue} · ${i.priority}`, amount: null, who: i.department,
    })),
    ...asked.map((r) => ({
      type: "Requested", at: r.createdAt, place: r.place,
      details: r.reason, amount: r.amount, who: "Maintenance",
    })),
    ...decided.map((r) => ({
      type: r.status === "Approved" ? "Approved" : "Declined",
      at: r.decidedAt || r.createdAt, place: r.place,
      details: r.reason, amount: r.amount, who: r.decidedBy || "Admin",
    })),
    ...resolved.map((i) => ({
      type: "Resolved", at: i.resolvedAt, place: i.place,
      details: i.issue, amount: null, who: "Maintenance",
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  const approvedTotal = decided
    .filter((r) => r.status === "Approved")
    .reduce((s, r) => s + r.amount, 0);

  function Stat({ label, value, note }) {
    return (
      <div className="act-stat">
        <span className="act-stat__label">{label}</span>
        <span className="act-stat__value">{value}</span>
        <span className="act-stat__note">{note}</span>
      </div>
    );
  }

  return (
    <div className="room-page act-page">
      <ModuleHeader module="Maintenance" />

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
            <button className="act-back" onClick={() => navigate("/maintenance")}>Close</button>
          </div>
        </div>

        <div className="act-stats">
          <Stat label="Reported" value={reported.length} note="new faults" />
          <span className="act-stats__divider" />
          <Stat label="Money Asked" value={asked.length} note="requests raised" />
          <span className="act-stats__divider" />
          <Stat label="Approved" value={naira(approvedTotal) || "₦0"} note="released today" />
          <span className="act-stats__divider" />
          <Stat
            label="Still Open"
            value={issues.filter((i) => i.status !== "Resolved").length}
            note="across the hotel"
          />
        </div>

        <div className="act-card">
          <table className="act-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Where</th>
                <th>Details</th>
                <th className="is-right">Amount</th>
                <th>Who</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="act-empty">Loading…</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="act-empty act-error">Unable to fetch: {error}</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6} className="act-empty">Nothing happened on this day.</td></tr>
              ) : (
                events.map((e, i) => (
                  <tr key={i}>
                    <td className="act-time">{clockTime(e.at)}</td>
                    <td>
                      <span className={`act-ev act-ev--${e.type.toLowerCase()}`}>
                        <span className="act-ev__dot" />
                        {e.type}
                      </span>
                    </td>
                    <td className="act-room">{e.place}</td>
                    <td className="act-details">{e.details}</td>
                    <td className="is-right act-amount">{naira(e.amount)}</td>
                    <td className="act-staff">{e.who}</td>
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

        <div className="act-signoff">
          <div className="act-signoff__block">
            <p className="act-signoff__name">OUTGOING OFFICER</p>
            <div className="act-signoff__line" />
            <p className="act-signoff__cap">Signature &amp; date</p>
          </div>
          <div className="act-signoff__block">
            <p className="act-signoff__name">INCOMING OFFICER</p>
            <div className="act-signoff__line" />
            <p className="act-signoff__cap">Signature &amp; date (verified handover)</p>
          </div>
        </div>
      </div>
    </div>
  );
}