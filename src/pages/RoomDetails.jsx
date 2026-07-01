import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import CategoryTabs from "../components/CategoryTabs.jsx";
import StatusFilterPanel from "../components/StatusFilterPanel.jsx";
import RoomCard from "../components/RoomCard.jsx";
import EditRoomModal from "../components/EditRoomModal.jsx";
import { GridIcon } from "../components/icons.jsx";
import { rooms, CATEGORIES, countByStatus } from "../data/roomsData.js";

// Room Details is the admin-side view of the same rooms. Each card can be
// disabled (its details blur out and the button flips to "Activate") or
// edited (opens a popup over this page, which stays blurred behind it).
export default function RoomDetails() {
  const [category, setCategory] = useState("Executive");
  const [status, setStatus] = useState("Available");

  // The set of room numbers that are currently disabled. Using a Set lets us
  // flip one room without touching the others. (Stored as state so the UI
  // re-renders when it changes.)
  const [disabled, setDisabled] = useState(() => new Set());
  // The room currently being edited (null = the edit popup is closed).
  const [editing, setEditing] = useState(null);

  function toggleDisabled(number) {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  }

  const visibleRooms = rooms.filter(
    (room) => room.category === category && room.status === status
  );
  const counts = countByStatus(category);

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
            <StatusFilterPanel counts={counts} active={status} onChange={setStatus} />

            {visibleRooms.length === 0 ? (
              <p style={{ padding: "24px", color: "#7b7487" }}>
                No {status.toLowerCase()} rooms in {category} right now.
              </p>
            ) : (
              <div className="room-grid room-grid--two">
                {visibleRooms.map((room) => {
                  const isOff = disabled.has(room.number);
                  // The primary button flips between Disable and Activate.
                  const actions = [
                    {
                      label: isOff ? "Activate" : "Disable",
                      variant: "solid",
                      onClick: () => toggleDisabled(room.number),
                    },
                    {
                      label: "Edit Room Details",
                      variant: "outline",
                      onClick: () => setEditing(room),
                    },
                  ];
                  return (
                    <RoomCard
                      key={room.number}
                      disabled={isOff}
                      room={
                        status === "Available"
                          ? { ...room, meta: { value: room.guestsSoFar, label: "guests so far" } }
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

      {/* Edit popup renders on top of this page; the page shows blurred behind
          it thanks to the overlay's backdrop blur. */}
      {editing && <EditRoomModal room={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
