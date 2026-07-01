// The room category tabs: Executive / VIP / Standard.
//
// This is a "controlled" component: it doesn't track which tab is active
// itself. Instead the parent page passes in the current `active` value and
// an `onChange` function to call when a tab is clicked. That keeps the
// single source of truth in the page, which is the recommended React pattern.
//
// Props:
//   categories -> array of tab labels, e.g. ["Executive", "VIP", "Standard"]
//   active     -> the currently selected label
//   onChange   -> function called with the new label when a tab is clicked
export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="category-tabs">
      {categories.map((category) => (
        <button
          key={category}
          className={
            category === active ? "category-tab category-tab--active" : "category-tab"
          }
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
