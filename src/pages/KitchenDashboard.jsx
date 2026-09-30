import BartenderDashboard from "./BartenderDashboard.jsx";

// The kitchen is the same screen as the bar with one counter instead of three:
// tap dishes, build an order, take payment, print a receipt.
//
// It's a thin wrapper rather than a copy, so a fix to the cart or the receipt
// lands in both places at once.
export default function KitchenDashboard() {
  return <BartenderDashboard locations={["Kitchen"]} module="Kitchen" />;
}