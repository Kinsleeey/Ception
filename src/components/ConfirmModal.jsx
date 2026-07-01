import { TrashIcon, CheckCircleIcon } from "./icons.jsx";

// A small confirmation dialog with two looks:
//   variant="danger"  -> red trash badge, side-by-side Cancel / Delete pills
//   variant="default" -> purple check badge, split Cancel | Confirm row
//
// Props:
//   variant      -> "danger" | "default" (default: "default")
//   title        -> heading text
//   children     -> the body message (can include <strong> for emphasis)
//   confirmLabel -> text for the confirm button
//   cancelLabel  -> text for the cancel button (default "Cancel")
//   onConfirm    -> called when the confirm button is clicked
//   onCancel     -> called when cancel / the overlay is clicked
export default function ConfirmModal({
  variant = "default",
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  const isDanger = variant === "danger";

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className={isDanger ? "confirm-card" : "confirm-card confirm-card--default"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-body">
          <div className={isDanger ? "confirm-badge confirm-badge--danger" : "confirm-badge confirm-badge--default"}>
            {isDanger ? <TrashIcon size={24} /> : <CheckCircleIcon size={27} />}
          </div>
          <h2 className="confirm-title">{title}</h2>
          <p className="confirm-text">{children}</p>
        </div>

        <div className="confirm-divider" />

        {isDanger ? (
          <div className="confirm-actions">
            <button className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button className="confirm-btn confirm-btn--danger" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        ) : (
          <div className="confirm-split">
            <button className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button className="confirm-btn confirm-btn--confirm" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
