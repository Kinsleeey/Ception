import { statusById } from "../data/roomStatuses.js";

// A single room card. The background tint comes from the room's status.
// The two action buttons are passed in as an array so the same card works
// on the reception dashboard ("Check-in Guest" / "Reserve for Guest"),
// the booked view ("View Guest" / "Check-out Guest"), and the admin
// Room Details page ("Disable"/"Activate" / "Edit Room Details").
//
// Props:
//   room     -> { number, price, status, meta? }
//   actions  -> array of up to 2 objects: { label, variant, onClick }
//               variant is "solid" or "outline"
//   disabled -> when true, the card's details are blurred (used on Room
//               Details to show a deactivated room)
export default function RoomCard({ room, actions = [], disabled = false }) {
  const status = statusById[room.status] || statusById.Available;

  return (
    <div className="room-card" style={{ "--room-tint": status.tint }}>
      <div className={disabled ? "room-card__body room-card__body--blurred" : "room-card__body"}>
        <div>
          <div className="room-card__number">{room.number}</div>
          <div className="room-card__price">
            {room.price} <span>/ night</span>
          </div>
          {/* Optional extra line, e.g. "148 guests so far" on Room Details */}
          {room.meta && (
            <div className="room-card__meta">
              {room.meta.value} <span>{room.meta.label}</span>
            </div>
          )}
        </div>

        <div className="room-card__actions">
          {actions.map((action) => (
            <button
              key={action.label}
              className={`pill-btn pill-btn--${action.variant}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
