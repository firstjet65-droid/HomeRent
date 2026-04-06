import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function StarRating({ rating, onRate, size = 'md', interactive = false }) {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          className={`transition-transform ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
          disabled={!interactive}
        >
          {star <= rating ? (
            <StarSolid className={`${sizeClass} text-yellow-400`} />
          ) : (
            <StarIcon className={`${sizeClass} text-surface-300`} />
          )}
        </button>
      ))}
    </div>
  );
}
