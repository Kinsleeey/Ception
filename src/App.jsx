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
import StockTopUp from "./pages/StockTopUp.jsx";
import StockHistory from "./pages/StockHistory.jsx";
import { IssueStock, ReturnStock } from "./pages/StockMovement.jsx";
import Accounts from "./pages/Accounts.jsx";
import Reservations from "./pages/Reservations.jsx";
import ReservationCreate from "./pages/ReservationCreate.jsx";



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

      {/* Store — admin */}
      <Route path="/stock-manage" element={<StockTopUp />} />
      <Route path="/stock-history" element={<StockHistory />} />

      {/* Store — storekeeper */}
      <Route path="/stock/issue" element={<IssueStock />} />
      <Route path="/stock/return" element={<ReturnStock />} />
      
      {/* Accounts (admin) */}
      <Route path="/account" element={<Accounts />} />

      {/* Multi-room reservation form (reception) */}
      <Route path="/reservations/new" element={<ReservationCreate />} />
      <Route path="/reservations" element={<Reservations />} />

    </Routes>
  );
}
