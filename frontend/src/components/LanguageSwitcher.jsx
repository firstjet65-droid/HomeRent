import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ru', label: 'Русский', flag: 'RU' },
  { code: 'kk', label: 'Қазақша', flag: 'KZ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { dark } = useTheme();
  const [open, setOpen] = useState(false);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          dark ? 'hover:bg-surface-800 text-surface-300' : 'hover:bg-surface-100 text-surface-600'
        }`}
      >
        <GlobeAltIcon className="w-5 h-5" />
        <span className="hidden sm:inline">{current.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 mt-2 w-40 rounded-2xl shadow-xl z-50 py-1 ${
            dark ? 'bg-surface-900 border border-surface-700' : 'bg-white border border-surface-200'
          }`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition ${
                  i18n.language === lang.code
                    ? 'text-primary-500 font-medium'
                    : dark ? 'text-surface-300 hover:bg-surface-800' : 'text-surface-600 hover:bg-surface-50'
                }`}
              >
                <span className="font-bold text-xs w-6">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
