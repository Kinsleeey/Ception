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
import StockMovement, { IssueStock } from "./pages/StockMovement.jsx";
import Accounts from "./pages/Accounts.jsx";
import Reservations from "./pages/Reservations.jsx";
import ReservationCreate from "./pages/ReservationCreate.jsx";
import AccountingOverview from "./pages/AccountingOverview.jsx";
import AccountingSales from "./pages/AccountingSales.jsx";
import AccountingCash from "./pages/AccountingCash.jsx";
import AccountingExpenses from "./pages/AccountingExpenses.jsx";
import TodaysActivity from "./pages/TodaysActivity.jsx";
import BarActivity from "./pages/BarActivity.jsx";
import StoreActivity from "./pages/StoreActivity.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import MaintenanceActivity from "./pages/MaintenanceActivity.jsx";
import KitchenDashboard from "./pages/KitchenDashboard.jsx";
import KitchenActivity from "./pages/KitchenActivity.jsx";

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
      
      
      {/* Accounts (admin) */}
      <Route path="/account" element={<Accounts />} />

      {/* Accounting */}
      <Route path="/accounting" element={<AccountingOverview />} />
      <Route path="/accounting/sales" element={<AccountingSales />} />
      <Route path="/accounting/cash" element={<AccountingCash />} />
      <Route path="/accounting/expenses" element={<AccountingExpenses />} />

      {/* Multi-room reservation form (reception) */}
      <Route path="/reservations/new" element={<ReservationCreate />} />
      <Route path="/reservations" element={<Reservations />} />

      {/* Activities */}
      <Route path="/room-activity" element={<TodaysActivity />} />
      <Route path="/bar-activity" element={<BarActivity />} />
      <Route path="/stock-activity" element={<StoreActivity />} />
      <Route path="/maintenance-activity" element={<MaintenanceActivity />} />
      <Route path="/kitchen-activity" element={<KitchenActivity />} />


      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/kitchen" element={<KitchenDashboard />} />
    </Routes>
  );
}
