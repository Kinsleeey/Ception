import { useState, useEffect } from "react";
import { CloseIcon } from "./icons.jsx";
import { getStockMovementDetail } from "../api.js";

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
function movementId(id) {
  return "#" + String(id).padStart(6, "0");
}

// Stock Details fetches a single movement (by id) and shows who it went to or
// came from, who recorded it, and the lines it moved. Opened from the History
// table. Mirrors BarOrderDetails.
//
// Props:
//   movementId -> which movement to load
//   onClose    -> close the popup
export default function StockDetailsModal({ movementId: id, onClose }) {
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getStockMovementDetail(id);
        if (!cancelled) setMovement(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const items = movement?.items || [];
  const isIssue = movement?.direction === "issue";

  // The strip and the section heading both flip wording with the direction.
  const partyLabel = isIssue ? "To" : "From";
  const staffLabel = isIssue ? "Issued by" : "Received by";
  const sectionLabel = isIssue ? "Stock Issued" : "Stock Returned";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>Stock Details</h2>
          <div className="modal-subtitle">
            {movement
              ? <span>{movementId(movement.id)} · {movement.party} · {formatTime(movement.created_at)}</span>
              : <span>Movement</span>}
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading movement…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : (
            <>
              {/* Summary strip */}
              <div className="order-summary">
                <div className="order-summary__item">
                  <div className="order-summary__label">Items</div>
                  <div className="order-summary__value">{items.length}</div>
                </div>
                <div className="order-summary__divider" />
                <div className="order-summary__item">
                  <div className="order-summary__label">{partyLabel}</div>
                  <div className="order-summary__value">{movement.party}</div>
                </div>
                <div className="order-summary__divider" />
                <div className="order-summary__item">
                  <div className="order-summary__label">{staffLabel}</div>
                  <div className="order-summary__value">{movement.staff_name || "—"}</div>
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="section-divider" style={{ marginBottom: "12px" }}>
                  <span className="section-divider__label">{sectionLabel}</span>
                  <span className="section-divider__line" />
                </div>
                <div className="stock-lines">
                  {items.map((item, i) => (
                    <div className="stock-line" key={i}>
                      <span className="stock-line__name">
                        {item.name || "Deleted item"}
                      </span>
                      <span className="stock-line__box">{item.quantity}</span>
                      <span className="stock-line__box stock-line__box--unit">{item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
