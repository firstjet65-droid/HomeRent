import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, CalendarDaysIcon, HomeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';

export default function HomePage() {
  const { t } = useTranslation();
  const { dark } = useTheme();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?limit=6&sortBy=averageRating&sortOrder=desc')
      .then(res => setFeatured(res.data.listings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const steps = [
    { icon: MagnifyingGlassIcon, title: t('home.step1_title'), desc: t('home.step1_desc'), color: 'from-primary-500 to-primary-600' },
    { icon: CalendarDaysIcon, title: t('home.step2_title'), desc: t('home.step2_desc'), color: 'from-accent-500 to-accent-600' },
    { icon: HomeIcon, title: t('home.step3_title'), desc: t('home.step3_desc'), color: 'from-success-500 to-success-600' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4 leading-tight">
              {t('home.hero_title')}{' '}
              <span className="text-accent-400">{t('home.hero_highlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary-700 font-semibold text-lg hover:bg-surface-100 transition-all shadow-xl hover:shadow-2xl"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
                {t('home.explore')}
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className={`w-full ${dark ? 'fill-surface-950' : 'fill-surface-50'}`}>
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,100L0,100Z" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-center mb-16"
        >
          {t('home.how_title')}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                <step.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className={dark ? 'text-surface-400' : 'text-surface-500'}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className={`py-16 md:py-24 ${dark ? 'bg-surface-900/50' : 'bg-surface-100/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]"
            >
              {t('home.featured')}
            </motion.h2>
            <Link
              to="/listings"
              className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition"
            >
              {t('home.view_all')}
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden ${dark ? 'bg-surface-900' : 'bg-white'}`}>
                  <div className="skeleton aspect-[4/3]" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-5 w-full" />
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
