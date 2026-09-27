import { useState, useMemo } from "react";
import { CloseIcon, ChevronDownIcon } from "./icons.jsx";
import { reportIssue } from "../api.js";

const PRIORITIES = ["Low", "Medium", "High"];

// Report something wrong with a room.
//
// `rooms` is the dashboard's already-loaded room list, so this doesn't refetch.
// Picking a category narrows the room dropdown to rooms in it.
export default function ReportIssueModal({ rooms = [], onClose, onSaved }) {
  const categories = useMemo(
    () => [...new Set(rooms.map((r) => r.category))].sort(),
    [rooms]
  );

  const [category, setCategory] = useState(categories[0] || "");
  const [roomId, setRoomId] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // The room list follows the chosen category.
  const roomsInCategory = useMemo(
    () => rooms.filter((r) => r.category === category),
    [rooms, category]
  );

  function changeCategory(next) {
    setCategory(next);
    setRoomId("");          // the old room may not be in the new category
  }

  async function handleSubmit() {
    if (!roomId) { setError("Pick which room this is about."); return; }
    if (!issue.trim()) { setError("Please describe the issue."); return; }
    try {
      setBusy(true);
      setError(null);
      await reportIssue({
        department: "Reception",
        room_id: Number(roomId),
        issue: issue.trim(),
        priority,
      });
      if (onSaved) onSaved(); else onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card ri-card" onClick={(e) => e.stopPropagation()}>
        <div className="ri-header">
          <div>
            <h2 className="ri-title">Report an Issue</h2>
            <p className="ri-subtitle">Reception</p>
          </div>
          <button className="rd-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={11} />
          </button>
        </div>

        <div className="ri-rule" />

        <div className="ri-body">
          <div className="ri-row">
            <div className="ri-field">
              <label className="ri-label">Room Category</label>
              <div className="select-wrap">
                <select className="ri-input" value={category}
                  onChange={(e) => changeCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="select-wrap__chevron"><ChevronDownIcon size={16} /></span>
              </div>
            </div>

            <div className="ri-field">
              <label className="ri-label">Room Number</label>
              <div className="select-wrap">
                <select className="ri-input" value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}>
                  <option value="">Select a room</option>
                  {roomsInCategory.map((r) => (
                    <option key={r.id} value={r.id}>{r.number}</option>
                  ))}
                </select>
                <span className="select-wrap__chevron"><ChevronDownIcon size={16} /></span>
              </div>
            </div>
          </div>

          <div className="ri-field">
            <label className="ri-label">Issue</label>
            <textarea
              className="ri-input ri-textarea"
              rows={3}
              placeholder="e.g. Air conditioner in the bedroom is not cooling"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />
          </div>

          <div className="ri-field">
            <label className="ri-label">Priority</label>
            {/* Three fixed options, so pills rather than a dropdown — one click,
                and the colour is visible before you choose. */}
            <div className="ri-priorities">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={
                    p === priority
                      ? `ri-pri ri-pri--${p.toLowerCase()} ri-pri--on`
                      : "ri-pri"
                  }
                  onClick={() => setPriority(p)}
                >
                  <span className={`ri-pri__dot ri-pri__dot--${p.toLowerCase()}`} />
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rd-error">{error}</p>}
        </div>

        <div className="ri-footer">
          <button className="ri-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-pill-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? "Sending…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}