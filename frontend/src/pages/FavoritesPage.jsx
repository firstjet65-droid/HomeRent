import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites')
      .then(res => setFavorites(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFavChange = (listingId, favorited) => {
    if (!favorited) {
      setFavorites(prev => prev.filter(f => f.listing.id !== listingId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 flex items-center gap-3">
        <HeartIcon className="w-8 h-8 text-danger-500" />
        {t('nav.favorites')}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900' : 'bg-white'}`}>
              <div className="skeleton aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <HeartIcon className="w-16 h-16 mx-auto text-surface-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <ListingCard key={fav.id} listing={fav.listing} favorited={true} onFavChange={handleFavChange} />
          ))}
        </div>
      )}
    </div>
  );
}
