import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserIcon, EnvelopeIcon, LockClosedIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await register(name, email, password);
      navigate(user?.role === 'ADMIN' ? '/admin' : '/profile');
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach the API server. Check your Render backend URL.' : 'Registration failed')
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-12 pr-4 py-3.5 rounded-xl border text-sm transition-all ${
    dark
      ? 'bg-surface-800 border-surface-700 focus:border-primary-500 text-white placeholder:text-surface-500'
      : 'bg-surface-50 border-surface-200 focus:border-primary-500 text-surface-900 placeholder:text-surface-400'
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-3xl ${dark ? 'bg-surface-900 border border-surface-800' : 'bg-white border border-surface-200'} shadow-xl`}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <HomeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">{t('auth.register_title')}</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-surface-400' : 'text-surface-500'}`}>{t('auth.register_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')} className={inputClass} required />
          </div>
          <div className="relative">
            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className={inputClass} required />
          </div>
          <div className="relative">
            <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} className={inputClass} required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md disabled:opacity-50">
            {loading ? '...' : t('auth.register_btn')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          <span className={dark ? 'text-surface-400' : 'text-surface-500'}>{t('auth.have_account')} </span>
          <Link to="/login" className="text-primary-500 font-medium hover:text-primary-600">{t('nav.login')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
