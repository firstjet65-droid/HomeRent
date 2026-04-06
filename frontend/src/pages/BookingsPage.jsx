import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { CalendarDaysIcon, CreditCardIcon, XCircleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const statusConfig = {
  PENDING: { icon: ClockIcon, color: 'text-warning-500', bg: 'bg-warning-500/10', label: 'booking.pending' },
  CONFIRMED: { icon: CheckCircleIcon, color: 'text-success-500', bg: 'bg-success-500/10', label: 'booking.confirmed' },
  CANCELLED: { icon: XCircleIcon, color: 'text-danger-500', bg: 'bg-danger-500/10', label: 'booking.cancelled' },
};

export default function BookingsPage() {
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

  const handlePay = async (id) => {
    try {
      await api.patch(`/bookings/${id}/pay`);
      toast.success(t('booking.payment_success'));
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success(t('booking.booking_cancelled'));
      fetchBookings();
    } catch (err) {
      toast.error('Error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 flex items-center gap-3">
        <CalendarDaysIcon className="w-8 h-8 text-primary-500" />
        {t('booking.my_bookings')}
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDaysIcon className="w-16 h-16 mx-auto text-surface-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('booking.no_bookings')}</h3>
          <Link to="/listings" className="text-primary-500 hover:text-primary-600 font-medium">Browse listings</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const status = statusConfig[booking.status];
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <Link to={`/listings/${booking.listing?.id}`} className="sm:w-40 h-28 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={booking.listing?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
                        alt=""
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/listings/${booking.listing?.id}`} className="font-semibold hover:text-primary-500 transition">{booking.listing?.title}</Link>
                          <p className={`text-sm mt-1 ${dark ? 'text-surface-400' : 'text-surface-500'}`}>
                            {booking.listing?.location}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <status.icon className="w-4 h-4" />
                          {t(status.label)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <div>
                          <span className={dark ? 'text-surface-500' : 'text-surface-400'}>{t('booking.check_in')}: </span>
                          <span className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className={dark ? 'text-surface-500' : 'text-surface-400'}>{t('booking.check_out')}: </span>
                          <span className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className={dark ? 'text-surface-500' : 'text-surface-400'}>{t('booking.total')}: </span>
                          <span className="font-bold text-primary-500">${booking.totalPrice}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        {booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handlePay(booking.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-success-500 to-success-600 text-white text-sm font-medium hover:from-success-600 hover:to-success-600 transition shadow-md"
                          >
                            <CreditCardIcon className="w-5 h-5" />
                            {t('booking.pay')}
                          </button>
                        )}
                        {booking.paymentStatus === 'PAID' && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-500/10 text-success-500 text-sm font-medium">
                            <CheckCircleIcon className="w-5 h-5" />
                            {t('booking.paid')}
                          </span>
                        )}
                        {booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                              dark ? 'border-surface-700 hover:bg-surface-800 text-surface-300' : 'border-surface-200 hover:bg-surface-50 text-surface-600'
                            }`}
                          >
                            <XCircleIcon className="w-5 h-5" />
                            {t('booking.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
