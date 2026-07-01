import { STATUSES } from "../data/roomStatuses.js";

// The vertical list of room statuses on the left (Available, Booked, etc.),
// each with a colored dot and a count. Clicking one filters the room grid.
//
// Like CategoryTabs, this is controlled by the parent.
//
// Props:
//   counts -> object mapping status id -> number, e.g. { Available: 6, ... }
//   active -> the currently selected status id
//   onChange -> called with the status id when a row is clicked
export default function StatusFilterPanel({ counts, active, onChange }) {
  return (
    <div className="status-panel">
      {STATUSES.map((status) => {
        const isActive = status.id === active;
        return (
          <button
            key={status.id}
            className={isActive ? "status-row status-row--active" : "status-row"}
            // The active row's tint comes from the status definition.
            style={isActive ? { "--status-tint": status.panelTint } : undefined}
            onClick={() => onChange(status.id)}
          >
            <span className="status-row__left">
              <span className="status-dot" style={{ background: status.dot }} />
              <span className="status-row__label">{status.id}</span>
            </span>
            <span className="status-count">{counts[status.id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
