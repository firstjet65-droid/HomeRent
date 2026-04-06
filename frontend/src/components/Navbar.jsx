import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: HomeIcon },
    { to: '/listings', label: t('nav.listings'), icon: MagnifyingGlassIcon },
  ];

  const authLinks = user
    ? [
        { to: '/bookings', label: t('nav.bookings'), icon: CalendarDaysIcon },
        { to: '/favorites', label: t('nav.favorites'), icon: HeartIcon },
      ]
    : [];

  return (
    <nav className={`sticky top-0 z-50 glass ${dark ? 'border-b border-surface-800' : 'border-b border-surface-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-heading)] gradient-text">
              HomeRent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[...navLinks, ...authLinks].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  dark
                    ? 'hover:bg-surface-800 text-surface-300 hover:text-white'
                    : 'hover:bg-surface-100 text-surface-600 hover:text-surface-900'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-200 ${
                dark ? 'hover:bg-surface-800 text-yellow-400' : 'hover:bg-surface-100 text-surface-600'
              }`}
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                    dark ? 'hover:bg-surface-800' : 'hover:bg-surface-100'
                  }`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-primary-500" />
                  )}
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div
                      className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl z-50 py-2 ${
                        dark ? 'bg-surface-900 border border-surface-700' : 'bg-white border border-surface-200'
                      }`}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                          dark ? 'hover:bg-surface-800' : 'hover:bg-surface-50'
                        }`}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                          dark ? 'hover:bg-surface-800' : 'hover:bg-surface-50'
                        }`}
                      >
                        <CalendarDaysIcon className="w-5 h-5" />
                        {t('nav.bookings')}
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                          dark ? 'hover:bg-surface-800' : 'hover:bg-surface-50'
                        }`}
                      >
                        <HeartIcon className="w-5 h-5" />
                        {t('nav.favorites')}
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm text-primary-500 ${
                            dark ? 'hover:bg-surface-800' : 'hover:bg-surface-50'
                          }`}
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          {t('nav.admin')}
                        </Link>
                      )}
                      <hr className={`my-1 ${dark ? 'border-surface-700' : 'border-surface-200'}`} />
                      <button
                        onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full text-danger-500 ${
                          dark ? 'hover:bg-surface-800' : 'hover:bg-surface-50'
                        }`}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    dark ? 'hover:bg-surface-800 text-surface-300' : 'hover:bg-surface-100 text-surface-600'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-xl ${dark ? 'hover:bg-surface-800' : 'hover:bg-surface-100'}`}
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden px-4 pb-4 ${dark ? 'bg-surface-950' : 'bg-white'}`}>
          {[...navLinks, ...authLinks].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                dark ? 'hover:bg-surface-800' : 'hover:bg-surface-100'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-2 mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-primary-500 text-primary-500">
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
