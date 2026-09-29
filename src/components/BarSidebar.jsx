import { CocktailIcon, GridIcon, BedIcon } from "./icons.jsx";

// The bartender's sidebar lists bar locations. The selected location lives in
// the PARENT (BartenderDashboard) and is passed in, so the sidebar and the
// drinks/cart stay in sync. The sidebar shows the highlight and reports clicks
// upward via onSelect.
//
// No logo here: the wordmark belongs to ModuleHeader, which now sits ABOVE
// this. Two copies of the same mark on one screen is one too many.
//
// Props:
//   activeLocation -> the currently selected bar (e.g. "Bar 1")
//   onSelect       -> called with a location name when one is clicked

// These MUST match the bar_location values in the database exactly.
const barLocations = ["Bar 1", "Bar 2", "Lounge"];
const icons = [CocktailIcon, BedIcon, GridIcon];

export default function BarSidebar({ activeLocation, onSelect }) {
  return (
    <aside className="bar-sidebar">
      <span className="bar-sidebar__label">Bars</span>

      {barLocations.map((location, i) => {
        const Icon = icons[i % icons.length];
        const isActive = location === activeLocation;
        return (
          <button
            key={location}
            className={isActive ? "bar-nav-link bar-nav-link--active" : "bar-nav-link"}
            onClick={() => onSelect(location)}
          >
            <Icon size={15} />
            <span>{location}</span>
          </button>
        );
      })}
    </aside>
  );
}