import { useState } from "react";
import SidebarShell from "./SidebarShell.jsx";
import { CocktailIcon, GridIcon, BedIcon } from "./icons.jsx";
import { barLocations } from "../data/barData.js";

// The bartender's sidebar lists bar locations (Bar 1, Bar 3, Lounge) rather
// than the admin sections. The selected location is tracked in state here so
// the highlight moves when you click. It renders through SidebarShell so it
// gets the same mobile drawer behaviour as the admin sidebar.
const icons = [CocktailIcon, BedIcon, GridIcon];

export default function BarSidebar() {
  const [active, setActive] = useState(barLocations[0]);

  return (
    <SidebarShell brand="PD Luxury">
      <div>
        <div className="sidebar__brand-name">PD Luxury</div>
        <div className="sidebar__brand-sub">Hotel and Suites</div>
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        {barLocations.map((location, i) => {
          const Icon = icons[i % icons.length];
          return (
            <button
              key={location}
              className={location === active ? "bar-nav-link bar-nav-link--active" : "bar-nav-link"}
              onClick={() => setActive(location)}
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
