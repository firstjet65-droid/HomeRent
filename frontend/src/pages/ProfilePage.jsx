import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, { name, avatar: avatar || null });
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-all ${
    dark
      ? 'bg-surface-800 border-surface-700 focus:border-primary-500 text-white'
      : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900'
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-lg`}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">{t('profile.title')}</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-primary-500 hover:bg-primary-500/10 transition">
              <PencilIcon className="w-5 h-5" />
              {t('profile.edit')}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center mb-8">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-24 h-24 rounded-full object-cover mb-4" />
          ) : (
            <UserCircleIcon className="w-24 h-24 text-primary-500 mb-4" />
          )}
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className={`text-sm ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{user?.email}</p>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            user?.role === 'ADMIN'
              ? 'bg-primary-500/10 text-primary-500'
              : 'bg-success-500/10 text-success-500'
          }`}>
            {user?.role}
          </span>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.name')}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('profile.avatar')}</label>
              <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-50">
                {loading ? '...' : t('profile.save')}
              </button>
              <button onClick={() => setEditing(false)} className="px-6 py-2.5 rounded-xl border border-surface-300 font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-xl ${dark ? 'bg-surface-800' : 'bg-surface-50'}`}>
            <p className="text-sm">
              <span className={dark ? 'text-surface-400' : 'text-surface-500'}>{t('profile.member_since')}: </span>
              <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
