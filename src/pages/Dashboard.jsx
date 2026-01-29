import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Robust role-based routing
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
  const isAdmin = userRoles.some(r => {
    const roleStr = r?.toString()?.toUpperCase() || '';
    return roleStr === 'ADMIN' || roleStr === 'ROLE_ADMIN';
  });

  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Default to User Dashboard
  return <UserDashboard />;
};

export default Dashboard;
