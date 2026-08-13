import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import StatusFilterPanel from "../components/StatusFilterPanel.jsx";
import RoomCard from "../components/RoomCard.jsx";
import EditRoomModal from "../components/EditRoomModal.jsx";
import { GridIcon } from "../components/icons.jsx";
import { CATEGORIES } from "../data/roomsData.js";
import { getRooms, disableRoom, getRoomGuestCount, getRoomStatusCounts } from "../api.js";

// Room Details is the admin-side view of rooms. Rooms come from the backend;
// each can be disabled (real is_disabled column) or edited (popup). Each
// Available card also shows how many guests that room has had so far.
export default function RoomDetails() {
  const [category, setCategory] = useState("Executive");
  const [status, setStatus] = useState("Available");

  const [statusCounts, setStatusCounts] = useState({});

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // A map of { roomId: guestCount } filled in after rooms load.
  const [counts, setCounts] = useState({});

  const [editing, setEditing] = useState(null);

  // Fetch rooms for the current filters. Kept separate so we can refresh after
  // a disable/edit.
  async function loadRooms() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms({ category, status });
      setRooms(data);
      // Per-status badge counts (admin counts all rooms, incl. disabled).
      const sc = await getRoomStatusCounts({ category });
      setStatusCounts(sc);

      // For each room, fetch its "guests so far" count. These are independent
      // little requests; we run them together and collect the results into a
      // { roomId: count } map. (Fine for a handful of rooms.)
      const entries = await Promise.all(
        data.map(async (room) => {
          try {
            const res = await getRoomGuestCount(room.id);
            return [room.id, res.guest_count];
          } catch {
            return [room.id, 0];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, [category, status]);

  // Toggle a room's disabled state in the database, then refresh.
  async function handleToggleDisabled(room) {
    try {
      await disableRoom(room.id, !room.is_disabled);
      await loadRooms();
    } catch (err) {
      alert(`Couldn't update room: ${err.message}`);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Rooms</span>
        </header>

        <div className="content">
          <CategoryTabs categories={CATEGORIES} active={category} onChange={setCategory} />

          <p className="room-caption" style={{ width: "100%" }}>
            All <strong>{status}</strong> rooms for <strong>{category}</strong>.
          </p>

          <div className="room-layout">
            <StatusFilterPanel counts={statusCounts} active={status} onChange={setStatus} />

            {loading ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>Loading rooms…</p>
            ) : error ? (
              <p style={{ padding: "24px", color: "#c0392b" }}>Couldn’t load: {error}</p>
            ) : rooms.length === 0 ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>
                No {status.toLowerCase()} rooms in {category} right now.
              </p>
            ) : (
              <div className="room-grid room-grid--two">
                {rooms.map((room) => {
                  const isOff = room.is_disabled;
                  const actions = [
                    {
                      label: isOff ? "Activate" : "Disable",
                      variant: "solid",
                      onClick: () => handleToggleDisabled(room),
                    },
                    {
                      label: "Edit Room Details",
                      variant: "outline",
                      onClick: () => setEditing(room),
                    },
                  ];
                  return (
                    <RoomCard
                      key={room.id}
                      disabled={isOff}
                      room={
                        status === "Available"
                          ? { ...room, meta: { value: counts[room.id] ?? 0, label: "guests so far" } }
                          : room
                      }
                      actions={actions}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit popup. On save it refreshes the list. */}
      {editing && (
        <EditRoomModal
          room={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await loadRooms(); }}
        />
      )}
    </div>
  );
}
