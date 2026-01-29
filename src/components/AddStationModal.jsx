    import { useState, useEffect } from 'react';
    import { X, Loader2, MapPin, Zap, DollarSign } from 'lucide-react';
    import { createStation, updateStation } from '../api/stationApi';
    import toast from 'react-hot-toast';
    import Button from './Button';

    const AddStationModal = ({ station, onClose, onSuccess }) => {
        const isEditMode = !!station;
        
        const [formData, setFormData] = useState({
            stationName: '',
            address: '',
            latitude: '',
            longitude: '',
            pricePerUnit: '',
            totalSlots: 5,
            categoryId: 1, // Default category
            description: '',
            type: 'Fast'
        });
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            if (station) {
                setFormData({
                    stationName: station.station_name || station.stationName || station.name || '',
                    address: station.address || '',
                    latitude: station.latitude || '',
                    longitude: station.longitude || '',
                    pricePerUnit: station.price_per_unit ?? station.pricePerUnit ?? station.price ?? '',
                    totalSlots: station.total_slots ?? station.totalSlots ?? (station.availableSlots || 5),
                    categoryId: station.category_id || station.categoryId || 1,
                    description: station.description || '',
                    type: station.type || 'Fast'
                });
            }
        }, [station]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                const payload = {
                    stationName: formData.stationName,
                    address: formData.address,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    pricePerUnit: parseFloat(formData.pricePerUnit),
                    totalSlots: parseInt(formData.totalSlots),
                    categoryId: parseInt(formData.categoryId),
                    description: formData.description,
                    type: formData.type
                };

                if (isEditMode) {
                    await updateStation(station.id || station.stationId, payload);
                    toast.success('Station updated successfully!');
                } else {
                    await createStation(payload);
                    toast.success('Station added successfully!');
                }
                
                onSuccess();
                onClose();
            } catch (error) {
                console.error('Failed to save station', error);
                toast.error(isEditMode ? 'Failed to update station' : 'Failed to add station');
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
                        <h3 className="text-lg font-bold">{isEditMode ? 'Edit Station' : 'Add New Station'}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Station Name</label>
                            <input
                                type="text"
                                name="stationName"
                                required
                                className="input-field"
                                placeholder="e.g. Downtown Fast Charge"
                                value={formData.stationName}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    className="input-field pl-10"
                                    placeholder="e.g. 123 Main Street, Nagpur"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Charger Type</label>
                                <select
                                    name="type"
                                    className="input-field"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="CCS2">CCS2 (DC Fast)</option>
                                    <option value="TYPE2">Type 2 (AC)</option>
                                    <option value="CHADEMO">CHAdeMO</option>
                                    <option value="GB_T">GB/T</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        required
                                        className="input-field px-2"
                                        placeholder="21.1"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        required
                                        className="input-field px-2"
                                        placeholder="79.1"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Unit Price</label>
                                <div className="relative">
                                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="pricePerUnit"
                                        required
                                        className="input-field pl-10"
                                        placeholder="10.00"
                                        value={formData.pricePerUnit}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Total Slots</label>
                                <input
                                    type="number"
                                    name="totalSlots"
                                    required
                                    min="1"
                                    className="input-field"
                                    placeholder="5"
                                    value={formData.totalSlots}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                            <textarea
                                name="description"
                                className="input-field"
                                placeholder="Additional station information..."
                                rows="2"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin w-4 h-4" /> Saving...
                                    </span>
                                ) : (
                                    isEditMode ? 'Update Station' : 'Add Station'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    export default AddStationModal;
