import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import DataCard from "../components/DataCard.jsx";
import { GridIcon, BedIcon, MoneyIcon, GuestsIcon } from "../components/icons.jsx";
import {
  getDashboardStats, getRevenueByCategory, getOccupancyByCategory,
} from "../api.js";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueRows, setRevenueRows] = useState([]);
  const [occupancyRows, setOccupancyRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        const [s, rev, occ] = await Promise.all([
          getDashboardStats(),
          getRevenueByCategory(),
          getOccupancyByCategory(),
        ]);
        setStats(s);
        setRevenueRows(rev);
        setOccupancyRows(occ);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // The three summary cards (active-rooms-only figures).
  const summaryCards = stats
    ? [
        { label: "Occupied Rooms", value: String(stats.occupied_rooms), Icon: BedIcon },
        { label: "Current Revenue", value: naira(stats.current_revenue), Icon: MoneyIcon },
        { label: "Current Guests", value: String(stats.current_guests), Icon: GuestsIcon },
      ]
    : [];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Dashboard</span>
        </header>

        <div className="content">
          {/* Greeting */}
          <div className="greeting">
            <h2 className="greeting__title">Hello, Admin</h2>
            <p className="greeting__text">
              Welcome back to your daily hotel overview. Here's what's happening today.
            </p>
          </div>

          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading dashboard…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
          ) : (
            <>
              {/* Two data cards (rooms only). Monthly-target bar left as-is. */}
              <DataCard title="Revenue" rows={revenueRows}  />
              <DataCard title="Occupancy" rows={occupancyRows}  />

              {/* Summary stat cards */}
              <div className="stat-cards">
                {summaryCards.map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <div className="stat-card__icon">
                      <stat.Icon size={22} />
                    </div>
                    <div className="stat-card__label">{stat.label}</div>
                    <div className="stat-card__value">{stat.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}