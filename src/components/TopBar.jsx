import { Link } from "react-router-dom";
import { ArrowLeftIcon, SearchIcon } from "./icons.jsx";

// The top app bar used on the reception room screens: a back arrow + title
// on the left, and a search box on the right.
//
// Props:
//   title          -> the heading text
//   searchPlaceholder -> placeholder for the search box (default provided)
//   backTo         -> where the back arrow links (default: welcome page)
export default function TopBar({
  title,
  searchPlaceholder = "Search rooms...",
  backTo = "/",
}) {
  return (
    <header className="topbar-app">
      <Link className="topbar-app__title" to={backTo}>
        <ArrowLeftIcon size={20} />
        {title}
      </Link>

      <div className="search">
        <span className="search__icon">
          <SearchIcon size={18} />
        </span>
        {/* This search box is visual for now; wiring it to filter the list
            is a good first exercise once you're comfortable with state. */}
        <input className="search__input" type="text" placeholder={searchPlaceholder} />
      </div>
    </header>
  );
}
