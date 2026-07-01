import { useState, useEffect } from "react";
import { MenuIcon, CloseIcon } from "./icons.jsx";

// SidebarShell wraps the navigation so it behaves well on every screen size.
//
// On desktop/tablet it just renders the sidebar in place (a normal column).
// On mobile it hides the sidebar off-screen and shows a slim top bar with a
// hamburger button; tapping it slides the sidebar in as a drawer over a dimmed
// backdrop. Tapping the backdrop, pressing Escape, or following a link closes
// it again.
//
// Both the admin Sidebar and the BarSidebar render their contents through this
// shell, so they share one consistent mobile pattern.
//
// Props:
//   brand    -> short label shown in the mobile top bar (e.g. "PD Luxury")
//   children -> the sidebar's inner markup (brand block + nav links)
export default function SidebarShell({ brand = "PD Luxury", children }) {
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the viewport grows back to desktop, and let the
  // Escape key close it too.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      {/* Mobile-only top bar with the hamburger toggle */}
      <div className="mobile-topbar">
        <button
          className="mobile-topbar__menu"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <MenuIcon size={22} />
        </button>
        <span className="mobile-topbar__brand">{brand}</span>
      </div>

      {/* Dimmed backdrop shown behind the open drawer (mobile only) */}
      <div
        className={open ? "sidebar-backdrop sidebar-backdrop--show" : "sidebar-backdrop"}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* The sidebar itself. On mobile it slides in when `open`. Clicks inside
          that land on a link bubble up here so we can auto-close the drawer. */}
      <aside
        className={open ? "sidebar sidebar--open" : "sidebar"}
        onClick={(e) => {
          // Close after tapping a nav link (but not when tapping empty space).
          if (e.target.closest("a, button")) setOpen(false);
        }}
      >
        <button
          className="sidebar__close"
          aria-label="Close menu"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <CloseIcon size={16} />
        </button>
        {children}
      </aside>
    </>
  );
}
