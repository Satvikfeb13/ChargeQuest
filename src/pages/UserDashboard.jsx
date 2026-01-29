import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, getBookingsByUserId, cancelBooking } from '../api/bookingApi';
import { getAllStations } from '../api/stationApi';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call getMyBookings without any parameters - it uses /me endpoint
      const bookingsRes = await getMyBookings();
      
      const stationsRes = await getAllStations().catch(() => ({ data: [] }));

      const bookingsData = Array.isArray(bookingsRes?.data) 
        ? bookingsRes.data 
        : (bookingsRes?.data?.content || []);

      setBookings(bookingsData);
      setStations(Array.isArray(stationsRes?.data) ? stationsRes.data : (Array.isArray(stationsRes) ? stationsRes : []));
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError(err.response?.data?.message || err.message || "Could not connect to the booking service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStationInfo = (booking) => {
    // 1. Check if nested station object exists and has data
    if (booking.station && (booking.station.station_name || booking.station.stationName || booking.station.name)) {
      return {
        name: booking.station.station_name || booking.station.stationName || booking.station.name,
        address: booking.station.address || 'Location information available on detail page',
        id: booking.station.id || booking.stationId || booking.station_id
      };
    }
    
    // 2. Fallback: Find the station in the stations list using the ID
    const sId = booking.stationId || booking.station_id || booking.station?.id;
    if (sId) {
      const found = stations.find(s => (s.id || s.station_id || s.stationId).toString() === sId.toString());
      if (found) {
        return {
          name: found.station_name || found.stationName || found.name,
          address: found.address,
          id: sId
        };
      }
    }

    // 3. Use stationName from booking directly
    return {
      name: booking.stationName || booking.station_name || 'Charging Session',
      address: booking.stationAddress || booking.address || 'Address not available',
      id: sId
    };
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-2xl mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-4">Dashboard Loading Error</h2>
          <p className="text-slate-300 mb-6">
            We couldn't retrieve your bookings. This usually happens due to a server error.
          </p>
          <div className="bg-black/40 rounded-lg p-4 text-left font-mono text-sm text-red-400 mb-6 overflow-x-auto whitespace-pre">
            {error}
          </div>
          <button 
            onClick={() => fetchData()}
            className="btn-primary px-8 py-3"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => {
    const s = (b.bookingStatus || b.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'CONFIRMED' || s === 'PENDING';
  });
  
  const pastBookings = bookings.filter(b => {
    const s = (b.bookingStatus || b.status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'CANCELLED';
  });

  // Calculate totals robustly using Java field names
  const totalSpent = bookings.reduce((acc, curr) => acc + (curr.totalAmount ?? curr.total_amount ?? curr.totalPrice ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username || user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
      <p className="text-slate-400 mb-8">Here's your charging activity summary.</p>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="card">
          <h3 className="text-slate-400 text-sm font-medium">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2">{bookings.length}</p>
        </div>
        <div className="card">
          <h3 className="text-slate-400 text-sm font-medium">Active Bookings</h3>
          <p className="text-3xl font-bold mt-2 text-primary-400">{activeBookings.length}</p>
        </div>
        <div className="card">
          <h3 className="text-slate-400 text-sm font-medium">Total Spent</h3>
          <p className="text-3xl font-bold mt-2">₹{totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Active Bookings</h2>
      <div className="space-y-4 mb-10">
        {activeBookings.length > 0 ? (
          activeBookings.map((booking) => {
            const stationInfo = getStationInfo(booking);
            return (
              <div key={booking.bookingId || booking.id || booking.booking_id} className="card flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {stationInfo.name}
                  </h3>
                  <div className="space-y-1 text-slate-300 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-slate-500" /> 
                        {stationInfo.address}
                      </div>
                      <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-500" /> {new Date(booking.startTime).toLocaleDateString()}</div>
                      <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-500" /> {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                     <div className="text-xs text-slate-500 uppercase font-semibold">Status</div>
                      <div className="text-green-400 font-bold">{booking.bookingStatus || booking.status}</div>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                        const idToCancel = booking.bookingId || booking.id || booking.booking_id;
                        if (idToCancel) {
                            handleCancel(idToCancel);
                        } else {
                            toast.error("Invalid booking ID");
                            console.error("Booking object missing ID:", booking);
                        }
                    }} 
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center text-slate-500">
             <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>No active bookings. <a href="/stations" className="text-primary-400 hover:underline">Find a station</a> to start charging.</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-400">History</h2>
      <div className="space-y-4">
        {pastBookings.length > 0 ? (
             pastBookings.map(booking => {
                const stationInfo = getStationInfo(booking);
                return (
                  <div key={booking.bookingId || booking.id || booking.booking_id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                    <div>
                        <div className="font-semibold text-white">
                            {stationInfo.name}
                        </div>
                        <div className="text-xs text-slate-500">{new Date(booking.startTime).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        {(() => {
                            const status = (booking.bookingStatus || booking.status || '').toUpperCase();
                            const isRateable = status === 'COMPLETED' || status === 'CANCELLED';
                            
                            return isRateable && (
                                <button 
                                    onClick={() => navigate(`/stations/${stationInfo.id}`)}
                                    className="text-xs px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-all font-semibold"
                                >
                                    Rate Station
                                </button>
                            );
                        })()}
                        <div className={`text-sm font-bold ${(() => {
                            const status = (booking.bookingStatus || booking.status || '').toUpperCase();
                            if (status === 'COMPLETED') return 'text-green-500';
                            if (status === 'ACTIVE' || status === 'CONFIRMED') return 'text-primary-400';
                            return 'text-slate-500';
                        })()}`}>
                            {booking.bookingStatus || booking.status}
                        </div>
                    </div>
                  </div>
                );
              })
        ) : (
            <p className="text-slate-600 italic">No past booking history.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;