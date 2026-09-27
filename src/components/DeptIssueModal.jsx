import { useState } from "react";
import { CloseIcon } from "./icons.jsx";
import { reportIssue } from "../api.js";

const PRIORITIES = ["Low", "Medium", "High"];

// Report a fault from any department that isn't reception.
//
// Reception's version asks which ROOM, because it has rooms to point at. Every
// other department points at a piece of equipment or an area instead, so they
// all share this one component rather than each getting a near-copy.
//
// Props:
//   department  -> "Bar" | "Store" | "Kitchen" ...
//   place       -> the specific spot within it, e.g. "Bar 1" (optional)
//   whereLabel  -> what to call the first field
//   wherePlaceholder / issuePlaceholder -> examples that fit the department
export default function DeptIssueModal({
  department,
  place,
  whereLabel = "Equipment or Area",
  wherePlaceholder = "e.g. fridge, blender, tap",
  issuePlaceholder = "Describe what's wrong",
  onClose,
  onSaved,
}) {
  const [where, setWhere] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!issue.trim()) { setError("Please describe the issue."); return; }
    try {
      setBusy(true);
      setError(null);
      // The department, then the specific spot if one was given — so a
      // maintenance list reads "Bar 1 · under-counter fridge".
      const base = place || department;
      await reportIssue({
        department,
        location: where.trim() ? `${base} · ${where.trim()}` : base,
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
            <p className="ri-subtitle">{place || department}</p>
          </div>
          <button className="rd-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={11} />
          </button>
        </div>

        <div className="ri-rule" />

        <div className="ri-body">
          <div className="ri-field">
            <label className="ri-label">{whereLabel}</label>
            <input
              className="ri-input"
              placeholder={wherePlaceholder}
              value={where}
              onChange={(e) => setWhere(e.target.value)}
            />
          </div>

          <div className="ri-field">
            <label className="ri-label">Issue</label>
            <textarea
              className="ri-input ri-textarea"
              rows={3}
              placeholder={issuePlaceholder}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />
          </div>

          <div className="ri-field">
            <label className="ri-label">Priority</label>
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