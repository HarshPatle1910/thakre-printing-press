import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Printer } from 'lucide-react';
import { getLocalized, formatImageUrl } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import './ServicesPage.css';

export default function ServicesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    analyticsService.trackPageView('/services');
    firestoreService.getCollection(COLLECTIONS.SERVICES, [
      firestoreService.where('published', '==', true),
      firestoreService.orderBy('displayOrder', 'asc'),
    ]).then((data) => {
      setServices(data || []);
      setLoading(false);
    }).catch((err) => {
      console.warn('Fallback fetching services without compound order:', err);
      firestoreService.getCollection(COLLECTIONS.SERVICES)
        .then((all) => {
          const published = (all || [])
            .filter((s) => s.published !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setServices(published);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch services from Firebase:', error);
          setServices([]);
          setLoading(false);
        });
    });
  }, []);

  const filteredServices = services.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const titleEn = (s.title?.en || '').toLowerCase();
    const titleMr = (s.title?.mr || '').toLowerCase();
    const titleHi = (s.title?.hi || '').toLowerCase();
    const descEn = (s.shortDescription?.en || s.description?.en || '').toLowerCase();
    const descMr = (s.shortDescription?.mr || s.description?.mr || '').toLowerCase();
    const localizedTitle = getLocalized(s.title, lang).toLowerCase();
    const localizedDesc = getLocalized(s.shortDescription || s.description, lang).toLowerCase();

    return (
      titleEn.includes(q) ||
      titleMr.includes(q) ||
      titleHi.includes(q) ||
      descEn.includes(q) ||
      descMr.includes(q) ||
      localizedTitle.includes(q) ||
      localizedDesc.includes(q)
    );
  });

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="services-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('services.title')}</span>
          <h1>{t('services.title')}</h1>
          <p>{t('services.subtitle')}</p>
        </div>

        {services.length > 0 && (
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder={t('services.search')}
            ariaLabel={t('services.search')}
            count={search.trim() ? filteredServices.length : undefined}
            id="services-search"
          />
        )}

        {filteredServices.length === 0 ? (
          <EmptyState
            icon={Printer}
            title={search ? t('services.noServices') : "No services yet"}
            message={
              search
                ? `No services found matching "${search}". Try searching for another printing service or product.`
                : "Services will appear here once added."
            }
            action={
              search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  {t('common.clearSearch')}
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="services-grid">
            {filteredServices.map((service, i) => (
              <Link to={`/services/${service.slug}`} className="service-card" key={service.id} style={{ animationDelay: `${i * 0.05}s` }}>
                {service.heroImage && (
                  <div className="service-card__image">
                    <img src={formatImageUrl(service.heroImage)} alt={getLocalized(service.title, lang)} loading="lazy" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="service-card__body">
                  <h2 className="service-card__title">{getLocalized(service.title, lang)}</h2>
                  <p className="service-card__desc">{getLocalized(service.shortDescription, lang)}</p>
                  <span className="service-card__link">
                    {t('services.viewDetails')} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
