import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import Pagination from '../components/Pagination';

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function ListingsPage() {
  const { t } = useTranslation();
  const { dark } = useTheme();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const propertyTypeOptions = [
    { value: '', label: '\u0411\u0430\u0440\u043b\u044b\u0493\u044b' },
    { value: 'APARTMENT', label: '\u041f\u04d9\u0442\u0435\u0440' },
    { value: 'HOUSE', label: '\u0416\u0435\u043a\u0435 \u04af\u0439' },
  ];

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '12');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (propertyType) params.set('propertyType', propertyType);

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.listings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, minPrice, maxPrice, propertyType, sortBy, sortOrder]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, minPrice, maxPrice, propertyType, sortBy, sortOrder]);

  const sortOptions = [
    { value: 'createdAt-desc', label: t('listings.sort_newest') },
    { value: 'price-asc', label: t('listings.sort_price_asc') },
    { value: 'price-desc', label: t('listings.sort_price_desc') },
    { value: 'averageRating-desc', label: t('listings.sort_rating') },
  ];

  const handleSort = (val) => {
    const [by, order] = val.split('-');
    setSortBy(by);
    setSortOrder(order);
  };

  const clearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-all ${
    dark
      ? 'bg-surface-800 border-surface-700 focus:border-primary-500 text-white placeholder:text-surface-500'
      : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900 placeholder:text-surface-400'
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-8">
        {t('listings.title')}
      </h1>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('listings.search')}
            className={`${inputClass} pl-12`}
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => handleSort(e.target.value)}
          className={`${inputClass} lg:w-56`}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          aria-label="\u0422\u04b1\u0440\u0493\u044b\u043d \u04af\u0439 \u0442\u04af\u0440\u0456"
          className={`${inputClass} lg:w-48`}
        >
          {propertyTypeOptions.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
            dark
              ? 'border-surface-700 hover:bg-surface-800 text-surface-300'
              : 'border-surface-200 hover:bg-surface-50 text-surface-600'
          }`}
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className={`p-6 rounded-2xl mb-8 ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('listings.min_price')}</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('listings.max_price')}</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputClass} placeholder="999" />
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-danger-500 hover:bg-danger-500/10 transition">
                <XMarkIcon className="w-5 h-5" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900' : 'bg-white'}`}>
              <div className="skeleton aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-surface-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('listings.no_results')}</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
