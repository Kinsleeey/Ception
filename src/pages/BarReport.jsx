import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import BarOrderDetails from "./BarOrderDetails.jsx";
import {
  GridIcon, MoneyIcon, ChartIcon, ChevronLeftIcon, ChevronRightIcon,
} from "../components/icons.jsx";
import {
  recordStats, salesHistory, revenueByPeriod, monthlyTargetPct,
} from "../data/barData.js";

// Returns the CSS class for a payment pill based on the method.
function payClass(payment) {
  if (payment === "POS") return "report-pill report-pill--pos";
  return "report-pill report-pill--pay";
}

// Bar Report ("Record") — the admin's bar overview. Two tables: a paginated
// "Daily Sales History" (each row's View opens an order popup over this page)
// and a "Revenue" breakdown by bar with a monthly-target bar.
export default function BarReport() {
  const [viewingOrder, setViewingOrder] = useState(false);

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

          {/* Two summary cards */}
          <div className="record-cards">
            <div className="record-card">
              <div className="record-card__icon"><MoneyIcon size={24} /></div>
              <div className="record-card__label">Current Revenue</div>
              <div className="record-card__value">{recordStats.currentRevenue}</div>
            </div>
            <div className="record-card">
              <div className="record-card__icon"><ChartIcon size={22} /></div>
              <div className="record-card__label">Drinks Sold</div>
              <div className="record-card__value">{recordStats.drinksSold}</div>
            </div>
          </div>

          {/* Table 1: Daily Sales History */}
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
                  {salesHistory.map((row) => (
                    <tr key={row.orderId + row.time}>
                      <td className="is-left">{row.time}</td>
                      <td className="is-left is-id">{row.orderId}</td>
                      <td>
                        <span className="report-pill report-pill--bar">{row.bar}</span>
                      </td>
                      <td>
                        <span className={payClass(row.payment)}>{row.payment}</span>
                      </td>
                      <td className="is-total">{row.total}</td>
                      <td>
                        <button className="report-view-btn" onClick={() => setViewingOrder(true)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination (visual) */}
              <div className="report-pagination">
                <button className="page-btn page-btn--nav" aria-label="Previous page">
                  <ChevronLeftIcon />
                </button>
                <button className="page-btn page-btn--active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <span className="page-btn" style={{ pointerEvents: "none" }}>…</span>
                <button className="page-btn">12</button>
                <button className="page-btn page-btn--nav" aria-label="Next page">
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Table 2: Revenue by bar */}
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
                  {revenueByPeriod.map((row) => (
                    <tr key={row.period}>
                      <td className="is-left is-id">{row.period}</td>
                      <td>{row.bar1}</td>
                      <td>{row.bar2}</td>
                      <td>{row.lounge}</td>
                      <td className="is-total">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Monthly target progress */}
              <div className="target-bar">
                <div className="target-bar__track">
                  <div className="target-bar__fill" style={{ width: `${monthlyTargetPct}%` }} />
                </div>
                <div className="target-bar__row">
                  <span className="target-bar__label">Monthly Target</span>
                  <span className="target-bar__label">{monthlyTargetPct}% Achieved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order details popup renders over this page (blurred behind it). */}
      {viewingOrder && <BarOrderDetails onClose={() => setViewingOrder(false)} />}
    </div>
  );
}
