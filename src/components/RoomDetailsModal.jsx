import { useState, useEffect } from "react";
import { CloseIcon } from "./icons.jsx";
import { getRoomDetails } from "../api.js";

// The read-only "what is this room like" popup, opened by the small ⓘ on a
// room card.
//
// The amenity grid shows the hotel's FULL list: what this room has as purple
// chips, what it lacks struck through in grey. Reception can answer "does it
// have WiFi?" without having to infer it from an absence.
export default function RoomDetailsModal({ roomId, onClose }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRoomDetails(roomId);
        if (!cancelled) setRoom(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [roomId]);

  // The status pill takes its colour from the room's state.
  function statusClass(status) {
    if (status === "Available") return "rd-status rd-status--available";
    if (status === "Booked") return "rd-status rd-status--booked";
    return "rd-status rd-status--other";
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card rd-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rd-header">
          <div className="rd-header__top">
            <div className="rd-header__title">
              <h2 className="rd-number">{room ? room.number : "Room"}</h2>
              {room && (
                <span className={statusClass(room.status)}>
                  <span className="rd-status__dot" />
                  {room.status}
                </span>
              )}
            </div>
            <button className="rd-close" onClick={onClose} aria-label="Close">
              <CloseIcon size={11} />
            </button>
          </div>
          <p className="rd-subtitle">
            {room
              ? `${room.category} · ₦${Number(room.price).toLocaleString()}/night`
              : "Loading…"}
          </p>
        </div>

        <div className="rd-hairline" />

        {/* Body */}
        <div className="rd-body">
          {loading ? (
            <p className="rd-muted">Loading room details…</p>
          ) : error ? (
            <p className="rd-error">Unable to fetch details: {error}</p>
          ) : (
            <>
              {/* Location */}
              <section className="rd-section">
                <h3 className="rd-section__title">Location</h3>
                <div className="rd-section__rule" />
                <div className="rd-rows">
                  <div className="rd-row">
                    <span className="rd-row__label">Floor</span>
                    <span className="rd-row__value">{room.location.floor || "—"}</span>
                  </div>
                  <div className="rd-row">
                    <span className="rd-row__label">Wing</span>
                    <span className="rd-row__value">{room.location.wing || "—"}</span>
                  </div>
                  <div className="rd-row rd-row--wrap">
                    <span className="rd-row__label">Directions</span>
                    <span className="rd-row__value rd-row__value--wrap">
                      {room.location.directions || "—"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Amenities — the whole master list, two columns */}
              <section className="rd-section">
                <h3 className="rd-section__title">Amenities</h3>
                <div className="rd-section__rule" />
                <div className="rd-amenities">
                  {room.amenities.map((a) => (
                    <span
                      key={a.id}
                      className={a.has ? "rd-chip" : "rd-chip rd-chip--missing"}
                    >
                      {a.has ? `${a.count} × ${a.name}` : `No ${a.name}`}
                    </span>
                  ))}
                </div>
              </section>

              {/* Capacity */}
              <section className="rd-section">
                <h3 className="rd-section__title">Capacity</h3>
                <div className="rd-section__rule" />
                <div className="rd-rows">
                  <div className="rd-row">
                    <span className="rd-row__label">Sleeps</span>
                    <span className="rd-row__value">{room.capacity.sleeps || "—"}</span>
                  </div>
                  <div className="rd-row">
                    <span className="rd-row__label">Bed</span>
                    <span className="rd-row__value">{room.capacity.bed || "—"}</span>
                  </div>
                  <div className="rd-row">
                    <span className="rd-row__label">Size</span>
                    <span className="rd-row__value">
                      {room.capacity.size ? `${room.capacity.size} m²` : "—"}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="rd-hairline" />

        {/* Footer */}
        <div className="rd-footer">
          <button className="rd-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}