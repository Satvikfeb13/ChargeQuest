import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStations } from '../store/slices/stationsSlice';
import { updateStation, setMaintenanceMode } from '../api/stationApi';
import AddStationModal from '../components/AddStationModal';
import { Plus, Edit, Trash2, BatteryCharging, CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/Button';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const ManageStations = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stations, loading } = useSelector((state) => state.stations);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editStation, setEditStation] = useState(null);

    useEffect(() => {
        console.log('[ManageStations] Loaded Stations:', stations);
    }, [stations]);

    useEffect(() => {
        dispatch(fetchStations(null));
    }, [dispatch]);

    const handleDelete = async (station) => {
        const id = station.stationId || station.id;
        const name = station.stationName || station.name;
        
        if (!window.confirm(`Move "${name}" to Maintenance mode?`)) return;
        
        try {
            const res = await setMaintenanceMode(id);
            console.log('[Maintenance] Response:', res.status, res.data);
            
            if (res.status === 200 || res.status === 201) {
                toast.success('Station update: MAINTENANCE MODE active');
                // Force a short delay before refresh to ensure DB consistency
                setTimeout(() => {
                    dispatch(fetchStations());
                }, 500);
            } else {
                toast.error('Unexpected status code: ' + res.status);
            }
        } catch (error) {
            console.error('Maintenance update failed:', error.response?.data || error.message);
            toast.error(error.response?.data || 'Failed to update station status');
        }
    };

    const handleAddSuccess = () => {
        dispatch(fetchStations(null)); // Refresh list
    };

    if (loading) return <Loading message="Loading stations..." />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Manage Stations</h1>
                    <p className="text-slate-400">Add, edit, or remove charging stations</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Station
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Stations</h3>
                    <p className="text-3xl font-bold">{stations.length}</p>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Available</h3>
                    <p className="text-3xl font-bold text-green-400">
                        {stations.filter(s => (s.status?.toUpperCase() === "ACTIVE") || s.available || s.availableSlots > 0).length}
                    </p>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Occupied</h3>
                    <p className="text-3xl font-bold text-red-400">
                        {stations.filter(s => !((s.status?.toUpperCase() === "ACTIVE") || s.available || s.availableSlots > 0)).length}
                    </p>
                </div>
            </div>

            {/* Stations Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Station</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Slots</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {stations.map((station) => {
                                const sId = station.stationId;
                                return (
                                    <tr key={sId} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold">{station.stationName}</div>
                                            <div className="text-sm text-slate-400">{station.address}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-300">
                                        {station.categoryName}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-primary-400">
                                        ₹{Number(station.pricePerUnit ?? 0).toFixed(1)}/kWh
                                    </td>
                                    <td className="px-6 py-4 text-sm">{station.availableSlots}</td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const rawStatus = (station.status || station.stationStatus || station.station_status || '').toUpperCase();
                                            const isMaint = rawStatus === 'MAINTENANCE';
                                            const isAvailable = !isMaint && (rawStatus === 'ACTIVE' || station.available || (station.availableSlots > 0));

                                            return (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                                    isMaint
                                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                                        : isAvailable 
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                }`}>
                                                    {isMaint ? (
                                                        <><XCircle size={13} className="text-orange-500" /> Maintenance</>
                                                    ) : isAvailable ? (
                                                        <><CheckCircle size={13} /> Available</>
                                                    ) : (
                                                        <><XCircle size={13} /> Occupied</>
                                                    )}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/stations/${sId}`)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <BatteryCharging size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditStation(station)}
                                                className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(station)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Maintenance Mode"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {stations.length === 0 && (
                    <div className="text-center py-12">
                        <BatteryCharging size={48} className="mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500">No stations found. Add your first station!</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <AddStationModal 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {editStation && (
                <AddStationModal 
                    station={editStation}
                    onClose={() => setEditStation(null)}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    );
};

export default ManageStations;
