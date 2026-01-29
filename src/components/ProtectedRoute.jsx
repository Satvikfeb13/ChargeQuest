import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
    const hasRole = userRoles.some(r => {
      const roleStr = r?.toString()?.toUpperCase() || '';
      return roleStr === requiredRole.toUpperCase() || roleStr === `ROLE_${requiredRole.toUpperCase()}`;
    });

    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
