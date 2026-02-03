import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../api/bookingApi';
import { createOrder, verifyPayment } from '../api/paymentApi';
import { useRazorpay } from 'react-razorpay';
import { 
    CreditCard, 
    Calendar, 
    Clock, 
    MapPin, 
    Zap, 
    ShieldCheck, 
    AlertCircle, 
    Loader2, 
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';

const Checkout = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { Razorpay } = useRazorpay();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending | success | failed

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await getBookingById(bookingId);
                setBooking(res.data);
            } catch (err) {
                console.error('Error fetching booking:', err);
                setError('Failed to load booking details. It might have expired.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    // Data Extraction (Moved for safety)
    const station = booking?.station || {};
    const stationName = station.stationName || station.station_name || station.name || booking?.stationName || "Charging Station";
    const stationAddress = station.address || booking?.stationAddress || "Address not available";
    
    // Support various naming conventions for price
    const pricePerUnit = station.pricePerUnit || station.price_per_unit || 
                        booking?.pricePerUnit || booking?.station?.pricePerUnit || 0;
    
    const connectorType = booking?.connectorTypeNeeded || booking?.connectorType || 
                         booking?.connector_type || station.categoryName || "Standard";
    
    // Enhanced Duration Logic
    let estimatedTime = booking?.estimatedChargingTime || booking?.duration || 
                       booking?.estimated_charging_time || 0;
    
    if (estimatedTime === 0 && booking?.startTime && booking?.endTime) {
        try {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                estimatedTime = Math.ceil((end - start) / (1000 * 60));
            }
        } catch (e) {
            console.error("Error calculating duration:", e);
        }
    }

    const totalPayable = booking?.totalPrice || booking?.totalAmount || booking?.amount || 0;
    const startTimeFormatted = booking?.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
    const endTimeFormatted = booking?.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
    const dateFormatted = booking?.startTime ? new Date(booking.startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : "Date missing";

    const handlePayment = async () => {
        const rzpSDK = window.Razorpay;
        if (!booking || !rzpSDK) {
            toast.error("Payment gateway is initializing. Please wait 2 seconds.");
            console.warn("Razorpay SDK not found on window object");
            return;
        }
        
        setProcessing(true);
        setPaymentStatus('pending');
        
        try {
            console.log("Creating Razorpay order for booking ID:", bookingId);
            const orderRes = await createOrder(bookingId);
            console.log("Order Creation Response:", orderRes.data);
            
            const razorpayOrder = orderRes.data.order || orderRes.data;

            if (!razorpayOrder || (!razorpayOrder.id && !razorpayOrder.order_id)) {
                throw new Error("Invalid order data received from server");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_S9Iag1mf2dDi1k",
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency || "INR",
                name: "ChargeQuest",
                description: `Charging Session at ${stationName}`,
                order_id: razorpayOrder.id || razorpayOrder.order_id,
                handler: async (response) => {
                    console.log("Razorpay Success Response:", response);
                    setPaymentStatus('verifying');
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: bookingId
                        });
                        console.log("Verification Response:", verifyRes.data);
                        setPaymentStatus('success');
                        toast.success("Payment successful! Slot confirmed.");

                    } catch (err) {
                        console.error("Verification error:", err);
                        setPaymentStatus('failed');
                        toast.error("Payment verification failed.");
                    } finally {
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                        toast("Payment process paused", { icon: "ℹ️" });
                    },
                    escape: true,
                    backdropclose: false
                },
                theme: { color: "#0ea5e9" },
                prefill: { email: booking.userEmail || booking.email || "" }
            };

            const rzp = new rzpSDK(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment Failure Event:", response.error);
                setPaymentStatus('failed');
                toast.error(`Payment Failed: ${response.error.description}`);
                setProcessing(false);
            });
            rzp.open();

        } catch (err) {
            console.error("Payment Logic Error:", err);
            toast.error(err.response?.data?.message || err.message || "Failed to start payment");
            setProcessing(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            // Still attempt to notify backend to free the slot, but redirect immediately
            cancelBooking(bookingId).catch(e => console.error("Silently failed to cancel on backend:", e));
            toast.success("Booking cancelled");
            navigate('/stations');
        } catch (err) {
            navigate('/stations');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Loading session info...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Checkout Error</h2>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <Button onClick={() => navigate('/stations')} variant="primary">Back to Stations</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate('/stations')}
                    className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Stations
                </button>

                <div className="grid md:grid-cols-5 gap-8">
                    <div className="md:col-span-3 space-y-6">
                        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap size={100} className="text-primary-500" />
                            </div>
                            
                            <h1 className="text-3xl font-bold mb-2 text-white">Confirm & Pay</h1>
                            <p className="text-slate-400 mb-8 text-sm italic">Secure your charging session at {stationName}</p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary-500/10 p-2.5 rounded-xl border border-primary-500/20">
                                        <MapPin className="text-primary-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Location</p>
                                        <p className="font-semibold text-white">{stationName}</p>
                                        <p className="text-sm text-slate-400">{stationAddress}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                                        <Calendar className="text-yellow-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Date & Session</p>
                                        <p className="font-semibold text-white">{dateFormatted}</p>
                                        <p className="text-sm text-slate-400 flex items-center gap-2">
                                            <Clock size={14} /> {startTimeFormatted} — {endTimeFormatted} 
                                            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 border border-slate-700">
                                                {estimatedTime} mins
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                                        <Zap className="text-emerald-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Connector Type</p>
                                        <p className="font-semibold text-white">{connectorType}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center gap-2 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs text-blue-400">
                            <ShieldCheck size={16} />
                            Your transaction is secured with end-to-end encryption.
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-full sticky top-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <CreditCard size={20} className="text-primary-500" />
                                Payment Summary
                            </h3>

                            <div className="space-y-4 mb-auto">
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>Base Rate</span>
                                    <span>₹{pricePerUnit}/kWh</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>Estimated Duration</span>
                                    <span>{estimatedTime} mins</span>
                                </div>
                                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Total Payable</p>
                                        <p className="text-4xl font-extrabold text-white tracking-tighter">₹{totalPayable}</p>
                                    </div>
                                    <div className="text-[10px] text-slate-600 font-medium mb-1">Tax Included</div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-3">
                                {paymentStatus === 'success' ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/20">
                                            <CheckCircle2 className="text-white" size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-emerald-400 font-black text-xl tracking-tight">Booking Confirmed!</p>
                                            <p className="text-slate-400 text-sm">Your payment was successful.</p>
                                        </div>
                                        <div className="pt-2 flex flex-col gap-3">
                                            <Button 
                                                onClick={() => navigate(`/stations/${station.id || booking.stationId}`)}
                                                variant="primary"
                                                fullWidth
                                                className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 border-emerald-500"
                                            >
                                                Leave a Review
                                            </Button>
                                            <button 
                                                onClick={() => navigate('/dashboard')}
                                                className="text-slate-500 hover:text-white text-sm font-bold transition-colors"
                                            >
                                                Go to Dashboard
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            size="lg"
                                            className="py-4 shadow-xl shadow-primary-500/20 h-16 flex items-center justify-center gap-2"
                                            onClick={handlePayment}
                                            disabled={processing || paymentStatus === 'verifying'}
                                        >
                                            {processing || paymentStatus === 'verifying' ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Pay Now
                                                </>
                                            )}
                                        </Button>
                                        <button 
                                            onClick={handleCancelBooking}
                                            className="w-full text-slate-500 hover:text-red-400 text-sm font-medium py-2 transition-colors"
                                            disabled={processing}
                                        >
                                            Cancel Booking
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {paymentStatus === 'failed' && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3">
                                <AlertCircle className="text-red-500 shrink-0" size={20} />
                                <div className="text-xs text-red-200">
                                    <p className="font-bold mb-1">Payment Failed</p>
                                    <p className="opacity-80">Please check your payment method and try again.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
