import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading message="Checking admin access..." />;

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminRoute;
