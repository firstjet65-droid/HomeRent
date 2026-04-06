import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import {
  CurrencyDollarIcon, UsersIcon, HomeModernIcon, CalendarDaysIcon,
  ClockIcon, ExclamationTriangleIcon, ChartBarIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#6366f1', '#f97316', '#22c55e', '#eab308', '#ef4444'];

  const statCards = stats ? [
    { icon: CurrencyDollarIcon, label: t('admin.total_revenue'), value: `$${stats.totalRevenue.toLocaleString()}`, color: 'from-primary-500 to-primary-600' },
    { icon: UsersIcon, label: t('admin.total_users'), value: stats.totalUsers, color: 'from-accent-500 to-accent-600' },
    { icon: HomeModernIcon, label: t('admin.total_listings'), value: stats.totalListings, color: 'from-success-500 to-success-600' },
    { icon: CalendarDaysIcon, label: t('admin.total_bookings'), value: stats.totalBookings, color: 'from-primary-400 to-primary-500' },
    { icon: ClockIcon, label: t('admin.active_users'), value: stats.activeUsers, color: 'from-yellow-500 to-yellow-600' },
    { icon: ExclamationTriangleIcon, label: t('admin.pending_listings'), value: stats.pendingListings, color: 'from-danger-500 to-danger-600' },
  ] : [];

  const adminLinks = [
    { to: '/admin/users', icon: UsersIcon, label: t('admin.users') },
    { to: '/admin/listings', icon: HomeModernIcon, label: t('admin.listings') },
    { to: '/admin/bookings', icon: CalendarDaysIcon, label: t('admin.bookings') },
    { to: '/admin/logs', icon: DocumentTextIcon, label: t('admin.logs') },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="skeleton h-10 w-64 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-primary-500" />
          {t('admin.dashboard')}
        </h1>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all card-hover ${
              dark ? 'bg-surface-900 border border-surface-800 hover:border-primary-500/50' : 'bg-white border border-surface-200 hover:border-primary-500/50'
            }`}
          >
            <link.icon className="w-6 h-6 text-primary-500" />
            <span className="font-medium text-sm">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className={`text-xs mt-1 ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue */}
        <div className={`p-6 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
          <h3 className="text-lg font-bold mb-4">{t('admin.monthly_revenue')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: dark ? '#1e293b' : '#fff',
                  border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className={`p-6 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
          <h3 className="text-lg font-bold mb-4">{t('admin.user_growth')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats?.usersByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: dark ? '#1e293b' : '#fff',
                  border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '12px',
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Listings */}
      <div className={`p-6 rounded-2xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
        <h3 className="text-lg font-bold mb-4">{t('admin.top_listings')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={dark ? 'text-surface-400' : 'text-surface-500'}>
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Bookings</th>
                <th className="text-left py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topListings?.map((listing, i) => (
                <tr key={listing.id} className={`border-t ${dark ? 'border-surface-800' : 'border-surface-100'}`}>
                  <td className="py-3 px-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white`}
                      style={{ background: COLORS[i] }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{listing.title}</td>
                  <td className="py-3 px-4">{listing.bookings}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {listing.rating?.toFixed(1) || '0.0'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
