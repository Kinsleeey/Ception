import { CloseIcon } from "./icons.jsx";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// The read-only record behind one sale, opened by View on the Sales table.
// Room sales and bar/store sales carry different detail, so the middle section
// changes with the source.
export default function SaleDetailsModal({ sale, onClose }) {
  // The server decides this: a sale is unpaid when it went on a corporate tab.
  const unpaid = sale.unpaid;
  const isRoom = sale.source === "Rooms";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "24px" }}>
            Sale Details
            <span className={unpaid ? "sales-status sales-status--unpaid" : "sales-status sales-status--paid"}
              style={{ marginLeft: 12 }}>
              <span className="sales-status__dot" />
              {unpaid ? "Unpaid" : "Paid"}
            </span>
          </h2>
          <div className="modal-subtitle">
            <span>
              #{String(sale.id).padStart(6, "0")} · {sale.source} · {formatDate(sale.date)}, {sale.time}
            </span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="modal-body">
          {/* Summary strip */}
          <div className="order-summary">
            <div className="order-summary__item">
              <div className="order-summary__label">Source</div>
              <div className="order-summary__value">{sale.source}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Payment</div>
              <div className="order-summary__value" style={{ fontSize: "14px" }}>{sale.payment}</div>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__item">
              <div className="order-summary__label">Amount</div>
              <div className="order-summary__value">{naira(sale.amount)}</div>
            </div>
          </div>

          {/* Details. A room sale carries the stay facts; bar and store sales
              just have the description. */}
          <div>
            <div className="section-divider" style={{ marginBottom: "12px" }}>
              <span className="section-divider__label">Details</span>
              <span className="section-divider__line" />
            </div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-row__label">Description</span>
                <span className="detail-row__value">{sale.description}</span>
              </div>
              {isRoom && (
                <>
                  <div className="detail-row">
                    <span className="detail-row__label">Room</span>
                    <span className="detail-row__value">{sale.room}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-row__label">Nights</span>
                    <span className="detail-row__value">{sale.nights}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-row__label">Check-in</span>
                    <span className="detail-row__value">{formatDate(sale.checkIn)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-row__label">Check-out</span>
                    <span className="detail-row__value">{formatDate(sale.checkOut)}</span>
                  </div>
                </>
              )}
              <div className="detail-row">
                <span className="detail-row__label">Date</span>
                <span className="detail-row__value">{formatDate(sale.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Time</span>
                <span className="detail-row__value">{sale.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Payment Method</span>
                <span className="detail-row__value">{sale.payment}</span>
              </div>
            </div>
          </div>

          {/* Who stayed. Only room sales have guests — the primary guest first,
              then any co-guests. Uses the same card as Booking Details. */}
          {isRoom && sale.guests?.length > 0 && (
            <div>
              <div className="section-divider" style={{ marginBottom: "12px" }}>
                <span className="section-divider__label">Guest Details</span>
                <span className="section-divider__line" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sale.guests.map((g, i) => (
                  <div className="cg-card" key={i}>
                    <div className="cg-card__top">
                      <span className="cg-card__tag">
                        {i === 0 ? "Guest 1" : `Co-guest ${i}`}
                      </span>
                    </div>
                    <div className="cg-card__grid">
                      <div className="cg-card__col">
                        <div>
                          <div className="cg-field__label">Full Name</div>
                          <div className="cg-field__value">{g.name}</div>
                        </div>
                        <div>
                          <div className="cg-field__label">Email</div>
                          <div className="cg-field__value">{g.email || "—"}</div>
                        </div>
                      </div>
                      <div className="cg-card__col">
                        <div>
                          <div className="cg-field__label">Phone Number</div>
                          <div className="cg-field__value">{g.phone || "—"}</div>
                        </div>
                        <div>
                          <div className="cg-field__label">Address</div>
                          <div className="cg-field__value">{g.address || "—"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Where the money sits. An unpaid sale is money owed on a tab. */}
          {unpaid && (
            <div>
              <div className="section-divider" style={{ marginBottom: "12px" }}>
                <span className="section-divider__label">Outstanding</span>
                <span className="section-divider__line" />
              </div>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-row__label">Owed by</span>
                  <span className="detail-row__value">{sale.payment}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__label">Amount owed</span>
                  <span className="detail-row__value sales-amount">{naira(sale.amount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}