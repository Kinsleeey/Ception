import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import ReserverDetailsModal from "../components/ReserverDetailsModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ReservationCheckInModal from "../components/ReservationCheckInModal.jsx";
import { SearchIcon, CloseIcon, ChevronDownIcon } from "../components/icons.jsx";
import {
  getReservations, assignReservationRoom, cancelReservationRoom,
} from "../api.js";

// Reservations — its own page, reached from "View Reservations" on the Room
// Dashboard. The X closes back to the dashboard.
//
// Each row is one reserved ROOM: a 5-room booking shows as 5 rows, because the
// room assignment, the check-in and the cancel are all per room.

// The fixed payment methods. Anything else in payment_method is an account
// name, which gets the purple pill.
const BASE_METHODS = ["Direct Bank Transfer", "Cash", "Card", "POS"];

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function paymentClass(method) {
  if (!BASE_METHODS.includes(method)) return "resv-pay resv-pay--account";
  return method === "POS" ? "resv-pay resv-pay--pos" : "resv-pay resv-pay--cash";
}

export default function Reservations() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  // Which popup is open, and for which row.
  const [viewing, setViewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setRows(await getReservations());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.reserver || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q) ||
        (r.phone || "").includes(q) ||
        (r.room_number || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const arrivingToday = useMemo(() => {
    const today = new Date().toDateString();
    return rows.filter(
      (r) => r.start_date && new Date(r.start_date).toDateString() === today
    ).length;
  }, [rows]);

  async function handleAssign(row, roomId) {
    try {
      await assignReservationRoom(row.id, Number(roomId));
      await load();
    } catch (err) {
      alert(`Couldn't reassign: ${err.message}`);
    }
  }

  async function handleCancel() {
    try {
      await cancelReservationRoom(cancelling.id);
      setCancelling(null);
      await load();
    } catch (err) {
      alert(`Couldn't cancel: ${err.message}`);
      setCancelling(null);
    }
  }

  return (
    <div className="room-page">
      <TopBar title="Room Dashboard" />

      <div className="room-main">
        <div className="resv-head">
          <h2 className="resv-head__title">Reservations</h2>
          <button
            className="resv-head__close"
            onClick={() => navigate("/reception")}
            aria-label="Close reservations"
          >
            <CloseIcon size={20} />
          </button>
        </div>

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
        {loading ? (
          <p style={{ padding: "24px", color: "#7b7487" }}>Loading reservations…</p>
        ) : error ? (
          <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>
        ) : (
          <div className="resv-card">
            <table className="resv-table">
              <thead>
                <tr>
                  <th>Reserver</th>
                  <th>Category</th>
                  <th>Stay Dates</th>
                  <th>Payment</th>
                  <th>Room</th>
                  <th className="is-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="resv-empty">
                      {query ? "No reservations match that search." : "No reservations yet."}
                    </td>
                  </tr>
                ) : (
                  visible.map((row) => (
                    <tr key={row.id}>
                      {/* Reserver: name with the View link stacked underneath */}
                      <td>
                        <div className="resv-reserver">{row.reserver}</div>
                        <button className="resv-view" onClick={() => setViewing(row)}>
                          View
                        </button>
                      </td>

                      <td className="resv-category">{row.category}</td>

                      <td>
                        <div className="resv-date">{formatDate(row.start_date)}</div>
                        <div className="resv-date resv-date--end">{formatDate(row.end_date)}</div>
                      </td>

                      <td>
                        <span className={paymentClass(row.payment_method)}>
                          {row.payment_method || "—"}
                        </span>
                      </td>

                      {/* Rooms are auto-assigned, so this always has a value —
                          the dropdown is for CHANGING it. */}
                      <td>
                        <div className="resv-assign">
                          <select
                            className="resv-assign__select"
                            value={row.room_id}
                            onChange={(e) => handleAssign(row, e.target.value)}
                            aria-label={`Room for ${row.reserver}`}
                          >
                            {(row.room_options || []).map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.number}</option>
                            ))}
                          </select>
                          <span className="resv-assign__chevron">
                            <ChevronDownIcon size={14} />
                          </span>
                        </div>
                      </td>

                      <td className="is-right">
                        <button
                          className="resv-action resv-action--checkin"
                          onClick={() => setCheckingIn(row)}
                        >
                          Check-in Guest
                        </button>
                        <button
                          className="resv-action resv-action--cancel"
                          onClick={() => setCancelling(row)}
                        >
                          Cancel Reservation
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <ReserverDetailsModal reserver={viewing} onClose={() => setViewing(null)} />
      )}

      {checkingIn && (
        <ReservationCheckInModal
          row={checkingIn}
          onClose={() => setCheckingIn(null)}
          onDone={async () => { setCheckingIn(null); await load(); }}
        />
      )}

      {cancelling && (
        <ConfirmModal
          variant="danger"
          title="Cancel Reservation?"
          confirmLabel="Cancel Reservation"
          cancelLabel="Keep It"
          onCancel={() => setCancelling(null)}
          onConfirm={handleCancel}
        >
          You are about to cancel <strong>{cancelling.reserver}</strong>'s reservation
          for <strong>{cancelling.room_number}</strong> ({cancelling.category}).
          {!BASE_METHODS.includes(cancelling.payment_method) && (
            <> The amount will be refunded to <strong>{cancelling.payment_method}</strong>.</>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}