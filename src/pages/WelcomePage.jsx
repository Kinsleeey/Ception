import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import {
  CallBellIcon, MartiniIcon, CookingPotIcon, WarehouseIcon, TShirtIcon,
  SwimmerIcon, StorefrontIcon, LightningIcon, WrenchIcon, HeadCircuitIcon,
} from "../components/icons.jsx";

// The hotel's departments, as a 3x3 grid.
//
// `to` is the login route for departments that exist. The rest have no login,
// no pages and no tables yet, so they carry `ready: false` and render greyed
// and unclickable — a card that looks live and then does nothing is worse than
// one that plainly isn't ready.
//
// To bring a department online later: build its pages, add its role to
// LoginPage's roleContent, then set `ready: true` and give it a `to`.
const departments = [
  { id: "receptionist", title: "Reception",              Icon: CallBellIcon,   to: "/login/receptionist", ready: true },
  { id: "bartender",    title: "Bar",                    Icon: MartiniIcon,    to: "/login/bartender",    ready: true },
  { id: "kitchen",      title: "Kitchen",                Icon: CookingPotIcon, to: "/login/kitchen", ready: true },
  { id: "conference",   title: "Conference Hall",        Icon: WarehouseIcon,  ready: false },
  { id: "laundry",      title: "Laundry",                Icon: TShirtIcon,     ready: false },
  { id: "recreation",   title: "Recreational Facilities", Icon: SwimmerIcon,   ready: false },
  { id: "storekeeper",  title: "Store",                  Icon: StorefrontIcon, to: "/login/storekeeper",  ready: true },
  { id: "power",        title: "Power",                  Icon: LightningIcon,  ready: false },
  { id: "maintenance",  title: "Maintenance",            Icon: WrenchIcon,     to: "/login/maintenance", ready: true },
];

// One card. Ready ones are links; the rest are inert, dimmed, and say why on
// hover.
function DepartmentCard({ dept }) {
  const inner = (
    <>
      <span className="dept-card__icon"><dept.Icon size={28} /></span>
      <span className="dept-card__title">{dept.title}</span>
    </>
  );

  if (!dept.ready) {
    return (
      <div
        className="dept-card dept-card--soon"
        title={`${dept.title} isn't set up yet`}
        aria-disabled="true"
      >
        {inner}
        <span className="dept-card__soon">Coming soon</span>
      </div>
    );
  }

  return (
    <Link className="dept-card" to={dept.to}>
      {inner}
    </Link>
  );
}

export default function WelcomePage() {
  return (
    <div className="welcome">
      <div className="welcome__inner">
        {/* Brand — the wordmark carries its own subtitle. */}
        <div className="welcome__brand">
          <Logo height={72} />
        </div>

        {/* Headline */}
        <div className="welcome__intro">
          <h1 className="welcome__heading">Welcome</h1>
          <p className="welcome__subheading">
            Sign in to manage operations, guests, and reservations
          </p>
        </div>

        {/* The departments, 3 across */}
        <div className="dept-grid">
          {departments.map((d) => (
            <DepartmentCard key={d.id} dept={d} />
          ))}
        </div>

        {/* Admin sits apart — it isn't a department, it oversees all of them. */}
        <Link className="dept-card dept-card--admin" to="/login/admin">
          <span className="dept-card__icon"><HeadCircuitIcon size={28} /></span>
          <span className="dept-card__title">Manage as Admin</span>
        </Link>

        <p className="welcome__footer">
          © 2026 Ception. All rights reserved.
        </p>
      </div>
    </div>
  );
}