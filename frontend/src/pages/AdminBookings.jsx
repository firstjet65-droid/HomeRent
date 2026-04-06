import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { CalendarDaysIcon, CheckCircleIcon, XCircleIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function AdminBookings() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings?page=${page}&limit=10`);
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [page]);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking deleted');
      fetchBookings();
    } catch (err) {
      toast.error('Error');
    }
  };

  const statusColors = {
    PENDING: 'bg-warning-500/10 text-warning-500',
    CONFIRMED: 'bg-success-500/10 text-success-500',
    CANCELLED: 'bg-danger-500/10 text-danger-500',
  };

  const paymentColors = {
    UNPAID: 'bg-danger-500/10 text-danger-500',
    PAID: 'bg-success-500/10 text-success-500',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 flex items-center gap-3">
        <CalendarDaysIcon className="w-8 h-8 text-primary-500" />
        {t('admin.bookings')}
      </h1>

      <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={dark ? 'bg-surface-800' : 'bg-surface-50'}>
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Listing</th>
                <th className="text-left py-4 px-6 font-semibold">User</th>
                <th className="text-left py-4 px-6 font-semibold">Dates</th>
                <th className="text-left py-4 px-6 font-semibold">Total</th>
                <th className="text-left py-4 px-6 font-semibold">{t('booking.status')}</th>
                <th className="text-left py-4 px-6 font-semibold">Payment</th>
                <th className="text-right py-4 px-6 font-semibold">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={`border-t ${dark ? 'border-surface-800' : 'border-surface-100'}`}>
                    {[...Array(7)].map((_, j) => <td key={j} className="py-4 px-6"><div className="skeleton h-5 w-20" /></td>)}
                  </tr>
                ))
              ) : (
                bookings.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-t ${dark ? 'border-surface-800 hover:bg-surface-800/50' : 'border-surface-100 hover:bg-surface-50'} transition`}
                  >
                    <td className="py-4 px-6 font-medium">{b.listing?.title || '—'}</td>
                    <td className="py-4 px-6">{b.user?.name || '—'}</td>
                    <td className="py-4 px-6 text-xs">
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-semibold">${b.totalPrice}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${paymentColors[b.paymentStatus]}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === 'PENDING' && (
                          <button onClick={() => changeStatus(b.id, 'CONFIRMED')} className="p-2 rounded-lg hover:bg-success-500/10 text-success-500 transition" title="Confirm">
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        {b.status !== 'CANCELLED' && (
                          <button onClick={() => changeStatus(b.id, 'CANCELLED')} className="p-2 rounded-lg hover:bg-warning-500/10 text-warning-500 transition" title="Cancel">
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-danger-500/10 text-danger-500 transition" title="Delete">
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
