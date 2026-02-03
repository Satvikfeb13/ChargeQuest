import { useState } from 'react';
import { createBooking } from '../api/bookingApi';
import { X, Calendar, Clock, Loader2, CreditCard, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ station, onClose, onSuccess, reviews = [] }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [connectorType, setConnectorType] = useState('CCS');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('details'); // details | processing


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Ensure we have a valid station ID
            const stationId = station.id || station.stationId || station.station_id;
            
            if (!stationId) {
                throw new Error("Station information is missing. Please refresh and try again.");
            }

            const start = new Date(`${date}T${startTime}`);
            const end = new Date(`${date}T${endTime}`);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error("Please select a valid date and time.");
            }

            if (end <= start) {
                throw new Error("End time must be after start time");
            }

            // Calculate estimatedChargingTime in minutes
            const estimatedChargingTime = Math.ceil((end - start) / (1000 * 60));

            // ✅ CORRECT PAYLOAD FORMAT - Match Backend BookingRequest
            const bookingPayload = {
                stationId: Number(stationId),
                startTime: `${date}T${startTime}`,
                endTime: `${date}T${endTime}`,
                connectorTypeNeeded: connectorType,
                estimatedChargingTime: Number(estimatedChargingTime)
            };

            console.log('Sending booking payload:', bookingPayload);
            
            // Create booking
            const bookingRes = await createBooking(bookingPayload);

            // Handle response - booking service returns the booking object
            const booking = bookingRes.data;
            
            if (!booking?.bookingId && !booking?.id) {
                throw new Error("Failed to create a valid booking. No ID returned.");
            }
            
            const bookingId = booking.bookingId || booking.id;
            
            // Redirect to separate checkout page
            toast.success("Booking created! Redirecting to checkout...");
            navigate(`/checkout/${bookingId}`);
            onClose();

        } catch (error) {
            console.error('Booking failed:', error);
            
            let msg = 'Failed to book slot';
            if (error.response?.data) {
                const data = error.response.data;
                console.error('Backend error:', data);
                
                if (typeof data === 'string') {
                    msg = data;
                } else if (data.message) {
                    msg = data.message;
                } else if (data.error) {
                    msg = data.error;
                } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    msg = data.errors[0].defaultMessage || data.errors[0].message || 'Validation error';
                }
            } else {
                msg = error.message || 'Something went wrong';
            }
            
            if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('confirmed booking')) {
                msg = "📅 You already have a booking for this time slot! Check your Dashboard.";
            }
            
            toast.error(msg, { duration: 5000 });
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white">Book {station.station_name || station.stationName || station.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {step === 'processing' ? (
                         <div className="text-center py-10">
                            <Loader2 className="animate-spin w-12 h-12 text-primary-500 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-white">Verifying Payment...</p>
                            <p className="text-slate-400 text-sm">Please do not close this window.</p>
                         </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        type="date"
                                        required
                                        className="input-field pl-10 bg-slate-800 border-slate-700 text-white w-full rounded-lg"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <input
                                            type="time"
                                            required
                                            className="input-field pl-10 bg-slate-800 border-slate-700 text-white w-full rounded-lg"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <input
                                            type="time"
                                            required
                                            className="input-field pl-10 bg-slate-800 border-slate-700 text-white w-full rounded-lg"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Connector Type</label>
                                <select
                                    value={connectorType}
                                    onChange={(e) => setConnectorType(e.target.value)}
                                    className="input-field bg-slate-800 border-slate-700 text-white w-full rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                >
                                   <option value="TYPE2">Type 2</option>
<option value="CCS2">CCS</option>
<option value="CHADEMO">CHAdeMO</option>
<option value="GB_T">GB/T</option>
                                </select>
                                <p className="text-[10px] text-slate-500 mt-1">Select the charging port your vehicle uses</p>
                            </div>

                            {/* Price Summary */}
                            {(startTime && endTime && date) && (
                                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Rate</span>
                                        <span>₹{station.pricePerUnit}/unit</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-white">
                                        <span>Estimated Total</span>
                                        <span className="text-primary-400">
                                            ₹{( (new Date(`${date}T${endTime}`) - new Date(`${date}T${startTime}`)) / (1000 * 3600) * station.pricePerUnit ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

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
                                            <Loader2 className="animate-spin w-4 h-4" /> 
                                            {step === 'payment' ? 'Opening Payment...' : 'Processing...'}
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Book & Pay
                                        </span>
                                    )}
                                </Button>
                            </div>

                            {/* Enhanced Reviews Section */}
                            {reviews.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            Community Feedback
                                        </h4>
                                        <div className="bg-primary-500/10 px-2 py-1 rounded-md border border-primary-500/20 text-[10px] font-bold text-primary-400">
                                            {reviews.length} REVIEWS
                                        </div>
                                    </div>
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {reviews.map((review, idx) => (
                                            <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-400">
                                                            {(review.email || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <span className="text-[11px] text-slate-200 font-bold truncate max-w-[120px]">
                                                            {review.email || 'Verified User'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} className={`${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[12px] text-slate-400 italic leading-relaxed pl-8">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default BookingModal;