import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { t } = useTranslation();
  const { dark } = useTheme();

  return (
    <footer className={`mt-auto ${dark ? 'bg-surface-900 border-t border-surface-800' : 'bg-white border-t border-surface-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-heading)] gradient-text">HomeRent</span>
            </Link>
            <p className={`text-sm ${dark ? 'text-surface-400' : 'text-surface-500'}`}>
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quick_links')}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('nav.home')}</Link>
              <Link to="/listings" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('nav.listings')}</Link>
              <Link to="/bookings" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('nav.bookings')}</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('footer.help')}</a>
              <a href="#" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('footer.contact')}</a>
              <a href="#" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('footer.about')}</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('footer.terms')}</a>
              <a href="#" className={`text-sm ${dark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'} transition`}>{t('footer.privacy')}</a>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t ${dark ? 'border-surface-800' : 'border-surface-200'}`}>
          <p className={`text-center text-sm ${dark ? 'text-surface-500' : 'text-surface-400'}`}>
            &copy; {new Date().getFullYear()} HomeRent. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
