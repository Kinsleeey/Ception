import { useState, useEffect } from "react";
import { CloseIcon } from "./icons.jsx";
import { getStockRequests, receiveStockRequest } from "../api.js";

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

// What the bar has asked for and where each request has got to.
//
// Only a DELIVERED request offers "Mark Received" — a pending one has nothing
// to confirm, and a received one is finished. That's the three-step handshake
// made visible.
export default function StockRequestsModal({ barLocation = "Bar 1", onClose, onChanged }) {
  const [data, setData] = useState({ counts: {}, requests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setData(await getStockRequests(barLocation));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [barLocation]);

  async function confirmReceived(id) {
    try {
      setBusyId(id);
      await receiveStockRequest(id);
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      alert(`Couldn't confirm: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  }

  const counts = data.counts || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sr-card sr-card--wide" onClick={(e) => e.stopPropagation()}>
        <div className="sr-header">
          <div>
            <h2 className="sr-title">Stock Requests</h2>
            <p className="sr-subtitle">{barLocation}</p>
          </div>
          <button className="sr-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={10} />
          </button>
        </div>

        <div className="sr-hairline" />

        <div className="sr-scroll">
          {/* Where everything stands */}
          <div className="sr-summary">
            <div className="sr-metric">
              <span className="sr-metric__label">Pending</span>
              <span className="sr-metric__value sr-metric__value--pending">
                {counts.Pending || 0}
              </span>
            </div>
            <span className="sr-summary__divider" />
            <div className="sr-metric">
              <span className="sr-metric__label">Delivered</span>
              <span className="sr-metric__value sr-metric__value--delivered">
                {counts.Delivered || 0}
              </span>
            </div>
            <span className="sr-summary__divider" />
            <div className="sr-metric">
              <span className="sr-metric__label">Received</span>
              <span className="sr-metric__value sr-metric__value--received">
                {counts.Received || 0}
              </span>
            </div>
          </div>

          <div className="sr-sectionhead">
            <span className="sr-label">All Requests</span>
            <span className="sr-sectionhead__rule" />
          </div>

          <div className="sr-requests">
            {loading ? (
              <p className="sr-empty sr-empty--pad">Loading…</p>
            ) : error ? (
              <p className="sr-error sr-empty--pad">Unable to fetch: {error}</p>
            ) : data.requests.length === 0 ? (
              <p className="sr-empty sr-empty--pad">No requests yet.</p>
            ) : (
              data.requests.map((r) => (
                <div className="sr-req" key={r.id}>
                  <div className="sr-req__info">
                    <div className="sr-req__top">
                      <span className="sr-req__name">
                        {r.items.map((i) => i.name).join(", ") || "—"}
                      </span>
                      <span className="sr-req__time">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="sr-req__qty">
                      {r.items.map((i) => `${i.quantity} ${i.unit}`).join(" · ")}
                    </div>
                  </div>

                  <div className="sr-req__right">
                    <span className={`sr-status sr-status--${r.status.toLowerCase()}`}>
                      <span className="sr-status__dot" />
                      {r.status}
                    </span>
                    {/* Only a delivered request has anything to confirm. */}
                    {r.status === "Delivered" && (
                      <button
                        className="sr-receive"
                        disabled={busyId === r.id}
                        onClick={() => confirmReceived(r.id)}
                      >
                        {busyId === r.id ? "Saving…" : "Mark Received"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sr-hairline" />

        <div className="sr-footer">
          <button className="sr-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}