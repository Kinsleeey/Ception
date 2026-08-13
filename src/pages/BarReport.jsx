import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import BarOrderDetails from "./BarOrderDetails.jsx";
import {
  GridIcon, MoneyIcon, ChartIcon, ChevronLeftIcon, ChevronRightIcon,
} from "../components/icons.jsx";
import {
  getReportSummary, getReportOrders, getRevenueByBar,
} from "../api.js";

// Format a number as naira.
function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
// Format a timestamp as a short time, e.g. "2:34 PM".
function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
// CSS class for a payment pill.
function payClass(payment) {
  if (payment === "POS") return "report-pill report-pill--pos";
  return "report-pill report-pill--pay";
}

export default function BarReport() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which order's detail popup is open (its id), or null.
  const [viewingOrderId, setViewingOrderId] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        // Fetch all three in parallel.
        const [s, o, r] = await Promise.all([
          getReportSummary(),
          getReportOrders(20),
          getRevenueByBar(),
        ]);
        setSummary(s);
        setOrders(o);
        setRevenue(r);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Record</span>
        </header>

        <div className="content">
          {/* Greeting */}
          <div className="record-greeting">
            <h2 className="record-greeting__title">Hello, Admin</h2>
            <p className="record-greeting__text">
              Welcome back to your daily hotel overview. Here's what's happening today.
            </p>
          </div>

          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading report…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : (
            <>
              {/* Two summary cards */}
              <div className="record-cards">
                <div className="record-card">
                  <div className="record-card__icon"><MoneyIcon size={24} /></div>
                  <div className="record-card__label">Total Revenue</div>
                  <div className="record-card__value">{naira(summary.total_revenue)}</div>
                </div>
                <div className="record-card">
                  <div className="record-card__icon"><ChartIcon size={22} /></div>
                  <div className="record-card__label">Drinks Sold</div>
                  <div className="record-card__value">{summary.drinks_sold}</div>
                </div>
              </div>

              {/* Table 1: Daily Sales History (real orders) */}
              <div className="report-block">
                <h3 className="report-block__title">Daily Sales History</h3>
                <div className="report-panel">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th className="is-left">Time</th>
                        <th className="is-left">Order ID</th>
                        <th>Bar</th>
                        <th>Payment</th>
                        <th className="is-total">Total</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "20px", color: "#7b7487" }}>
                            No orders yet.
                          </td>
                        </tr>
                      ) : (
                        orders.map((row) => (
                          <tr key={row.id}>
                            <td className="is-left">{formatTime(row.created_at)}</td>
                            <td className="is-left is-id">#{row.id}</td>
                            <td>
                              <span className="report-pill report-pill--bar">{row.bar_location}</span>
                            </td>
                            <td>
                              <span className={payClass(row.payment_method)}>
                                {row.payment_method || "—"}
                              </span>
                            </td>
                            <td className="is-total">{naira(row.total)}</td>
                            <td>
                              <button className="report-view-btn" onClick={() => setViewingOrderId(row.id)}>
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Revenue by bar (real aggregation) */}
              <div className="report-block">
                <h3 className="report-block__title">Revenue</h3>
                <div className="report-panel">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th className="is-left" aria-label="Period" />
                        <th>Bar 1</th>
                        <th>Bar 2</th>
                        <th>Lounge</th>
                        <th className="is-total">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.map((row) => (
                        <tr key={row.period}>
                          <td className="is-left is-id">{row.period}</td>
                          <td>{naira(row.bar1)}</td>
                          <td>{naira(row.bar2)}</td>
                          <td>{naira(row.lounge)}</td>
                          <td className="is-total">{naira(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order details popup for the clicked row. */}
      {viewingOrderId && (
        <BarOrderDetails orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />
      )}
    </div>
  );
}
