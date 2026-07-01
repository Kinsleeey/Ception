import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import RoomDashboard from "./pages/RoomDashboard.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import GuestDatabase from "./pages/GuestDatabase.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import BartenderDashboard from "./pages/BartenderDashboard.jsx";
import BarReport from "./pages/BarReport.jsx";
import BarEditDrinks from "./pages/BarEditDrinks.jsx";

// App decides which page to show based on the URL in the address bar.
// Each <Route> maps a URL path to a page component.
//
// Note: popups (guest registration, booking/reservation details, the product
// forms, order details, etc.) are NOT routes. They open as overlays on top of
// the page that triggered them, so they live in that page's state instead of
// here. That's why this list only has full screens.
//
// To add a new screen later:
//   1. Make a new file in src/pages (copy an existing one as a starting point).
//   2. Import it at the top of this file.
//   3. Add a <Route path="/your-path" element={<YourPage />} /> below.
export default function App() {
  return (
    <Routes>
      {/* Entry + auth */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login/:role" element={<LoginPage />} />

      {/* Admin area (sidebar layout) */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/rooms" element={<RoomDetails />} />
      <Route path="/guests" element={<GuestDatabase />} />
      <Route path="/settings" element={<AdminSettings />} />
      <Route path="/bar-report" element={<BarReport />} />

      {/* Reception area */}
      <Route path="/reception" element={<RoomDashboard />} />

      {/* Bar area */}
      <Route path="/bar" element={<BartenderDashboard />} />
      <Route path="/bar-drinks" element={<BarEditDrinks />} />
    </Routes>
  );
}
