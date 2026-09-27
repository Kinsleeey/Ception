import { statusById } from "../data/roomStatuses.js";
import { InfoIcon } from "./icons.jsx";

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
//   onInfo   -> optional. When given, a small ⓘ appears beside the room
//               number and calls this on click. It's opt-in so the admin
//               Room Details page doesn't get it unless it asks for it.
//
// `room.housekeeping` ("Clean" | "Dirty") shows as a small dot in the corner.
// It's deliberately quieter than the room status, which the card's whole tint
// already carries — two loud signals on one small card compete.
export default function RoomCard({ room, actions = [], disabled = false, onInfo }) {
  const status = statusById[room.status] || statusById.Available;

  return (
    <div className="room-card" style={{ "--room-tint": status.tint }}>
      {room.housekeeping && (
        <span
          className={`room-hk room-hk--${room.housekeeping.toLowerCase()}`}
          title={room.housekeeping}
          aria-label={room.housekeeping}
        >
          <span className="room-hk__dot" />
        </span>
      )}
      <div className={disabled ? "room-card__body room-card__body--blurred" : "room-card__body"}>
        <div>
          <div className="room-card__head">
            <div className="room-card__number">{room.number}</div>
            {onInfo && (
              <button
                className="room-info-btn"
                onClick={() => onInfo(room)}
                aria-label={`About ${room.number}`}
                title="Room details"
              >
                <InfoIcon size={13} />
              </button>
            )}
          </div>
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