import { NavLink } from "react-router-dom";
import SidebarShell from "./SidebarShell.jsx";
import {
  GridIcon, DoorIcon, UsersIcon, ChartIcon, EditIcon, SettingsIcon,
} from "./icons.jsx";

// The navigation items, grouped into sections like in the Figma design.
// Each link has a `to` path. We use react-router's <NavLink>, which
// automatically adds the "active" styling to whichever link matches the
// current URL — so the highlight follows you from page to page on its own.
const sections = [
  {
    label: "Rooms",
    links: [
      { name: "Dashboard", to: "/admin", Icon: GridIcon },
      { name: "Room Details", to: "/rooms", Icon: DoorIcon },
      { name: "Guest Database", to: "/guests", Icon: UsersIcon },
    ],
  },
  {
    label: "Bar",
    links: [
      { name: "Report", to: "/bar-report", Icon: ChartIcon },
      { name: "Add/Edit Drinks", to: "/bar-drinks", Icon: EditIcon },
    ],
  },
];

// NavLink calls this function with { isActive } and we return the class name.
function linkClass({ isActive }) {
  return isActive ? "nav-link nav-link--active" : "nav-link";
}

export default function Sidebar() {
  return (
    <SidebarShell brand="PD Luxury">
      <div>
        <div className="sidebar__brand-name">PD Luxury</div>
        <div className="sidebar__brand-sub">Hotel and Suites</div>
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <div className="sidebar__section-label">{section.label}</div>
          {section.links.map((link) => (
            <NavLink key={link.name} to={link.to} className={linkClass} end>
              <link.Icon />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </div>
      ))}

      {/* Settings sits on its own at the bottom */}
      <NavLink to="/settings" className={linkClass} style={{ marginTop: "auto" }} end>
        <SettingsIcon />
        <span>Settings</span>
      </NavLink>
    </SidebarShell>
  );
}
