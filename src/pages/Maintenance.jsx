import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ModuleHeader from "../components/ModuleHeader.jsx";
import RequestPaymentModal from "../components/RequestPaymentModal.jsx";
import { getIssues, updateIssueStatus, getMaintenanceRequests } from "../api.js";

const DEPARTMENTS = ["All", "Reception", "Bar", "Store"];
const PRIORITIES = ["All", "High", "Medium", "Low"];

function timeAgo(ts) {
  if (!ts) return "";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
}

// Every fault reported across the hotel, worst first.
//
// Cards rather than a table: a fault needs room for its description and two
// actions, which a table row can't give it without becoming unreadable.
export default function Maintenance() {
  const [issues, setIssues] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [department, setDepartment] = useState("All");
  const [priority, setPriority] = useState("All");

  const [requesting, setRequesting] = useState(null);   // the fault being funded

  async function load() {
    try {
      setLoading(true);
      setError(null);
      // Every department's faults, plus the money asked for against them.
      const [iss, reqs] = await Promise.all([
        getIssues(),
        getMaintenanceRequests(),
      ]);
      setIssues(iss.issues || []);
      setRequests(reqs.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // What's been asked for or approved against each fault.
  const moneyByIssue = useMemo(() => {
    const map = {};
    for (const r of requests) {
      const m = map[r.issueId] || { pending: 0, approved: 0, declined: 0 };
      if (r.status === "Pending") m.pending += r.amount;
      if (r.status === "Approved") m.approved += r.amount;
      // Only count a refusal the ADMIN made. A request closed automatically
      // because the fault was resolved isn't a refusal, and labelling it one
      // would be misleading.
      if (r.status === "Declined" && !/resolved/i.test(r.decidedBy || "")) {
        m.declined += r.amount;
      }
      map[r.issueId] = m;
    }
    return map;
  }, [requests]);

  const visible = useMemo(() => {
    const rank = { High: 0, Medium: 1, Low: 2 };
    return issues
      .filter((i) => department === "All" || i.department === department)
      .filter((i) => priority === "All" || i.priority === priority)
      // Worst first, then oldest — the two things that decide what to do next.
      .sort((a, b) => {
        if (a.status === "Resolved" && b.status !== "Resolved") return 1;
        if (b.status === "Resolved" && a.status !== "Resolved") return -1;
        const p = rank[a.priority] - rank[b.priority];
        if (p !== 0) return p;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
  }, [issues, department, priority]);

  const stats = useMemo(() => {
    const open = issues.filter((i) => i.status === "Received").length;
    const inProgress = issues.filter((i) => i.status === "In Progress").length;
    const high = issues.filter((i) => i.priority === "High" && i.status !== "Resolved").length;
    const awaiting = requests.filter((r) => r.status === "Pending").length;
    const resolvedToday = issues.filter(
      (i) => i.status === "Resolved" && isToday(i.createdAt)
    ).length;
    return { open, inProgress, high, awaiting, resolvedToday };
  }, [issues, requests]);

  async function resolve(id) {
    try {
      await updateIssueStatus(id, "Resolved");
      await load();
    } catch (err) {
      alert(`Couldn't resolve: ${err.message}`);
    }
  }

  return (
    <div className="mt-page">
      <ModuleHeader module="Maintenance">
        <Link className="room-action-link" to="/maintenance-activity">
          Today's Activity
        </Link>
      </ModuleHeader>

      <div className="mt-main">
        <div className="mt-head">
          <div>
            <h1 className="mt-title">Reported Faults &amp; Incidents</h1>
            <p className="mt-sub">Sorted by severity, then by how long they've waited</p>
          </div>
          <span className="mt-live">
            <span className="mt-live__dot" />
            Live across every department
          </span>
        </div>

        {/* The five figures */}
        <div className="mt-stats">
          <div className="mt-stat">
            <span className="mt-stat__label">Open</span>
            <span className="mt-stat__value mt-stat__value--open">
              {String(stats.open).padStart(2, "0")}
            </span>
            <span className="mt-stat__note">Nobody has started</span>
          </div>
          <div className="mt-stat">
            <span className="mt-stat__label">In Progress</span>
            <span className="mt-stat__value mt-stat__value--progress">
              {String(stats.inProgress).padStart(2, "0")}
            </span>
            <span className="mt-stat__note">Work under way</span>
          </div>
          <div className="mt-stat">
            <span className="mt-stat__label">High Priority</span>
            <span className="mt-stat__value mt-stat__value--high">
              {String(stats.high).padStart(2, "0")}
            </span>
            <span className="mt-stat__note">Guest-facing impact</span>
          </div>
          <div className="mt-stat">
            <span className="mt-stat__label">Awaiting Payment</span>
            <span className="mt-stat__value mt-stat__value--open">
              {String(stats.awaiting).padStart(2, "0")}
            </span>
            <span className="mt-stat__note">With the admin</span>
          </div>
          <div className="mt-stat">
            <span className="mt-stat__label">Resolved Today</span>
            <span className="mt-stat__value mt-stat__value--resolved">
              {String(stats.resolvedToday).padStart(2, "0")}
            </span>
            <span className="mt-stat__note">Closed out</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-filters">
          <div className="mt-filtergroup">
            <span className="mt-filterlabel">Department:</span>
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                className={d === department ? "mt-chip mt-chip--on" : "mt-chip"}
                onClick={() => setDepartment(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="mt-filtergroup">
            <span className="mt-filterlabel">Priority:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                className={p === priority ? "mt-sub-chip mt-sub-chip--on" : "mt-sub-chip"}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* The faults */}
        <div className="mt-list">
          {loading ? (
            <p className="mt-empty">Loading faults…</p>
          ) : error ? (
            <p className="mt-empty mt-empty--error">Unable to fetch: {error}</p>
          ) : visible.length === 0 ? (
            <div className="mt-emptycard">
              <p className="mt-emptycard__text">Nothing reported — everything's working.</p>
            </div>
          ) : (
            visible.map((f) => {
              const money = moneyByIssue[f.id] || { pending: 0, approved: 0, declined: 0 };
              const resolved = f.status === "Resolved";

              return (
                <article className={resolved ? "mt-card mt-card--done" : "mt-card"} key={f.id}>
                  <div className="mt-card__top">
                    <div className="mt-card__where">
                      <span className={resolved ? "mt-place mt-place--done" : "mt-place"}>
                        {f.place}
                      </span>
                      <span className={resolved ? "mt-tag mt-tag--muted" : "mt-tag mt-tag--dept"}>
                        {f.department}
                      </span>
                      <span className={
                        resolved ? "mt-tag mt-tag--muted"
                                 : `mt-tag mt-tag--${f.priority.toLowerCase()}`
                      }>
                        {!resolved && f.priority === "High" && <span className="mt-tag__dot" />}
                        {!resolved && f.priority === "Medium" && <span className="mt-tag__dot" />}
                        {f.priority === "High" ? "High Priority" : f.priority}
                      </span>
                    </div>
                    <span className="mt-card__when">{timeAgo(f.createdAt)}</span>
                  </div>

                  <p className="mt-card__desc">{f.issue}</p>

                  <div className="mt-card__rule" />

                  <div className="mt-card__foot">
                    <div className="mt-card__state">
                      <span className={`mt-status mt-status--${f.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        <span className="mt-status__dot" />
                        {f.status}
                      </span>
                      {money.approved > 0 && (
                        <span className="mt-money">{naira(money.approved)} approved</span>
                      )}
                      {money.declined > 0 && (
                        <span className="mt-money mt-money--declined">
                          Payment request rejected
                        </span>
                      )}
                    </div>

                    {!resolved && (
                      <div className="mt-card__actions">
                        {money.pending > 0 ? (
                          // Nothing to do but wait — asking twice while the
                          // admin is deciding helps nobody.
                          <span className="mt-waiting">
                            Payment requested — awaiting admin
                          </span>
                        ) : (
                          <button className="mt-btn-outline" onClick={() => setRequesting(f)}>
                            Request Payment
                          </button>
                        )}
                        <button className="mt-btn-solid" onClick={() => resolve(f.id)}>
                          Mark Resolved
                        </button>
                      </div>
                    )}
                    {resolved && <span className="mt-closed">Closed</span>}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {requesting && (
        <RequestPaymentModal
          fault={requesting}
          onClose={() => setRequesting(null)}
          onSaved={async () => { setRequesting(null); await load(); }}
        />
      )}
    </div>
  );
}