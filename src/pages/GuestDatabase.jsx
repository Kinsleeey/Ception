import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import GuestDetailsModal from "../components/GuestDetailsModal.jsx";
import {
  GridIcon, SearchIcon, GuestsIcon, MoneyIcon, ChevronLeftIcon, ChevronRightIcon,
} from "../components/icons.jsx";
import { getRankedGuests } from "../api.js";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}
// Build initials from a name, e.g. "Ada Lovelace" -> "AL".
function initialsOf(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PAGE_SIZE = 10;

export default function GuestDatabase() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);   // the whole response wrapper
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // The guest whose profile popup is open (id), or null.
  const [viewingId, setViewingId] = useState(null);

  
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await getRankedGuests(page, PAGE_SIZE, search);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    load();
  }, [page, search]);

  // When the search term changes, jump back to page 1 (results shrink).
  function onSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  const guests = data?.guests || [];
  const totalPages = data?.totalPages || 1;
  const totalGuests = data?.totalGuests || 0;
  // Rank offset: on page 2 with size 10, the first row is #11.
  const rankBase = (page - 1) * PAGE_SIZE;

  // Summary cards. Top spender = the #1 row on page 1 (sorted by spend).
  const topSpender = page === 1 ? guests[0] : null;

  const stats = [
    { label: "Total Guests", value: totalGuests, Icon: GuestsIcon },
    { label: "Top Spender", value: topSpender ? topSpender.name : "—", Icon: GuestsIcon },
    { label: "Top Spender Total", value: topSpender ? naira(topSpender.total_spent) : "—", Icon: MoneyIcon },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Guest Database</span>
        </header>

        <div className="content">
          {/* Summary cards */}
          <div className="stat-cards">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-card__icon"><stat.Icon size={22} /></div>
                <div className="stat-card__label">{stat.label}</div>
                <div className="stat-card__value">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Search (visual only for now) */}
          <div className="search search--wide">
            <span className="search__icon"><SearchIcon size={18} /></span>
            <input
              className="search__input"
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Ranked table */}
          <div className="data-card">
            {loading ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>Loading guests…</p>
            ) : error ? (
              <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
            ) : guests.length === 0 ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>No guests yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Rank</th>
                    <th style={{ textAlign: "left" }}>Guest</th>
                    <th style={{ textAlign: "left" }}>Email</th>
                    <th>Stays</th>
                    <th className="is-total">Total Spent</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g, i) => (
                    <tr key={g.id}>
                      <td style={{ textAlign: "left" }}>#{rankBase + i + 1}</td>
                      <td style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className="guest-avatar">{initialsOf(g.name)}</span>
                          <span>{g.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "left", fontWeight: 400 }}>{g.email || "—"}</td>
                      <td>{g.total_stays}</td>
                      <td className="is-total">{naira(g.total_spent)}</td>
                      <td className="action-cell">
                        <button className="view-btn" onClick={() => setViewingId(g.id)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination (real, driven by totalPages) */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn page-btn--nav"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === page ? "page-btn page-btn--active" : "page-btn"}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="page-btn page-btn--nav"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guest profile popup */}
      {viewingId && (
        <GuestDetailsModal guestId={viewingId} onClose={() => setViewingId(null)} />
      )}
    </div>
  );
}