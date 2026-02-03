import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { getReviewsByStation, getReviewsByStationAlt, getReviewsByStationSingular, addReview, updateReview, deleteReview } from '../api/reviewApi';


import BookingModal from '../components/BookingModal';
import Loading from '../components/Loading';
import Button from '../components/Button';
import { MapPin, Battery, DollarSign, Clock, ListChecks, ArrowLeft, Zap, Star, Edit, Trash2, Loader2 } from 'lucide-react';
import { getStationById, updateStation, setMaintenanceMode } from '../api/stationApi';
import AddStationModal from '../components/AddStationModal';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/bookingApi';
import toast from 'react-hot-toast';


// Main component for viewing station details and handling reviews
const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', bookingId: null });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [refreshingReviews, setRefreshingReviews] = useState(false);


  const fetchReviews = async (stationId = id) => {
    const parse = (res) => {
      const data = res?.data;
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data?.content && Array.isArray(data.content)) return data.content;
      if (data?.reviews && Array.isArray(data.reviews)) return data.reviews;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.reviewList && Array.isArray(data.reviewList)) return data.reviewList;
      if (data?.reviewsList && Array.isArray(data.reviewsList)) return data.reviewsList;
      if (data?.allReviews && Array.isArray(data.allReviews)) return data.allReviews;
      
      // If the backend returns a single review object instead of an array
      if (data?.reviewId || data?.id) return [data];
      
      return [];
    };

    try {
      setRefreshingReviews(true);
      
      // Use ONLY the ID from the URL as the source of truth
      const targetId = stationId || id;
      
      console.log(`[Reviews] Fetching reviews for station: ${targetId}`);
      const res = await getReviewsByStation(targetId).catch((err) => {
          console.warn(`Fetch failed for ID ${targetId}: ${err.message}`);
          return null;
      });
      
      const list = parse(res);
      console.log(`[Reviews] Successful fetch for ${targetId}:`, list);
      setReviews(list);
      return list;
    } catch (err) {
      console.error('[Reviews] Global error fetching reviews:', err);
      return [];
    } finally {
      setRefreshingReviews(false);
    }
  };

  const handleDelete = async () => {
    if (!station) return;
    const name = station.stationName || station.name || "this station";
    if (!window.confirm(`Move "${name}" to Maintenance mode?`)) return;
    try {
      await setMaintenanceMode(id);
      toast.success('Station update: MAINTENANCE MODE active');
      
      // Refresh local station data
      const stationRes = await getStationById(id);
      setStation(stationRes.data);
    } catch (error) {
      console.error('Maintenance update failed:', error);
      toast.error('Failed to update station status');
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch ONLY station details here. Reviews are handled by the fetchReviews helper 
        // below which has automatic safety fallbacks to prevent page crashes.
        const stationRes = await getStationById(id);

        const stationData = stationRes.data;
        setStation(stationData);
        
        // Use the primary fetcher only. Fallbacks were causing ID mismatches (ID 1 vs 12).
        await fetchReviews(id);

        
        // If user is logged in, fetch their bookings to find an eligible bookingId for review
        if (user) {
          try {
            const uid = user.id || user.userId || user.user_id;
            const bookingsRes = await getMyBookings(uid);
            const bookingsData = Array.isArray(bookingsRes?.data) ? bookingsRes.data : (bookingsRes?.data?.content || []);
            const eligibleBookings = bookingsData.filter(b => {
              const bStationId = (b.station?.id || b.stationId || b.station_id)?.toString();
              const currentStationId = id?.toString();
              const status = (b.bookingStatus || b.status || '').toUpperCase();
              
              return bStationId === currentStationId && 
                     ['COMPLETED', 'ACTIVE', 'CANCELLED', 'CONFIRMED', 'PAID', 'PENDING', 'BOOKED'].includes(status);

            });
            setUserBookings(eligibleBookings);
          } catch (bookingErr) {
            console.error('Failed to fetch user bookings for status check:', bookingErr);
            // Non-critical failure, don't set global error
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load station details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (location.hash === '#review-form' && !loading && station) {
      const element = document.getElementById('review-form');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, [location.hash, loading, station]);


  if (loading) return <Loading message="Loading station details..." />;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!station) return <div className="text-center py-20">Station not found</div>;

  const isMaintenance = (station.status || '').toUpperCase() === "MAINTENANCE";
  const isOnline = !isMaintenance && (station.status?.toUpperCase() === "ACTIVE" || station.available || station.availableSlots > 0);


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave a review');
    
    const stateBookingId = location.state?.bookingId;
    const currentUserId = user?.id || user?.userId || user?.user_id;
    
    // Check which bookings this user has already reviewed
    const myReviewedBookingIds = reviews
      .filter(r => {
        const rUserId = r.userId || r.user_id || r.user?.id || r.user?.userId;
        return rUserId && currentUserId && (rUserId.toString() === currentUserId.toString());
      })
      .map(r => (r.bookingId || r.booking_id || r.booking?.id)?.toString());

    // Prioritize a booking that hasn't been reviewed yet
    const unusedBooking = userBookings?.find(b => {
        const bId = (b.id || b.bookingId || b.booking_id)?.toString();
        return bId && !myReviewedBookingIds.includes(bId);
    });

    const targetBooking = unusedBooking || (userBookings && userBookings.length > 0 ? userBookings[0] : null);
    const latestBookingId = stateBookingId || targetBooking?.id || targetBooking?.bookingId || targetBooking?.booking_id;
    
    if (!latestBookingId && !editingReviewId) {
      console.warn('[Review] No eligible booking found for station:', id);
      return toast.error('To leave a review, you must have a booking history with this station.');
    }


    setSubmittingReview(true);
    const officialStationId = station?.stationId || station?.id || id;
    // currentUserId is already defined above
    
    const reviewPayload = {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
      
      // 1. Primary Flat IDs (CamelCase)
      stationId: Number(officialStationId),
      bookingId: Number(reviewForm.bookingId || latestBookingId),
      userId: Number(currentUserId),
      
      // 2. Database Column Names (Snake_case)
      station_id: Number(officialStationId),
      booking_id: Number(reviewForm.bookingId || latestBookingId),
      user_id: Number(currentUserId),
      
      // 3. Nested Objects (For templates that use Entity DTOs)
      station: { id: Number(officialStationId) },
      booking: { id: Number(reviewForm.bookingId || latestBookingId) },
      user: { id: Number(currentUserId) }
    };

    console.log('[Review] Submitting Payload:', reviewPayload);

    try {
      if (editingReviewId) {
        const res = await updateReview(editingReviewId, reviewPayload);
        console.log('[Review] Update Response:', res.data);
        
        if (res.data?.status === 'FAILED') {
            return toast.error(res.data.message || 'Failed to update review');
        }
        toast.success('Review updated in system!');
      } else {
        const res = await addReview(reviewPayload);
        console.log('[Review] Post Response:', res.data);
        
        if (res.data?.status === 'FAILED') {
            return toast.error(res.data.message || 'Payment not recognized or review already exists');
        }
        
        if (res.status === 200 || res.status === 201 || res.data?.status === 'SUCCESS') {
            toast.success('Review successfully saved to table!');
        } else {
            toast.warn('Review status was unexpected. Check your dashboard.');
        }
      }
      
      setReviewForm({ rating: 5, comment: '', bookingId: null });
      setEditingReviewId(null);
      
      // Use strictly the URL ID for the refresh to avoid ID 1 vs 12 confusion
      fetchReviews(id);
      
      // Verification refresh
      setTimeout(() => fetchReviews(id), 1500);





      
    } catch (err) {
      console.error('Review submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.reviewId || review.id);
    setReviewForm({
      rating: review.rating,
      comment: review.comment,
      bookingId: review.bookingId || review.booking_id
    });
    // Scroll to form
    window.scrollTo({ top: document.getElementById('review-form')?.offsetTop - 100, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Stations
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden mb-6 shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <Battery size={120} className="text-slate-700/50" />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/10 flex items-center gap-2">
                {isMaintenance ? (
                  <><span className="text-orange-500 font-bold">⚠</span> Maintenance</>
                ) : isOnline ? (
                  <><span className="text-green-500 font-bold">✓</span> Available</>
                ) : (
                  <><span className="text-red-500 font-bold">✗</span> Occupied</>
                )}
              </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">{station.stationName}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                <Star className="text-yellow-500 fill-yellow-500" size={18} />
                <span className="text-xl font-bold text-white">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm">({reviews.length})</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-slate-400 mb-6">
            <MapPin className="w-5 h-5 mr-2 text-primary-500" />
            {station.address}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-sm mb-1 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-yellow-500" /> Unit Price
              </div>
              <div className="text-lg font-semibold">
                ₹{station.pricePerUnit ?? 0}/kWh
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-sm mb-1 flex items-center">
                <Battery className="w-4 h-4 mr-1" /> Power
              </div>
              <div className="text-lg font-semibold">{station.categoryName}</div>
            </div>
          </div>

          <div className="mb-8">
             <h3 className="text-xl font-bold mb-4 flex items-center">
               <ListChecks className="mr-2 text-primary-500" /> Amenities
             </h3>
             <ul className="grid grid-cols-2 gap-2">
                {station.amenities?.map((item, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                    {item}
                  </li>
                )) || <p className="text-slate-500">No specific amenities listed.</p>}
             </ul>
          </div>

          {(() => {
            const role = user?.role || user?.authorities?.[0]?.authority || user?.roles?.[0];
            const isAdmin = role?.toString().toUpperCase().includes('ADMIN');
            
            if (isAdmin) {
              return (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={22} /> Edit Station
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="px-6 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center group active:scale-95"
                    title="Maintenance Mode"
                  >
                    <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              );
            }


            return (
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  onClick={() => setShowBookingModal(true)}
                  disabled={!isOnline}
                >
                  {isMaintenance ? 'Under Maintenance' : isOnline ? 'Book Charging Slot' : 'Currently Unavailable'}
                </Button>
              </div>
            );
          })()}
        </div>

        {/* Station Info Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Zap className="mr-2 text-yellow-500" /> Station Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`font-semibold ${isMaintenance ? 'text-orange-400' : isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isMaintenance ? 'Maintenance' : isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Slots</span>
                <span className="font-semibold text-green-400">{station.availableSlots}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Connector Type</span>
                <span className="font-semibold">{station.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Charging Speed</span>
                <span className="font-semibold">50 kW</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Clock className="mr-2 text-primary-500" /> Operating Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Mon - Fri</span>
                <span className="font-semibold">24/7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sat - Sun</span>
                <span className="font-semibold">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Full-width Reviews Section */}
      <div className="mt-12 pt-12 border-t border-slate-800">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Review Submission Form */}
          <div className="lg:col-span-1">
            <div id="review-form" className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 sticky top-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Star className="text-yellow-500" size={28} />
                {editingReviewId ? 'Edit Your Review' : 'Leave a Review'}
              </h3>
              
              {!user ? (
                <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                  <p className="text-slate-400 mb-6">You must be logged in to share your experience.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/login')}
                    className="px-8 shadow-lg shadow-primary-500/20"
                  >
                    Login to Review
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-semibold text-slate-400">Your Rating:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="transition-all hover:scale-125 active:scale-90"
                        >
                          <Star 
                            size={28} 
                            className={`${star <= reviewForm.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    required
                    placeholder="Share your experience with this charging station..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white min-h-[150px] focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-600"
                  />
                  <div className="flex gap-3">
                     <Button 
                      type="submit" 
                      variant="primary" 
                      fullWidth 
                      size="lg"
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Post Review'}
                    </Button>
                    {editingReviewId && (
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          setEditingReviewId(null);
                          setReviewForm({ rating: 5, comment: '', bookingId: null });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* Right: Reviews List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-3xl font-extrabold flex items-center gap-3">
                What Users Say
                <span className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-sm font-bold border border-primary-500/20">
                  {reviews.length}
                </span>
                {refreshingReviews && <Loader2 className="animate-spin text-primary-500" size={24} />}
              </h3>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5">
                  <Star className="text-yellow-500 fill-yellow-500" size={18} />
                  <span className="text-xl font-bold text-white">
                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-sm">/ 5.0</span>
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="grid gap-6">
                {reviews.map((review, idx) => {
                  const reviewId = review.reviewId || review.id || `review-${idx}`;
                  const currentUserId = user?.id || user?.userId || user?.user_id;
                  const currentEmail = user?.email;
                  
                  const reviewUserId = review.userId || review.user_id || review.user?.id || review.user?.userId;

                  const reviewEmail = review.email || review.userEmail || review.user_email || review.user?.email;

                  const role = user?.role || user?.authorities?.[0]?.authority || user?.roles?.[0];
                  const isAdmin = user && role?.toString().toUpperCase().includes('ADMIN');
                  
                  // Only allow ownership for logged in users
                  const isOwnReview = user && (
                                    (currentUserId && reviewUserId && reviewUserId.toString() === currentUserId.toString()) ||
                                    (currentEmail && reviewEmail && reviewEmail.toLowerCase() === currentEmail.toLowerCase()) ||
                                    (user?.username && (review.userName || review.username) && user.username.toLowerCase() === (review.userName || review.username)?.toLowerCase())
                  );

                  
                  return (
                    <div key={reviewId} className="p-8 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-primary-500/20 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Star size={80} className="text-white" />
                      </div>
                      
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center text-primary-400 font-black text-xl border border-white/10 shadow-inner">
                            {(reviewEmail || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-white mb-1">{reviewEmail || 'Verified User'}</div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={`review-star-${reviewId}-${i}`} 
                                  size={16} 
                                  className={`${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`} 
                                />
                              ))}
                            </div>

                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-bold bg-black/20 px-3 py-1 rounded-full border border-white/5">
                          {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 leading-relaxed text-lg italic relative z-10">
                        "{review.comment}"
                      </p>
                      
                      {(isOwnReview || isAdmin) && (
                        <div className="flex gap-4 pt-6 mt-6 border-t border-white/5 relative z-10">
                          {isOwnReview && (
                            <button 
                              onClick={() => handleEditClick(review)}
                              className="text-xs font-bold text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 px-5 py-2.5 rounded-xl border border-primary-500/20 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-500/5 group/btn"
                            >
                              <Edit size={14} className="group-hover/btn:rotate-12 transition-transform" /> Edit Review
                            </button>
                          )}
                          <button 
                            onClick={() => handleReviewDelete(reviewId)}
                            className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 rounded-xl border border-red-500/20 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/5 group/btn"
                          >
                            <Trash2 size={14} className="group-hover/btn:rotate-12 transition-transform" /> {isAdmin && !isOwnReview ? 'Admin Delete' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/5">
                  <Star size={40} className="text-slate-600" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-400">No reviews yet</div>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Be the first to share your experience with {station.stationName}! 
                    Help other EV drivers find the best charging spots.
                  </p>
                </div>
                <button 
                  onClick={() => fetchReviews()}
                  className="px-6 py-2 rounded-full text-sm font-bold text-primary-400 hover:bg-primary-400/10 border border-primary-400/20 transition-all"
                >
                  Refresh Reviews
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal 
          station={station} 
          reviews={reviews}
          onClose={() => setShowBookingModal(false)} 
          onSuccess={() => {
              navigate('/dashboard');
          }}
        />
      )}
      {showEditModal && (
        <AddStationModal 
          station={station} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={() => {
            setShowEditModal(false);
            window.location.reload(); // Refresh to see changes
          }}
        />
      )}
    </div>
  );
};

export default StationDetails;
