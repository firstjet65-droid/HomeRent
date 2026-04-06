import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { UsersIcon, ShieldCheckIcon, NoSymbolIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

export default function AdminUsers() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&limit=10&search=${search}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error('Error');
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/users/${id}/status`, { status });
      toast.success('Status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Error');
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-all ${
    dark
      ? 'bg-surface-800 border-surface-700 focus:border-primary-500 text-white placeholder:text-surface-500'
      : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900 placeholder:text-surface-400'
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 flex items-center gap-3">
        <UsersIcon className="w-8 h-8 text-primary-500" />
        {t('admin.users')}
      </h1>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users..."
          className={`${inputClass} max-w-md`}
        />
      </div>

      <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={dark ? 'bg-surface-800' : 'bg-surface-50'}>
              <tr>
                <th className="text-left py-4 px-6 font-semibold">User</th>
                <th className="text-left py-4 px-6 font-semibold">{t('admin.role')}</th>
                <th className="text-left py-4 px-6 font-semibold">{t('admin.status')}</th>
                <th className="text-left py-4 px-6 font-semibold">Joined</th>
                <th className="text-right py-4 px-6 font-semibold">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={`border-t ${dark ? 'border-surface-800' : 'border-surface-100'}`}>
                    <td className="py-4 px-6"><div className="skeleton h-5 w-40" /></td>
                    <td className="py-4 px-6"><div className="skeleton h-5 w-16" /></td>
                    <td className="py-4 px-6"><div className="skeleton h-5 w-16" /></td>
                    <td className="py-4 px-6"><div className="skeleton h-5 w-24" /></td>
                    <td className="py-4 px-6"><div className="skeleton h-5 w-32" /></td>
                  </tr>
                ))
              ) : (
                users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-t ${dark ? 'border-surface-800 hover:bg-surface-800/50' : 'border-surface-100 hover:bg-surface-50'} transition`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className={`text-xs ${dark ? 'text-surface-500' : 'text-surface-400'}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-primary-500/10 text-primary-500' : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        u.status === 'ACTIVE' ? 'bg-success-500/10 text-success-500' : 'bg-danger-500/10 text-danger-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'USER' ? (
                          <button onClick={() => changeRole(u.id, 'ADMIN')} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-500 transition" title={t('admin.make_admin')}>
                            <ShieldCheckIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button onClick={() => changeRole(u.id, 'USER')} className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition" title={t('admin.make_user')}>
                            <UserIcon className="w-5 h-5" />
                          </button>
                        )}
                        {u.status === 'ACTIVE' ? (
                          <button onClick={() => changeStatus(u.id, 'BLOCKED')} className="p-2 rounded-lg hover:bg-danger-500/10 text-danger-500 transition" title={t('admin.block')}>
                            <NoSymbolIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button onClick={() => changeStatus(u.id, 'ACTIVE')} className="p-2 rounded-lg hover:bg-success-500/10 text-success-500 transition" title={t('admin.unblock')}>
                            <ShieldCheckIcon className="w-5 h-5" />
                          </button>
                        )}
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
