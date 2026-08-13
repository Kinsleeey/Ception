import { useState, useMemo } from "react";
import TopBar from "../components/TopBar.jsx";
import ReserverDetailsModal from "../components/ReserverDetailsModal.jsx";
import { SearchIcon } from "../components/icons.jsx";

// FRONTEND ONLY (for now) — mock rows until the multi-reservation backend
// exists. Each row is one reserved ROOM: a reservation for 3 rooms produces 3
// rows, because each room needs its own assignment and its own check-in.
const MOCK_RESERVATIONS = [
  {
    id: 1, reserver: "Ada Obi", phone: "+234 801 234 5678",
    email: "ada@example.com", address: "Enugu",
    category: "Deluxe King", start: "2026-08-12", end: "2026-08-15",
    payment: "Direct Bank Transfer", isAccount: false,
    availableRooms: ["RM 201", "RM 202", "RM 205"], assignedRoom: "",
  },
  {
    id: 2, reserver: "Chuka Eze", phone: "+234 802 111 2222",
    email: "chuka@example.com", address: "Lagos",
    category: "Standard", start: "2026-08-12", end: "2026-08-14",
    payment: "Global Dynamics Inc.", isAccount: true,
    availableRooms: ["RM 101", "RM 103"], assignedRoom: "",
  },
  {
    id: 3, reserver: "Ngozi Ali", phone: "+234 803 555 7777",
    email: "ngozi@example.com", address: "Abuja",
    category: "Superior Double", start: "2026-08-18", end: "2026-08-20",
    payment: "POS", isAccount: false,
    availableRooms: ["RM 301"], assignedRoom: "",
  },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function ReservationsList() {
  const [rows, setRows] = useState(MOCK_RESERVATIONS);
  const [query, setQuery] = useState("");

  // Which reserver's details popup is open (the row), or null.
  const [viewing, setViewing] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.reserver.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.phone || "").includes(q)
    );
  }, [rows, query]);

  const arrivingToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return rows.filter((r) => r.start === today).length;
  }, [rows]);

  function assignRoom(id, room) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, assignedRoom: room } : r))
    );
  }

  function handleCheckIn(row) {
    // The check-in modal is a variant of GuestRegistration — wiring pending.
    alert(`Check in ${row.reserver} into ${row.assignedRoom} (not wired yet).`);
  }

  return (
    <div className="room-page">
      <TopBar title="Reservations" />

      <div className="room-main">
        {/* Stats */}
        <div className="stat-strip">
          <span className="stat-strip__item">
            Total Reservations <span className="stat-strip__num">{rows.length}</span>
          </span>
          <span className="stat-strip__divider" />
          <span className="stat-strip__item">
            Arriving Today <span className="stat-strip__num">{arrivingToday}</span>
          </span>
        </div>

        {/* Search */}
        <div className="search search--wide">
          <span className="search__icon"><SearchIcon size={18} /></span>
          <input
            className="search__input"
            type="text"
            placeholder="Search reservations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="report-panel">
          <table className="report-table">
            <thead>
              <tr>
                <th className="is-left">Reserver</th>
                <th className="is-left">Category</th>
                <th className="is-left">Stay Dates</th>
                <th className="is-left">Payment</th>
                <th className="is-left">Room</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "20px", color: "#7b7487" }}>
                    {query ? "No reservations match that search." : "No reservations yet."}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id}>
                    <td className="is-left">
                      <span className="resv-reserver">{row.reserver}</span>
                      <button className="resv-view" onClick={() => setViewing(row)}>
                        View
                      </button>
                    </td>
                    <td className="is-left">
                      <span className="report-pill report-pill--bar">{row.category}</span>
                    </td>
                    <td className="is-left resv-dates">
                      {formatDate(row.start)} – {formatDate(row.end)}
                    </td>
                    <td className="is-left">
                      <span
                        className={
                          row.isAccount
                            ? "report-pill report-pill--pay"
                            : "report-pill report-pill--pos"
                        }
                      >
                        {row.payment}
                      </span>
                    </td>
                    <td className="is-left">
                      <select
                        className="resv-room-select"
                        value={row.assignedRoom}
                        onChange={(e) => assignRoom(row.id, e.target.value)}
                        aria-label={`Assign a room for ${row.reserver}`}
                      >
                        <option value="">Assign</option>
                        {row.availableRooms.map((rm) => (
                          <option key={rm} value={rm}>{rm}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {/* Stays muted until a room is assigned. */}
                      <button
                        className="resv-checkin"
                        disabled={!row.assignedRoom}
                        onClick={() => handleCheckIn(row)}
                      >
                        Check-in Guest
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <ReserverDetailsModal reserver={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}