import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { MapPinIcon, UserCircleIcon, WifiIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ImageGallery } from '../components/Modal';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';

const amenityLabels = {
  wifi: 'Wi-Fi', parking: 'Parking', kitchen: 'Kitchen', 'air-conditioning': 'A/C',
  tv: 'TV', washer: 'Washer', heating: 'Heating', fireplace: 'Fireplace',
  pool: 'Pool', gym: 'Gym', workspace: 'Workspace', 'mountain-view': 'Mountain View',
  'sea-view': 'Sea View', garden: 'Garden', breakfast: 'Breakfast', 'nature-view': 'Nature View',
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { dark } = useTheme();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));

    if (user) {
      api.get(`/favorites/check/${id}`)
        .then(res => setFav(res.data.favorited))
        .catch(() => {});
    }
  }, [id, user]);

  const handleBook = async () => {
    if (!user) return toast.error('Please login first');
    if (!startDate || !endDate) return toast.error('Select dates');
    setBookingLoading(true);
    try {
      await api.post('/bookings', { listingId: parseInt(id), startDate, endDate });
      toast.success(t('booking.booking_created'));
      setBookingModal(false);
      setStartDate('');
      setEndDate('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    setReviewLoading(true);
    try {
      const res = await api.post('/reviews', { listingId: parseInt(id), rating: reviewRating, comment: reviewComment });
      setListing(prev => ({
        ...prev,
        reviews: [res.data, ...prev.reviews],
        reviewsCount: (prev.reviewsCount || 0) + 1,
      }));
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review submitted!');
      // Refresh listing to get updated rating
      const updated = await api.get(`/listings/${id}`);
      setListing(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleFav = async () => {
    if (!user) return toast.error('Please login first');
    try {
      const res = await api.post('/favorites', { listingId: parseInt(id) });
      setFav(res.data.favorited);
    } catch (err) {
      toast.error('Error');
    }
  };

  const calcNights = () => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-all ${
    dark
      ? 'bg-surface-800 border-surface-700 focus:border-primary-500 text-white'
      : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900'
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-96 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-32 w-full" />
          </div>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) return <div className="text-center py-20">{t('common.error')}</div>;

  const nights = calcNights();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gallery */}
      <ImageGallery images={listing.images} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">{listing.title}</h1>
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="w-5 h-5 text-primary-500" />
                <span className={dark ? 'text-surface-400' : 'text-surface-500'}>{listing.location}</span>
              </div>
            </div>
            <button onClick={toggleFav} className="p-3 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition">
              <HeartIcon className={`w-7 h-7 ${fav ? 'text-danger-500' : 'text-surface-300'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={Math.round(listing.averageRating || 0)} />
            <span className="text-sm font-medium">{(listing.averageRating || 0).toFixed(1)}</span>
            <span className={`text-sm ${dark ? 'text-surface-400' : 'text-surface-500'}`}>({listing.reviewsCount || 0} {t('listings.reviews')})</span>
          </div>

          {/* Host */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl mb-6 ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-surface-50 border border-surface-200'}`}>
            {listing.owner?.avatar ? (
              <img src={listing.owner.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-primary-500" />
            )}
            <div>
              <p className="text-sm text-surface-400">{t('listings.owner')}</p>
              <p className="font-semibold">{listing.owner?.name}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-4">{t('listings.description')}</h2>
            <p className={`leading-relaxed ${dark ? 'text-surface-300' : 'text-surface-600'}`}>{listing.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-4">{t('listings.amenities')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities?.map((a) => (
                <div key={a} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-surface-900' : 'bg-surface-50'}`}>
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span className="text-sm">{amenityLabels[a] || a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-6">{t('review.title')}</h2>

            {/* Review Form */}
            {user && (
              <form onSubmit={handleReview} className={`p-6 rounded-2xl mb-6 ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-surface-50 border border-surface-200'}`}>
                <h3 className="font-semibold mb-4">{t('review.write')}</h3>
                <div className="mb-4">
                  <StarRating rating={reviewRating} onRate={setReviewRating} interactive size="lg" />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t('review.comment')}
                  rows={3}
                  className={`${inputClass} mb-4`}
                  required
                />
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {reviewLoading ? '...' : t('review.submit')}
                </button>
              </form>
            )}

            {listing.reviews?.length === 0 ? (
              <p className={dark ? 'text-surface-400' : 'text-surface-500'}>{t('review.no_reviews')}</p>
            ) : (
              <div className="space-y-4">
                {listing.reviews?.map((review) => (
                  <div key={review.id} className={`p-5 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <UserCircleIcon className="w-10 h-10 text-primary-500" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{review.user?.name}</p>
                        <p className={`text-xs ${dark ? 'text-surface-500' : 'text-surface-400'}`}>{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-auto">
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    <p className={`text-sm ${dark ? 'text-surface-300' : 'text-surface-600'}`}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div>
          <div className={`sticky top-24 p-6 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-lg`}>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-3xl font-bold text-primary-500">${listing.price}</span>
              <span className={`text-sm pb-1 ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{t('listings.per_night')}</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('booking.check_in')}</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('booking.check_out')}</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} min={startDate} />
              </div>
            </div>

            {nights > 0 && (
              <div className={`p-4 rounded-xl mb-4 ${dark ? 'bg-surface-800' : 'bg-surface-50'}`}>
                <div className="flex justify-between text-sm mb-2">
                  <span>${listing.price} x {nights} {t('booking.nights')}</span>
                  <span>${listing.price * nights}</span>
                </div>
                <hr className={`my-2 ${dark ? 'border-surface-700' : 'border-surface-200'}`} />
                <div className="flex justify-between font-bold">
                  <span>{t('booking.total')}</span>
                  <span className="text-primary-500">${listing.price * nights}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={bookingLoading || !startDate || !endDate}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? '...' : t('listings.book_now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
