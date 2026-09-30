import BarActivity from "./BarActivity.jsx";

// The kitchen's day. Same sheet as the bar's, filtered to the kitchen — a thin
// wrapper rather than a copy, so a fix lands in both.
export default function KitchenActivity() {
  return <BarActivity location="Kitchen" />;
}