import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllStations } from '../api/stationApi';
import { BatteryCharging, Users, DollarSign, Activity, Settings, List } from 'lucide-react';
import Loading from '../components/Loading';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStations: 0,
    activeStations: 0,
    totalBookings: 12,
    revenue: 4250
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stationsRes = await getAllStations();
        const stations = Array.isArray(stationsRes?.data) ? stationsRes.data : (Array.isArray(stationsRes) ? stationsRes : []);
        
        setStats({
          totalStations: stations.length,
          activeStations: stations.filter(s => 
            (s.status?.toUpperCase() === "ACTIVE") || 
            s.available || 
            (s.available_slots ?? s.availableSlots ?? 0) > 0
          ).length,
          totalBookings: 12, // Dummy for now
          revenue: 4250     // Dummy for now
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading message="Loading admin dashboard..." />;

  const quickActions = [
    {
      title: 'Manage Stations',
      description: 'Add, edit, or delete charging stations',
      icon: Settings,
      color: 'primary',
      path: '/admin/stations'
    },
    {
      title: 'View All Bookings',
      description: 'See all user bookings and revenue',
      icon: List,
      color: 'blue',
      path: '/admin/bookings'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome back, {user?.username || user?.name || user?.email?.split('@')[0] || 'Admin'}!</p>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Stations</h3>
            <BatteryCharging className="text-primary-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalStations}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Active Stations</h3>
            <Activity className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.activeStations}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Bookings</h3>
            <Users className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Revenue</h3>
            <DollarSign className="text-yellow-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-yellow-400">₹{stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="card text-left hover:border-primary-500/50 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-${action.color}-500/10 group-hover:bg-${action.color}-500/20 transition-colors`}>
                  <Icon className={`text-${action.color}-400`} size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
