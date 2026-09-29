import { useState, useEffect } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import {
  getMaintenanceRequests, approveMaintenanceRequest,
  declineMaintenanceRequest, getAcctCategories,
} from "../api.js";

const METHODS = ["Cash", "Transfer", "POS", "Expenses Card"];

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function timeAgo(ts) {
  if (!ts) return "";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? "" : "s"} ago`;
}

// The admin deciding what maintenance may spend.
//
// Approving is what CREATES the expense — the description is built from the
// fault and the reason, so the money and the fault can't drift apart and nobody
// retypes what the report already says.
export default function MaintenanceRequestsModal({ onClose, onChanged }) {
  const [data, setData] = useState({ counts: {}, requests: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Each awaiting card carries its own choices until it's decided.
  const [choices, setChoices] = useState({});

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setData(await getMaintenanceRequests());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    getAcctCategories("expense")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function choiceFor(id) {
    return choices[id] || { categoryId: categories[0]?.id ?? "", method: "Transfer" };
  }
  function setChoice(id, patch) {
    setChoices((prev) => ({ ...prev, [id]: { ...choiceFor(id), ...patch } }));
  }

  async function approve(r) {
    const c = choiceFor(r.id);
    try {
      setBusyId(r.id);
      await approveMaintenanceRequest(r.id, {
        category_id: c.categoryId || null,
        method: c.method,
      });
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      alert(`Couldn't approve: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function decline(r) {
    try {
      setBusyId(r.id);
      await declineMaintenanceRequest(r.id);
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      alert(`Couldn't decline: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  }

  const counts = data.counts || {};
  const awaiting = data.requests.filter((r) => r.status === "Pending");
  const decided = data.requests.filter((r) => r.status !== "Pending");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mr2-card" onClick={(e) => e.stopPropagation()}>
        <div className="mr2-header">
          <div>
            <h2 className="mr2-title">Payment Requests</h2>
            <p className="mr2-subtitle">Maintenance</p>
          </div>
          <button className="sr-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={10} />
          </button>
        </div>

        <div className="mr2-hairline" />

        <div className="mr2-body">
          {/* Where everything stands */}
          <div className="mr2-summary">
            <div className="mr2-metric">
              <span className="mr2-metric__label">Awaiting</span>
              <span className="mr2-metric__value mr2-metric__value--await">
                {counts.Pending || 0}
              </span>
              <span className="mr2-metric__note">Needs a decision</span>
            </div>
            <div className="mr2-metric">
              <span className="mr2-metric__label">Approved</span>
              <span className="mr2-metric__value mr2-metric__value--ok">
                {counts.Approved || 0}
              </span>
              <span className="mr2-metric__note">Expense recorded</span>
            </div>
            <div className="mr2-metric">
              <span className="mr2-metric__label">Declined</span>
              <span className="mr2-metric__value mr2-metric__value--no">
                {counts.Declined || 0}
              </span>
              <span className="mr2-metric__note">No money</span>
            </div>
          </div>

          {/* Awaiting a decision */}
          <div className="mr2-sectionhead">
            <span className="sr-label">Awaiting Decision</span>
            <span className="sr-sectionhead__rule" />
          </div>

          {loading ? (
            <p className="sr-empty sr-empty--pad">Loading…</p>
          ) : error ? (
            <p className="sr-error sr-empty--pad">Unable to fetch: {error}</p>
          ) : awaiting.length === 0 ? (
            <p className="sr-empty sr-empty--pad">No requests waiting.</p>
          ) : (
            awaiting.map((r) => {
              const c = choiceFor(r.id);
              const onCard = c.method === "Expenses Card";
              return (
                <article className="mr2-req" key={r.id}>
                  <div className="mr2-req__top">
                    <span className="mr2-amount">{naira(r.amount)}</span>
                    <span className="mr2-when">{timeAgo(r.createdAt)}</span>
                  </div>

                  <h3 className="mr2-place">{r.place}</h3>
                  <p className="mr2-reason">{r.reason}</p>

                  <div className="mr2-req__rule" />

                  <div className="mr2-fields">
                    <div className="sr-field">
                      <label className="sr-label">Category</label>
                      <div className="sr-select">
                        <select
                          value={c.categoryId}
                          onChange={(e) => setChoice(r.id, { categoryId: Number(e.target.value) })}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <span className="sr-select__chev"><ChevronDownIcon size={12} /></span>
                      </div>
                    </div>

                    <div className="sr-field">
                      <label className="sr-label">Payment Method</label>
                      <div className="sr-select">
                        <select
                          value={c.method}
                          onChange={(e) => setChoice(r.id, { method: e.target.value })}
                        >
                          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="sr-select__chev"><ChevronDownIcon size={12} /></span>
                      </div>
                      {/* Choosing the card means the money hasn't actually
                          left — a consequence a dropdown would otherwise hide. */}
                      <span className={onCard ? "mr2-hint mr2-hint--card" : "mr2-hint"}>
                        <span className="mr2-hint__dot" />
                        {onCard
                          ? "Added to the Expenses Card as unpaid"
                          : "Recorded as paid today"}
                      </span>
                    </div>
                  </div>

                  <div className="mr2-req__foot">
                    <button className="mr2-decline" disabled={busyId === r.id}
                      onClick={() => decline(r)}>
                      Decline
                    </button>
                    <button className="mr2-approve" disabled={busyId === r.id}
                      onClick={() => approve(r)}>
                      {busyId === r.id ? "Working…" : "Approve & Record"}
                    </button>
                  </div>
                </article>
              );
            })
          )}

          {/* Already decided */}
          {decided.length > 0 && (
            <>
              <div className="mr2-sectionhead">
                <span className="sr-label">Decided</span>
                <span className="sr-sectionhead__rule" />
              </div>
              <div className="mr2-history">
                {decided.map((r) => (
                  <div className="mr2-row" key={r.id}>
                    <span className="mr2-row__amount">{naira(r.amount)}</span>
                    <div className="mr2-row__info">
                      <div className="mr2-row__place">{r.place}</div>
                      <div className="mr2-row__reason">{r.reason}</div>
                    </div>
                    <span className={`mr2-badge mr2-badge--${r.status.toLowerCase()}`}>
                      <span className="mr2-badge__dot" />
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mr2-hairline" />

        <div className="sr-footer">
          <button className="sr-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}