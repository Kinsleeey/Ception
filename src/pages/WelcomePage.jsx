import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { BellIcon, ShieldIcon, CocktailIcon, GridIcon } from "../components/icons.jsx";

// The three roles shown as cards. Keeping them in an array means the
// JSX below stays short: we describe ONE card and let .map() repeat it.
// To add a 4th role, just add an object here.
const roles = [
  {
    id: "receptionist",
    title: "Receptionist",
    text: "Manage check-ins, check-outs, and guest requests",
    button: "Login as Receptionist",
    Icon: BellIcon,
  },
  {
    id: "admin",
    title: "Admin",
    text: "Oversee staff, reports, and hotel-wide settings",
    button: "Login as Admin",
    Icon: ShieldIcon,
  },
  {
    id: "bartender",
    title: "Bar",
    text: "Manage drink inventory across all bars",
    button: "Login as Bartender",
    Icon: CocktailIcon,
  },
  {
    id: "storekeeper",
    title: "Store",
    text: "Manage stock in store",
    button: "Login as Storekeeper",
    Icon: GridIcon,
  },
];

export default function WelcomePage() {
  return (
    <div className="welcome">
      <div className="welcome__inner">
        {/* Brand — the Ception wordmark carries its own subtitle, so no text
            lines are needed next to it. */}
        <div className="welcome__brand">
          <Logo height={32} />
        </div>

        {/* Headline */}
        <div>
          <h1 className="welcome__heading">Welcome</h1>
          <p className="welcome__subheading">
            Sign in to manage operations, guests, and reservations
          </p>
        </div>

        {/* Role cards */}
        <div className="role-cards">
          {roles.map((role) => (
            <div className="role-card" key={role.id}>
              <div className="role-card__panel">
                <div className="role-card__icon">
                  <role.Icon size={24} />
                </div>
                <h2 className="role-card__title">{role.title}</h2>
                <p className="role-card__text">{role.text}</p>
                {/* Link sends the user to /login/<role>. */}
                <Link className="btn" to={`/login/${role.id}`}>
                  {role.button}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="welcome__footer">
          © 2026 Ception. All rights reserved.
        </p>
      </div>
    </div>
  );
}