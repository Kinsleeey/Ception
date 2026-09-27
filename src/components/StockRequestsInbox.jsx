import { useState, useEffect } from "react";
import { CloseIcon } from "./icons.jsx";
import { getStockRequests, deliverStockRequest } from "../api.js";

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

// The store's side of stock requests: what every bar has asked for, and the
// button that sends it.
//
// Granting is the moment stock actually leaves — it writes a normal stock
// movement (an issue to that bar) and drops the quantities. So the button only
// appears on Pending rows; once granted the goods are gone and the bar's
// confirmation is the only thing left.
export default function StockRequestsInbox({ onClose, onChanged }) {
  const [data, setData] = useState({ counts: {}, requests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      // No bar filter — the store sees every bar's asks.
      setData(await getStockRequests());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function grant(id) {
    try {
      setBusyId(id);
      await deliverStockRequest(id);
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      // The commonest failure is asking for more than the store holds, and the
      // server says exactly how much is left — worth showing verbatim.
      alert(`Couldn't grant this request:\n\n${err.message}`);
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
            <p className="sr-subtitle">From the bars</p>
          </div>
          <button className="sr-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={10} />
          </button>
        </div>

        <div className="sr-hairline" />

        <div className="sr-scroll">
          <div className="sr-summary">
            <div className="sr-metric">
              <span className="sr-metric__label">Awaiting</span>
              <span className="sr-metric__value sr-metric__value--pending">
                {counts.Pending || 0}
              </span>
            </div>
            <span className="sr-summary__divider" />
            <div className="sr-metric">
              <span className="sr-metric__label">Sent</span>
              <span className="sr-metric__value sr-metric__value--delivered">
                {counts.Delivered || 0}
              </span>
            </div>
            <span className="sr-summary__divider" />
            <div className="sr-metric">
              <span className="sr-metric__label">Confirmed</span>
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
              <p className="sr-empty sr-empty--pad">No requests from the bars yet.</p>
            ) : (
              data.requests.map((r) => (
                <div className="sr-req" key={r.id}>
                  <div className="sr-req__info">
                    <div className="sr-req__top">
                      {/* Which bar asked matters here — the bar's own view
                          doesn't need it, the store's does. */}
                      <span className="sr-req__bar">{r.barLocation}</span>
                      <span className="sr-req__time">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="sr-req__items">
                      {r.items.map((i) => `${i.name} — ${i.quantity} ${i.unit}`).join(" · ")}
                    </div>
                    {r.note && <div className="sr-req__note">“{r.note}”</div>}
                  </div>

                  <div className="sr-req__right">
                    <span className={`sr-status sr-status--${r.status.toLowerCase()}`}>
                      <span className="sr-status__dot" />
                      {r.status}
                    </span>
                    {/* Granting is what moves the stock, so it's offered once
                        and only while the request is still pending. */}
                    {r.status === "Pending" && (
                      <button
                        className="sr-receive"
                        disabled={busyId === r.id}
                        onClick={() => grant(r.id)}
                      >
                        {busyId === r.id ? "Sending…" : "Grant & Send"}
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