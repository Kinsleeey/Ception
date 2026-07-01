import Sidebar from "../components/Sidebar.jsx";
import DataCard from "../components/DataCard.jsx";
import { GridIcon, BedIcon, MoneyIcon, GuestsIcon } from "../components/icons.jsx";
import {
  revenueRows,
  occupancyRows,
  monthlyTargetPercent,
} from "../data/dashboardData.js";

// The three summary cards along the bottom.
const stats = [
  { label: "Occupied Rooms", value: "20", Icon: BedIcon },
  { label: "Current Revenue", value: "₦298,000", Icon: MoneyIcon },
  { label: "Current Guests", value: "156", Icon: GuestsIcon },
];

export default function AdminDashboard() {
  return (
    <div className="dashboard">
      {/* Left navigation */}
      <Sidebar />

      {/* Right side: top bar + scrolling content */}
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
              Welcome back to your daily hotel overview. Here's what's happening
              today.
            </p>
          </div>

          {/* Two data cards, both powered by the same DataCard component */}
          <DataCard
            title="Revenue"
            rows={revenueRows}
            percent={monthlyTargetPercent}
          />
          <DataCard
            title="Occupancy"
            rows={occupancyRows}
            percent={monthlyTargetPercent}
          />

          {/* Summary stat cards */}
          <div className="stat-cards">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-card__icon">
                  <stat.Icon size={22} />
                </div>
                <div className="stat-card__label">{stat.label}</div>
                <div className="stat-card__value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
