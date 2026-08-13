import ceptionDark from "../assets/ception-dark.png";
import ceptionLight from "../assets/ception-light.png";

// The Ception wordmark. One component, used everywhere the brand appears, so a
// future rebrand (or per-hotel logo config) is a one-file change.
//
// Props:
//   variant -> "dark"  = dark text, for light backgrounds (default)
//              "light" = white text, for dark backgrounds
//   height  -> rendered height in px (width scales automatically)
export default function Logo({ variant = "dark", height = 48 }) {
  const src = variant === "light" ? ceptionLight : ceptionDark;
  return (
    <img
      src={src}
      alt="Ception — Hotel Management System"
      style={{ height: `${height}px`, width: "auto", display: "block" }}
    />
  );
}