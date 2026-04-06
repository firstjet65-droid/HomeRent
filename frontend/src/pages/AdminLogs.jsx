import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const actionColors = {
  REGISTER: 'bg-success-500/10 text-success-500',
  LOGIN: 'bg-primary-500/10 text-primary-500',
  CREATE_LISTING: 'bg-accent-500/10 text-accent-500',
  UPDATE_LISTING: 'bg-primary-500/10 text-primary-500',
  DELETE_LISTING: 'bg-danger-500/10 text-danger-500',
  APPROVE_LISTING: 'bg-success-500/10 text-success-500',
  DENY_LISTING: 'bg-warning-500/10 text-warning-500',
  CREATE_BOOKING: 'bg-accent-500/10 text-accent-500',
  CANCEL_BOOKING: 'bg-danger-500/10 text-danger-500',
  PAYMENT: 'bg-success-500/10 text-success-500',
  CREATE_REVIEW: 'bg-primary-500/10 text-primary-500',
  DELETE_REVIEW: 'bg-danger-500/10 text-danger-500',
  UPDATE_USER: 'bg-primary-500/10 text-primary-500',
  CHANGE_ROLE: 'bg-warning-500/10 text-warning-500',
  CHANGE_STATUS: 'bg-warning-500/10 text-warning-500',
};

export default function AdminLogs() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/logs?page=${page}&limit=20`)
      .then(res => {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => toast.error('Error'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 flex items-center gap-3">
        <DocumentTextIcon className="w-8 h-8 text-primary-500" />
        {t('admin.logs')}
      </h1>

      <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={dark ? 'bg-surface-800' : 'bg-surface-50'}>
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Time</th>
                <th className="text-left py-4 px-6 font-semibold">User</th>
                <th className="text-left py-4 px-6 font-semibold">Action</th>
                <th className="text-left py-4 px-6 font-semibold">Entity</th>
                <th className="text-left py-4 px-6 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className={`border-t ${dark ? 'border-surface-800' : 'border-surface-100'}`}>
                    {[...Array(5)].map((_, j) => <td key={j} className="py-3 px-6"><div className="skeleton h-4 w-24" /></td>)}
                  </tr>
                ))
              ) : (
                logs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-t ${dark ? 'border-surface-800' : 'border-surface-100'}`}
                  >
                    <td className="py-3 px-6 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">{log.user?.name || '—'}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${actionColors[log.action] || 'bg-surface-200 text-surface-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {log.entity} {log.entityId ? `#${log.entityId}` : ''}
                    </td>
                    <td className="py-3 px-6 text-xs max-w-xs truncate">
                      {log.details || '—'}
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
