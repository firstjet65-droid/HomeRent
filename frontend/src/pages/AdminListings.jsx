import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HomeModernIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function AdminListings() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/listings/all?page=${page}&limit=10`);
      setListings(res.data.listings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [page]);

  const handleApprove = async (id, approved) => {
    try {
      await api.patch(`/listings/${id}/approve`, { approved });
      toast.success(approved ? 'Approved' : 'Denied');
      fetchListings();
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Deleted');
      fetchListings();
    } catch (err) {
      toast.error('Error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 flex items-center gap-3">
        <HomeModernIcon className="w-8 h-8 text-primary-500" />
        {t('admin.listings')}
      </h1>

      <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={dark ? 'bg-surface-800' : 'bg-surface-50'}>
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Listing</th>
                <th className="text-left py-4 px-6 font-semibold">Owner</th>
                <th className="text-left py-4 px-6 font-semibold">Price</th>
                <th className="text-left py-4 px-6 font-semibold">{t('admin.status')}</th>
                <th className="text-right py-4 px-6 font-semibold">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={`border-t ${dark ? 'border-surface-800' : 'border-surface-100'}`}>
                    {[...Array(5)].map((_, j) => <td key={j} className="py-4 px-6"><div className="skeleton h-5 w-24" /></td>)}
                  </tr>
                ))
              ) : (
                listings.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-t ${dark ? 'border-surface-800 hover:bg-surface-800/50' : 'border-surface-100 hover:bg-surface-50'} transition`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={l.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-medium line-clamp-1">{l.title}</p>
                          <p className={`text-xs ${dark ? 'text-surface-500' : 'text-surface-400'}`}>{l.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{l.owner?.name || '—'}</td>
                    <td className="py-4 px-6 font-semibold">${l.price}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        l.approved ? 'bg-success-500/10 text-success-500' : 'bg-warning-500/10 text-warning-500'
                      }`}>
                        {l.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {!l.approved && (
                          <button onClick={() => handleApprove(l.id, true)} className="p-2 rounded-lg hover:bg-success-500/10 text-success-500 transition" title={t('listings.approve')}>
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        {l.approved && (
                          <button onClick={() => handleApprove(l.id, false)} className="p-2 rounded-lg hover:bg-warning-500/10 text-warning-500 transition" title={t('listings.deny')}>
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg hover:bg-danger-500/10 text-danger-500 transition" title={t('listings.delete')}>
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
