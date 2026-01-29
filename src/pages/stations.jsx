import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStations } from '../store/slices/stationsSlice';
import Loading from '../components/Loading';
import { MapPin, Zap, BatteryCharging, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import AddStationModal from '../components/AddStationModal';
import { deleteStation } from '../api/stationApi';

const Stations = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stations, loading } = useSelector((state) => state.stations);
    const [editStation, setEditStation] = useState(null);

    useEffect(() => {
        dispatch(fetchStations());
    }, [dispatch]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteStation(id);
            toast.success('Station deleted successfully');
            dispatch(fetchStations());
        } catch (error) {
            toast.error('Failed to delete station');
        }
    };

    const handleBookNow = (stationId) => {
        if (!user) {
            toast.error('Please login to book a station');
            navigate('/login');
            return;
        }
        navigate(`/stations/${stationId}`);
    };

    if (loading) return <Loading message="Loading charging stations..." />;

    const displayStations = stations || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 mt-16">
                <h1 className="text-4xl font-bold mb-2 text-white">Charging Stations</h1>
                <p className="text-slate-400">Select a station to view details and book your slot</p>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <BatteryCharging className="text-primary-500" size={20} />
                    <span className="font-semibold text-slate-200">Network Overview</span>
                </div>
                <span className="text-sm text-slate-400">
                    {displayStations.length} station{displayStations.length !== 1 ? 's' : ''} found
                </span>
            </div>

            {/* Stations Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayStations.length > 0 ? (
                    displayStations.map((station) => {
                        const stationName = station.stationName;
                        const price = station.pricePerUnit;
                        const stationId = station.stationId;
                        const availableSlots = station.availableSlots;
                        const totalSlots = station.totalSlots;
                        
                        // Robust availability check
                        const isBookable = 
                            (station.status && station.status.toUpperCase() === "ACTIVE") || 
                            station.available === true || 
                            station.availableSlots > 0;
                        
                        return (
                            <div key={station.stationId} className="card group hover:border-primary-500/50 transition-all duration-300">
                                <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                                    <Zap size={64} className={`transition-colors duration-500 ${isBookable ? 'text-primary-500/20 group-hover:text-primary-500/40' : 'text-slate-700'}`} />
                                    
                                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${
                                        isBookable ? 'bg-green-500 text-white' : 'bg-red-500/80 text-white'
                                    }`}>
                                        {isBookable ? (
                                            <><CheckCircle size={12} /> Available</>
                                        ) : (
                                            <><XCircle size={12} /> Occupied</>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary-400 transition-colors">
                                    {stationName}
                                </h3>

                                <div className="space-y-3 text-sm text-slate-400 mb-5">
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-primary-500" />
                                        <span className="line-clamp-1">{station.address || 'Address not available'}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                                            <span>{station.categoryName}</span>
                                        </div>
                                        <div className="text-primary-400 font-bold text-base">₹{price}/kWh</div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Available Slots</span>
                                        <span className={`text-sm font-bold ${isBookable ? 'text-green-400' : 'text-red-400'}`}>
                                            {availableSlots} / {totalSlots}
                                        </span>
                                    </div>
                                </div>

                                {(() => {
                                    const role = user?.role || user?.authorities?.[0]?.authority || user?.roles?.[0];
                                    const isAdmin = role?.toString().toUpperCase().includes('ADMIN');
                                    
                                    if (isAdmin) {
                                        return (
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    onClick={() => setEditStation(station)}
                                                    className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Edit size={18} /> Update
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(stationId, stationName)}
                                                    className="p-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center group active:scale-95"
                                                    title="Remove Station"
                                                >
                                                    <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Button
                                            onClick={() => handleBookNow(stationId)}
                                            variant={isBookable ? "primary" : "secondary"}
                                            fullWidth
                                            disabled={!isBookable}
                                            className={!isBookable ? "opacity-50 cursor-not-allowed" : ""}
                                        >
                                            {isBookable ? 'Book Now' : 'Currently Unavailable'}
                                        </Button>
                                    );
                                })()}
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                        <BatteryCharging size={48} className="mx-auto mb-4 text-slate-700" />
                        <p className="text-xl font-medium text-slate-300">No charging stations yet</p>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">The network is currently expanding. Please check back soon!</p>
                    </div>
                )}
            </div>

            {editStation && (
                <AddStationModal 
                    station={editStation}
                    onClose={() => setEditStation(null)}
                    onSuccess={() => dispatch(fetchStations())}
                />
            )}
        </div>
    );
};

export default Stations;
