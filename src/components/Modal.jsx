import { CloseIcon } from "./icons.jsx";

// A reusable modal dialog: a dark dimmed overlay with a white card centered
// on top. Clicking the overlay (outside the card) or the X closes it.
//
// Props:
//   title    -> heading text
//   subtitle -> React content shown under the title (e.g. room + price)
//   onClose  -> function called when the user closes the modal
//   children -> the body content
//   footer   -> the footer content (usually action buttons)
export default function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation keeps clicks inside the card from closing the modal */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {subtitle && <div className="modal-subtitle">{subtitle}</div>}
        </div>

        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={16} />
        </button>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
