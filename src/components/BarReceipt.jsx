import { useEffect, useState } from "react";
import { HOTEL } from "../data/hotelConfig.js";
import { getOrderDetail } from "../api.js";

// An 80mm thermal receipt — what comes out of the POS-style printer at the bar.
//
// It is NOT an A4 page. Thermal printers are one colour with no greys, so
// everything here is pure black on white, separated by rules rather than by
// fills or borders. Monospace throughout, because that's what keeps the
// columns lined up on cheap paper.
//
// Props:
//   orderId  -> the order to print
//   onClose  -> close the preview
//   autoPrint -> open the print dialog as soon as it has loaded
function money(n) {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

export default function BarReceipt({ orderId, onClose, autoPrint = false }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await getOrderDetail(orderId);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [orderId]);

  // Mark the page while a receipt is open. The receipt's print rules hide
  // everything except the strip, and without this flag they would apply to
  // every OTHER print in the app too — blanking the activity sheets.
  useEffect(() => {
    document.body.classList.add("printing-receipt");
    return () => document.body.classList.remove("printing-receipt");
  }, []);

  // Print once the content is actually on screen — printing an empty strip is
  // the classic mistake here.
  useEffect(() => {
    if (autoPrint && order && !loading) {
      const t = setTimeout(() => window.print(), 250);
      return () => clearTimeout(t);
    }
  }, [autoPrint, order, loading]);

  const items = order?.items || [];
  const subtotal = items.reduce(
    (s, i) => s + Number(i.unit_price) * Number(i.quantity), 0
  );
  const vat = Math.round(subtotal * HOTEL.vatRate * 100) / 100;
  const total = subtotal + vat;

  // Receipts are referenced by a human-readable number, not a database id.
  const receiptNo = order
    ? `RCP-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(5, "0")}`
    : "";

  const when = order ? new Date(order.created_at) : null;

  return (
    <div className="rcpt-overlay" onClick={onClose}>
      <div className="rcpt-stage" onClick={(e) => e.stopPropagation()}>
        {/* Screen-only controls — never printed. */}
        <div className="rcpt-bar">
          <span className="rcpt-bar__note">
            <span className="rcpt-bar__dot" />
            80mm thermal receipt · monochrome
          </span>
          <button className="rcpt-bar__print" onClick={() => window.print()}>
            Print Receipt
          </button>
          <button className="rcpt-bar__close" onClick={onClose}>Close</button>
        </div>

        {/* The paper itself. */}
        <div className="rcpt">
          {loading ? (
            <p className="rcpt-center">Loading…</p>
          ) : error ? (
            <p className="rcpt-center">Couldn't load this order: {error}</p>
          ) : (
            <>
              {/* 1. Who */}
              <div className="rcpt-head">
                <div className="rcpt-hotel">{HOTEL.name}</div>
                <div className="rcpt-hotel2">{HOTEL.nameLine2}</div>
                <div className="rcpt-small">{HOTEL.addressLine1}</div>
                <div className="rcpt-small">{HOTEL.addressLine2}</div>
                <div className="rcpt-small">Tel: {HOTEL.phone}</div>
              </div>

              <div className="rcpt-rule rcpt-rule--dashed" />

              {/* 3. Which sale */}
              <div className="rcpt-rows">
                <div className="rcpt-row">
                  <span>Receipt No:</span><span className="rcpt-b">{receiptNo}</span>
                </div>
                <div className="rcpt-row">
                  <span>Date:</span>
                  <span>{when.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
                <div className="rcpt-row">
                  <span>Time:</span>
                  <span>{when.toLocaleTimeString("en-GB", { hour12: false })}</span>
                </div>
                <div className="rcpt-row">
                  <span>Bar / Station:</span><span>{order.bar_location}</span>
                </div>
                <div className="rcpt-row">
                  <span>Served By:</span><span>{order.served_by || "Bar"}</span>
                </div>
              </div>

              <div className="rcpt-rule rcpt-rule--dashed" />

              {/* 5. Column headers */}
              <div className="rcpt-cols">
                <span className="rcpt-b">ITEM / DETAILS</span>
                <span className="rcpt-cols__right">
                  <span className="rcpt-b rcpt-qty">QTY</span>
                  <span className="rcpt-b rcpt-amt">AMOUNT</span>
                </span>
              </div>

              <div className="rcpt-rule" />

              {/* 7. The drinks. Names get their own line — 80mm is too narrow
                     to put a long name and its numbers side by side. */}
              <div className="rcpt-items">
                {items.map((i, n) => (
                  <div className="rcpt-item" key={n}>
                    <div className="rcpt-item__name">{i.name || "Deleted product"}</div>
                    <div className="rcpt-item__line">
                      <span>{i.quantity} x {money(i.unit_price)}</span>
                      <span className="rcpt-b">
                        {money(Number(i.unit_price) * Number(i.quantity))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rcpt-rule rcpt-rule--dashed" />

              {/* 9. Totals */}
              <div className="rcpt-rows">
                <div className="rcpt-row"><span>Subtotal:</span><span>{money(subtotal)}</span></div>
                <div className="rcpt-row">
                  <span>VAT ({(HOTEL.vatRate * 100).toFixed(1)}%):</span>
                  <span>{money(vat)}</span>
                </div>
              </div>

              <div className="rcpt-rule" />

              <div className="rcpt-total">
                <span>TOTAL:</span>
                <span>NGN {money(total)}</span>
              </div>

              <div className="rcpt-rule" />

              {/* 10. How it was paid */}
              <div className="rcpt-rows">
                <div className="rcpt-row">
                  <span>Payment Method:</span>
                  <span className="rcpt-b rcpt-up">{order.payment_method || "—"}</span>
                </div>
                <div className="rcpt-row">
                  <span>Amount Paid:</span><span className="rcpt-b">{money(total)}</span>
                </div>
                <div className="rcpt-row"><span>Change Due:</span><span>0.00</span></div>
              </div>

              <div className="rcpt-rule rcpt-rule--dashed" />

              {/* 12. Footer. The receipt number repeats in the *NNN* form staff
                     read aloud when a customer queries a sale. */}
              <div className="rcpt-foot">
                <div className="rcpt-ref">* {receiptNo} *</div>
                <div className="rcpt-thanks">THANK YOU FOR YOUR PATRONAGE!</div>
                <div className="rcpt-tiny">Please retain receipt for any dispute</div>
                <div className="rcpt-powered">POWERED BY CEPTION</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}