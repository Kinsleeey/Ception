import { useState, useEffect } from "react";
import { CloseIcon } from "./icons.jsx";
import { getIssues } from "../api.js";

// How long ago, in words — "10 mins ago", "2 hours ago".
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

// Reports and where they've got to.
//
// NOTE: with no login the server can't tell who reported what, so this shows
// ALL reports rather than one person's.
//
// `department` scopes it — reception sees reception's faults, the bar sees the
// bar's. `place` is whatever identifies the spot: a room number here, a bar
// name there.
export default function MyReportsModal({ department = "Reception", onClose }) {
  const [data, setData] = useState({ counts: {}, issues: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getIssues(department)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [department]);

  const counts = data.counts || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card mr-card" onClick={(e) => e.stopPropagation()}>
        <div className="ri-header">
          <div>
            <h2 className="mr-title">Reports</h2>
            <p className="ri-subtitle">Reception</p>
          </div>
          <button className="rd-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={11} />
          </button>
        </div>

        <div className="ri-rule" />

        {/* Where everything stands */}
        <div className="mr-summary">
          <div className="mr-stat">
            <span className="mr-stat__label">Open</span>
            <span className="mr-stat__value mr-stat__value--open">
              {counts["Received"] || 0}
            </span>
          </div>
          <span className="mr-summary__divider" />
          <div className="mr-stat">
            <span className="mr-stat__label">In Progress</span>
            <span className="mr-stat__value mr-stat__value--progress">
              {counts["In Progress"] || 0}
            </span>
          </div>
          <span className="mr-summary__divider" />
          <div className="mr-stat">
            <span className="mr-stat__label">Resolved</span>
            <span className="mr-stat__value mr-stat__value--resolved">
              {counts["Resolved"] || 0}
            </span>
          </div>
        </div>

        <div className="mr-section">
          <span className="mr-section__label">All Reports</span>
        </div>
        <div className="mr-section__rule" />

        <div className="mr-list">
          {loading ? (
            <p className="rd-muted mr-empty">Loading reports…</p>
          ) : error ? (
            <p className="rd-error mr-empty">Unable to fetch: {error}</p>
          ) : data.issues.length === 0 ? (
            <p className="rd-muted mr-empty">Nothing has been reported yet.</p>
          ) : (
            data.issues.map((i) => (
              <div className="mr-row" key={i.id}>
                <div className="mr-row__info">
                  <div className="mr-row__top">
                    <span className="mr-room">{i.place}</span>
                    <span className={`mr-pri mr-pri--${i.priority.toLowerCase()}`}>
                      {i.priority}
                    </span>
                    <span className="mr-time">{timeAgo(i.createdAt)}</span>
                  </div>
                  <p className="mr-issue">{i.issue}</p>
                </div>
                <span
                  className={`mr-status mr-status--${i.status.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="mr-status__dot" />
                  {i.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="ri-footer mr-footer">
          <button className="rd-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}