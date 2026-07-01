import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import GuestDetailsModal from "../components/GuestDetailsModal.jsx";
import {
  GridIcon, SearchIcon, GuestsIcon, MoneyIcon, ChevronLeftIcon, ChevronRightIcon,
} from "../components/icons.jsx";
import { guests, guestStats } from "../data/guestsData.js";

// The three summary cards at the top.
const stats = [
  { label: "Total Guest", value: guestStats.total, Icon: GuestsIcon },
  { label: "Total Revenue", value: guestStats.totalRevenue, Icon: MoneyIcon },
  { label: "Top Spender", value: guestStats.topSpender, Icon: GuestsIcon },
];

export default function GuestDatabase() {
  // The guest currently shown in the View popup (null = closed).
  const [viewing, setViewing] = useState(null);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Guest Database</span>
        </header>

        <div className="content">
          {/* Summary cards (reusing the dashboard stat-card style) */}
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

          {/* Search */}
          <div className="search search--wide">
            <span className="search__icon">
              <SearchIcon size={18} />
            </span>
            <input className="search__input" type="text" placeholder="Search guest..." />
          </div>

          {/* Leaderboard table. On narrow screens it scrolls sideways inside
              this wrapper rather than breaking the layout. */}
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table className="leaderboard">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Guest</th>
                  <th className="is-revenue">Total Revenue ↓</th>
                  <th className="is-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => {
                  const isTop3 = guest.rank <= 3;
                  return (
                    <tr key={guest.rank}>
                      <td>
                        <span className={isTop3 ? "rank-num" : "rank-num rank-num--muted"}>
                          {guest.rank}
                        </span>
                      </td>
                      <td>
                        <div className="guest-cell">
                          <div className={isTop3 ? `avatar avatar--${guest.rank}` : "avatar"}>
                            {guest.initials}
                          </div>
                          <div>
                            <div className="guest-name">{guest.name}</div>
                            <div className="guest-email">{guest.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={isTop3 ? "revenue-cell revenue-cell--top" : "revenue-cell"}>
                        {guest.revenue}
                      </td>
                      <td className="action-cell">
                        <button className="view-btn" onClick={() => setViewing(guest)}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination (visual; wiring it up is a good next exercise) */}
          <div className="pagination">
            <span className="pagination__info">Showing 1–10 of 124 guests</span>
            <div className="pagination__pages">
              <button className="page-btn page-btn--nav" aria-label="Previous page">
                <ChevronLeftIcon />
              </button>
              <button className="page-btn page-btn--active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="page-btn" style={{ pointerEvents: "none" }}>…</span>
              <button className="page-btn">13</button>
              <button className="page-btn page-btn--nav" aria-label="Next page">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The View popup renders over this page (blurred behind it). */}
      {viewing && <GuestDetailsModal guest={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
