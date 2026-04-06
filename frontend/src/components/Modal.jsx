import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative ${maxWidth} w-full bg-white dark:bg-surface-900 rounded-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto`}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
              <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)]">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function ImageGallery({ images = [], initialIndex = 0 }) {
  const [idx, setIdx] = useState(initialIndex);
  const [fullscreen, setFullscreen] = useState(false);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        <div className="aspect-[4/3] cursor-pointer" onClick={() => { setIdx(0); setFullscreen(true); }}>
          <img src={images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="aspect-square cursor-pointer relative" onClick={() => { setIdx(i + 1); setFullscreen(true); }}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                    +{images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10">
            <XMarkIcon className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <img
            src={images[idx]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">
            {idx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
