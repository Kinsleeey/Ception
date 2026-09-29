import { useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import { ArrowLeftIcon } from "./icons.jsx";

// The header every department module shares — reception, bar, store,
// maintenance.
//
// One component rather than four near-copies, so they can't drift apart: a back
// arrow, the wordmark, a rule, the module's name, and whatever controls that
// module needs on the right.
//
// Admin pages keep the sidebar instead; this is for the full-width screens.
//
// Props:
//   module   -> "Reception" | "Bar 1" | "Store" | "Maintenance"
//   back     -> optional path. Omit it and the arrow steps back through
//               history, which is what you want from a module's sub-page.
//               Pass a path when "back" means somewhere specific regardless
//               of how you arrived.
//   children -> the right-hand controls (links, badges)
export default function ModuleHeader({ module, back, children }) {
  const navigate = useNavigate();

  return (
    <header className="mod-header">
      <div className="mod-header__inner">
        <div className="mod-header__brand">
          <button
            className="mod-header__back"
            onClick={() => (back ? navigate(back) : navigate(-1))}
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeftIcon size={18} />
          </button>

          <Logo height={22} />
          <span className="mod-header__rule" />
          <span className="mod-header__module">{module}</span>
        </div>

        {children && <div className="mod-header__actions">{children}</div>}
      </div>
    </header>
  );
}