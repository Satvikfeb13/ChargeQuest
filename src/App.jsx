import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Stations from "./pages/Stations";
import StationDetails from "./pages/StationDetails";
import Dashboard from "./pages/Dashboard";
import ManageStations from "./pages/ManageStations";
import AllBookings from "./pages/AllBookings";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="stations" element={<Stations />} />
        <Route path="stations/:id" element={<StationDetails />} />
        <Route path="checkout/:bookingId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/stations"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <ManageStations />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AllBookings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
