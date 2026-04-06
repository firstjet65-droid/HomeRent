import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation();
  const { dark } = useTheme();

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btnClass = (active) =>
    `w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
      active
        ? 'bg-primary-500 text-white shadow-md'
        : dark
        ? 'hover:bg-surface-800 text-surface-400'
        : 'hover:bg-surface-100 text-surface-600'
    }`;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnClass(false)} ${page <= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btnClass(false)}>1</button>
          {start > 2 && <span className="w-8 text-center text-surface-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)} className={btnClass(p === page)}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="w-8 text-center text-surface-400">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={btnClass(false)}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnClass(false)} ${page >= totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
