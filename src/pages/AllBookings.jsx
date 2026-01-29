import { useEffect, useState } from 'react';
import { getAllBookings } from '../api/adminApi';
import { getAllStations } from '../api/stationApi';
import Loading from '../components/Loading';
import { Calendar, Clock, MapPin, User, Zap } from 'lucide-react';

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New error state
    const [filter, setFilter] = useState('all'); // all, active, completed

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null); // Reset error on new fetch
            try {
                // Fetch bookings. If this fails, the catch block will handle it.
                const bookingsRes = await getAllBookings();
                
                // Fetch stations. If this fails, we still want to display bookings,
                // so we catch the error here and return an empty array.
                const stationsRes = await getAllStations().catch(err => {
                    console.error('Stations Fetch Error:', err);
                    return { data: [] };
                });
                
                console.log('Bookings API Response:', bookingsRes.data);
                
                // Handle both flat arrays and paginated responses (data.content)
                const bookingsData = Array.isArray(bookingsRes.data) 
                    ? bookingsRes.data 
                    : (bookingsRes.data?.content || []);
                
                setBookings(bookingsData);
                setStations(Array.isArray(stationsRes?.data) ? stationsRes.data : (Array.isArray(stationsRes) ? stationsRes : []));
            } catch (err) {
                console.error('Admin Fetch Error:', err);
                setError({
                    status: err.response?.status,
                    message: err.response?.data?.message || err.message || "Failed to fetch bookings from server"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStationInfo = (booking) => {
        if (booking.station && (booking.station.station_name || booking.station.stationName || booking.station.name)) {
            return {
                name: booking.station.station_name || booking.station.stationName || booking.station.name,
                address: booking.station.address || 'Address on file',
                id: booking.station.id || booking.stationId || booking.station_id
            };
        }
        const sId = booking.stationId || booking.station_id || booking.station?.id;
        if (sId) {
            const found = stations.find(s => (s.id || s.station_id || s.stationId || s.station_id)?.toString() === sId.toString());
            if (found) {
                return {
                    name: found.station_name || found.stationName || found.name,
                    address: found.address,
                    id: sId
                };
            }
        }
        return { 
            name: booking.station_name || 'Charging Session', 
            address: booking.address || 'Address not available',
            id: sId
        };
    };

    if (error) {
        const isForbidden = error.status === 403;
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">
                        {isForbidden ? 'Access Denied (403)' : `Connection Error (${error.status || '500'})`}
                    </h2>
                    <p className="text-slate-300 mb-6">
                        {isForbidden 
                            ? "You don't have administrative privileges to view this page. Please log in as an administrator."
                            : "The server encountered an issue while retrieving the booking list. This could be due to a backend crash or a database recursion loop."
                        }
                    </p>
                    <div className="bg-black/40 rounded-lg p-4 text-left font-mono text-sm text-red-400 mb-6 overflow-x-auto">
                        GET /api/v1/bookings {'->'} {isForbidden ? 'Forbidden' : 'Internal Server Error'}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="btn-primary px-8 py-3"
                        >
                            Retry Connection
                        </button>
                        {isForbidden && (
                             <button 
                             onClick={() => window.location.href = '/login'}
                             className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                         >
                             Log in as Admin
                         </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <Loading message="Loading all bookings..." />;

    const filteredBookings = bookings.filter(b => {
        const s = (b.bookingStatus || b.status || '').toUpperCase();
        if (filter === 'active') return s === 'ACTIVE' || s === 'CONFIRMED' || s === 'PENDING';
        if (filter === 'completed') return s === 'COMPLETED' || s === 'CANCELLED';
        return true;
    });

    const stats = {
        total: bookings.length,
        active: bookings.filter(b => {
            const s = (b.status || b.bookingStatus || '').toUpperCase();
            return s === 'ACTIVE' || s === 'CONFIRMED' || s === 'PENDING';
        }).length,
        completed: bookings.filter(b => {
            const s = (b.status || b.bookingStatus || '').toUpperCase();
            return s === 'COMPLETED' || s === 'CANCELLED';
        }).length,
        // Be very defensive with field names so revenue always adds up
        revenue: bookings.reduce((sum, b) => {
            const amount =
                b.totalAmount ??
                b.total_amount ??
                b.totalPrice ??
                b.total_price ??
                0;
            return sum + (typeof amount === 'number' ? amount : Number(amount) || 0);
        }, 0)
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-2">All Bookings</h1>
            <p className="text-slate-400 mb-8">View and manage all user bookings</p>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Bookings</h3>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Active</h3>
                    <p className="text-3xl font-bold text-primary-400">{stats.active}</p>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Completed</h3>
                    <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-primary-400">₹{stats.revenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'active', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            filter === f 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.map((booking) => {
                    const stationInfo = getStationInfo(booking);
                    const status = booking.status || booking.bookingStatus || 'PENDING';
                    const startTime = booking.startTime || booking.start_time;
                    const endTime = booking.endTime || booking.end_time;
                    const totalPriceRaw =
                        booking.totalAmount ??
                        booking.total_amount ??
                        booking.totalPrice ??
                        booking.total_price ??
                        0;
                    const totalPrice = typeof totalPriceRaw === 'number'
                        ? totalPriceRaw
                        : Number(totalPriceRaw) || 0;
                    const bId = booking.id || booking.bookingId || booking.booking_id;
                    
                    // Prefer displaying email; fall back to username/name if email missing
                    const userEmail =
                        booking.user?.email ||
                        booking.email ||
                        booking.user_email ||
                        null;

                    const userName =
                        userEmail ||
                        booking.user?.username ||
                        booking.user?.name ||
                        booking.username ||
                        booking.user_name ||
                        '';

                    return (
                        <div key={bId} className="card">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold">{stationInfo.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            (status === 'ACTIVE' || status === 'CONFIRMED' || status === 'PENDING')
                                                ? 'bg-primary-500/20 text-primary-400'
                                                : 'bg-green-500/20 text-green-400'
                                        }`}>
                                            {status}
                                        </span>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-300">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-slate-500" />
                                            {userName}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                                            {stationInfo.address}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                            {startTime ? new Date(startTime).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-slate-500" />
                                            {startTime ? new Date(startTime).toLocaleTimeString() : ''} - {endTime ? new Date(endTime).toLocaleTimeString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 mb-1">Total Amount</div>
                                        <div className="text-2xl font-bold text-primary-400 flex items-center justify-end">
                                            ₹{totalPrice.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredBookings.length === 0 && (
                    <div className="card text-center py-12 text-slate-500">
                        No {filter !== 'all' ? filter : ''} bookings found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllBookings;
