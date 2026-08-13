import { NavLink } from "react-router-dom";
import SidebarShell from "./SidebarShell.jsx";
import {
  GridIcon, DoorIcon, UsersIcon, ChartIcon, AccountIcon, EditIcon, SettingsIcon,
  BoxIcon, ReceiptIcon,
} from "./icons.jsx";
import Logo from "./Logo.jsx";


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
  {
    label: "Stock",
    links: [
      { name: "Top-up/Edit", to: "/stock-manage", Icon: BoxIcon },
      { name: "History", to: "/stock-history", Icon: ReceiptIcon },
    ],
  },
  {
    label: "Accounts",
    links: [
      { name: "Account", to: "/account", Icon: AccountIcon },
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
      <div className="sidebar__brand-logo">
        <Logo height={28} />
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
