import SidebarShell from "./SidebarShell.jsx";
import { CocktailIcon, GridIcon, BedIcon } from "./icons.jsx";
import Logo from "./Logo.jsx";

// The bartender's sidebar lists bar locations. The selected location now lives
// in the PARENT (BartenderDashboard) and is passed in, so the sidebar and the
// drinks/cart all stay in sync. The sidebar just shows the highlight and
// reports clicks upward via onSelect.
//
// Props:
//   activeLocation -> the currently selected bar (e.g. "Bar 1")
//   onSelect       -> called with a location name when one is clicked

// These MUST match the bar_location values in the database exactly.
const barLocations = ["Bar 1", "Bar 2", "Lounge"];
const icons = [CocktailIcon, BedIcon, GridIcon];

export default function BarSidebar({ activeLocation, onSelect }) {
  return (
    <SidebarShell brand="PD Luxury">
      <div className="sidebar__brand-logo">
        <Logo height={28} />
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        {barLocations.map((location, i) => {
          const Icon = icons[i % icons.length];
          const isActive = location === activeLocation;
          return (
            <button
              key={location}
              className={isActive ? "bar-nav-link bar-nav-link--active" : "bar-nav-link"}
              onClick={() => onSelect(location)}
            >
              <Icon size={16} />
              <span>{location}</span>
            </button>
          );
        })}
      </div>
    </SidebarShell>
  );
}
