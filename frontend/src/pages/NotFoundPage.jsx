import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  const { dark } = useTheme();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold gradient-text font-[family-name:var(--font-heading)] mb-4">404</h1>
      <p className={`text-xl mb-8 ${dark ? 'text-surface-400' : 'text-surface-500'}`}>Page not found</p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
      >
        <HomeIcon className="w-5 h-5" />
        Go Home
      </Link>
    </div>
  );
}
