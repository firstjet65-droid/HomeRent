import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HeartIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ListingCard({ listing, favorited: initialFav = false, onFavChange }) {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const { user } = useAuth();
  const [fav, setFav] = useState(initialFav);
  const [imgIdx, setImgIdx] = useState(0);

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Please login first');
    try {
      const res = await api.post('/favorites', { listingId: listing.id });
      setFav(res.data.favorited);
      if (onFavChange) onFavChange(listing.id, res.data.favorited);
    } catch (err) {
      toast.error('Error');
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(listing.averageRating || 0) ? (
      <StarSolid key={i} className="w-4 h-4 text-yellow-400" />
    ) : (
      <StarIcon key={i} className="w-4 h-4 text-surface-300" />
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/listings/${listing.id}`} className="block">
        <div className={`card-hover rounded-2xl overflow-hidden ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={listing.images?.[imgIdx] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'; }}
            />
            {/* Favorite */}
            <button
              onClick={toggleFav}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm shadow-md transition hover:scale-110"
            >
              {fav ? (
                <HeartSolid className="w-5 h-5 text-danger-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-surface-600" />
              )}
            </button>
            {/* Image dots */}
            {listing.images?.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {listing.images.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                    className={`w-2 h-2 rounded-full transition ${i === imgIdx ? 'bg-white w-4' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            )}
            {!listing.approved && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-warning-500 text-xs font-semibold text-surface-900">
                {t('listings.pending_approval')}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center gap-1 mb-1 text-sm">
              <MapPinIcon className="w-4 h-4 text-primary-500" />
              <span className={dark ? 'text-surface-400' : 'text-surface-500'}>{listing.location}</span>
            </div>
            <h3 className="font-semibold text-base mb-2 line-clamp-1">{listing.title}</h3>
            <div className="flex items-center gap-1 mb-3">
              {stars}
              <span className={`text-xs ml-1 ${dark ? 'text-surface-400' : 'text-surface-500'}`}>
                ({listing.reviewsCount || 0})
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl font-bold text-primary-500">${listing.price}</span>
                <span className={`text-sm ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{t('listings.per_night')}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
