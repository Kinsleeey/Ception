import { useState, useEffect } from "react";
import Logo from "./Logo.jsx";

// The width (in px) below which we treat the device as a phone. Tablets and
// desktops (>= this width) get the full app; anything narrower gets the
// "Desktop Required" message instead. 768px is the common tablet-portrait
// lower bound, so phones fall below it and tablets stay above.
const MIN_WIDTH = 768;

// MobileGuard renders its children (the whole app) on large enough screens,
// and a clean centered message on phones. It re-checks on every resize, so it
// switches automatically as the window/orientation changes.
export default function MobileGuard({ children }) {
  // Start from the current width. Guard against SSR/no-window just in case.
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < MIN_WIDTH : false
  );

  useEffect(() => {
    // matchMedia is the most efficient way to watch a breakpoint: the browser
    // only notifies us when we cross it, not on every pixel of resize.
    const query = window.matchMedia(`(max-width: ${MIN_WIDTH - 0.02}px)`);
    const update = () => setIsMobile(query.matches);
    update(); // sync once on mount

    // addEventListener is the modern API; older Safari needs addListener.
    if (query.addEventListener) query.addEventListener("change", update);
    else query.addListener(update);

    return () => {
      if (query.removeEventListener) query.removeEventListener("change", update);
      else query.removeListener(update);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="desktop-required">
        <div className="desktop-required__card">
          <div className="desktop-required__logo">
            <Logo />
          </div>
          <h1 className="desktop-required__title">Desktop Required</h1>
          <p className="desktop-required__text">
            This application is designed for desktop and tablet devices and is not
            available on mobile screens. Please use a larger device to continue.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
