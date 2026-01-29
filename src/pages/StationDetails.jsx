import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStationById } from '../api/stationApi';
import { getReviewsByStation, addReview, updateReview, deleteReview } from '../api/reviewApi';
import BookingModal from '../components/BookingModal';
import Loading from '../components/Loading';
import Button from '../components/Button';
import { MapPin, Battery, DollarSign, Clock, ListChecks, ArrowLeft, Zap, Star, Edit, Trash2 } from 'lucide-react';
import { deleteStation } from '../api/stationApi';
import AddStationModal from '../components/AddStationModal';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/bookingApi';
import toast from 'react-hot-toast';


const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const fetchReviews = async () => {
    try {
      const reviewsRes = await getReviewsByStation(id);
      console.log(`Fetched reviews for station ${id}:`, reviewsRes.data);
      
      let reviewsData = [];
      const data = reviewsRes.data;
      
      if (Array.isArray(data)) {
        reviewsData = data;
      } else if (data?.content && Array.isArray(data.content)) {
        reviewsData = data.content;
      } else if (data?.reviews && Array.isArray(data.reviews)) {
        reviewsData = data.reviews;
      } else if (data?.data && Array.isArray(data.data)) {
        reviewsData = data.data;
      } else {
        reviewsData = [];
      }
        
      setReviews(reviewsData);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${station.stationName}"?`)) return;
    try {
      await deleteStation(id);
      toast.success('Station deleted successfully');
      navigate('/stations');
    } catch (error) {
      toast.error('Failed to delete station');
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [stationRes, reviewsRes] = await Promise.all([
          getStationById(id),
          getReviewsByStation(id)
        ]);
        setStation(stationRes.data);
        
        const rData = reviewsRes.data;
        const reviewsData = Array.isArray(rData) 
          ? rData 
          : (rData?.content 
              || rData?.reviews 
              || rData?.data 
              || rData?.reviewList 
              || []);
          
        setReviews(reviewsData);
        
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
                     (status === 'COMPLETED' || status === 'ACTIVE' || status === 'CANCELLED');
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

  if (loading) return <Loading message="Loading station details..." />;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!station) return <div className="text-center py-20">Station not found</div>;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave a review');
    
    const latestBookingId = userBookings[0]?.id || userBookings[0]?.bookingId || userBookings[0]?.booking_id;
    
    if (!latestBookingId && !editingReviewId) {
      return toast.error('You need a previous booking at this station to leave a review.');
    }

    setSubmittingReview(true);
    const reviewPayload = {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
      stationId: isNaN(Number(id)) ? id : Number(id),
      bookingId: Number(reviewForm.bookingId || latestBookingId) 
    };

    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, reviewPayload);
        toast.success('Review updated!');
      } else {
        await addReview(reviewPayload);
        toast.success('Review posted!');
      }
      
      setReviewForm({ rating: 5, comment: '', bookingId: null });
      setEditingReviewId(null);
      
      // Fetch immediately and twice more with delay to ensure consistency
      await fetchReviews();
      setTimeout(fetchReviews, 500);
      setTimeout(fetchReviews, 2000);
      
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
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/10">
                {(station.status?.toUpperCase() === "ACTIVE" || station.available || station.availableSlots > 0) ? '✓ Available' : '✗ Occupied'}
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
                    title="Remove Station"
                  >
                    <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              );
            }

            const isOnline = (station.status?.toUpperCase() === "ACTIVE" || station.available || station.availableSlots > 0);

            return (
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  onClick={() => setShowBookingModal(true)}
                  disabled={!isOnline}
                >
                  {isOnline ? 'Book Charging Slot' : 'Currently Unavailable'}
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
                <span className={`font-semibold ${(station.status?.toUpperCase() === "ACTIVE" || station.available || station.availableSlots > 0) ? 'text-green-400' : 'text-red-400'}`}>
                  {(station.status?.toUpperCase() === "ACTIVE" || station.available || station.availableSlots > 0) ? 'Online' : 'Offline'}
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

          <div className="card space-y-6">
            <div id="review-form" className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                {editingReviewId ? 'Edit Your Review' : 'Leave a Review'}
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={24} 
                          className={`${star <= reviewForm.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white min-h-[100px] focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <div className="flex gap-2">
                   <Button 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
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
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  What Users Say ({reviews.length})
                </h3>
                {reviews.length > 0 && (
                  <div className="text-sm font-semibold text-primary-400">
                    Average: {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.map((review) => {
                    const reviewId = review.reviewId || review.id;
                    const currentUserId = user?.id || user?.userId || user?.user_id;
                    const currentEmail = user?.email;
                    
                    const reviewUserId = review.userId || review.user_id || review.user?.id || review.user?.userId;
                    const reviewEmail = review.email || review.userEmail || review.user_email || review.user?.email;

                    const isOwnReview = (currentUserId && reviewUserId && reviewUserId.toString() === currentUserId.toString()) ||
                                      (currentEmail && reviewEmail && reviewEmail.toLowerCase() === currentEmail.toLowerCase());
                    
                    return (
                      <div key={reviewId} className="p-5 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-primary-500/20 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold border border-primary-500/20">
                              {(reviewEmail || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{reviewEmail || 'Verified User'}</div>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    className={`${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"{review.comment}"</p>
                        
                        {isOwnReview && (
                          <div className="flex gap-4 pt-3 mt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditClick(review)}
                              className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1.5"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => handleReviewDelete(reviewId)}
                              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-3">
                  <Star size={40} className="text-slate-700" />
                  <div className="text-slate-400 font-medium">No reviews yet</div>
                  <p className="text-xs text-slate-500">Be the first to share your charging experience!</p>
                </div>
              )}
            </div>
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
