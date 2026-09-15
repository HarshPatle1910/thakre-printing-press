import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, X } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './GalleryPage.css';

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    analyticsService.trackPageView('/gallery');
    Promise.all([
      firestoreService.getCollection(COLLECTIONS.GALLERY, [
        firestoreService.where('published', '==', true),
        firestoreService.orderBy('displayOrder', 'asc'),
      ]),
      firestoreService.getCollection(COLLECTIONS.GALLERY_CATEGORIES, [
        firestoreService.orderBy('displayOrder', 'asc'),
      ]),
    ]).then(([galleryData, catData]) => {
      setItems(galleryData);
      setCategories(catData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="gallery-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('gallery.title')}</span>
          <h1>{t('gallery.title')}</h1>
          <p>{t('gallery.subtitle')}</p>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="gallery-filters">
            <button className={`gallery-filter ${activeCategory === 'all' ? 'gallery-filter--active' : ''}`} onClick={() => setActiveCategory('all')}>
              {t('gallery.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`gallery-filter ${activeCategory === cat.slug ? 'gallery-filter--active' : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {getLocalized(cat.name, lang)}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={Image} title={t('gallery.noItems')} />
        ) : (
          <div className="gallery-grid">
            {filtered.map((item) => (
              <button className="gallery-item" key={item.id} onClick={() => setLightboxItem(item)} aria-label={getLocalized(item.title, lang)}>
                <img
                  src={item.thumbnailUrl || item.imageUrl}
                  alt={getLocalized(item.altText, lang) || getLocalized(item.title, lang)}
                  loading="lazy"
                />
                <div className="gallery-item__overlay">
                  <span className="gallery-item__title">{getLocalized(item.title, lang)}</span>
                  {item.isPlaceholder && <span className="gallery-item__badge">{t('gallery.placeholder')}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div className="lightbox" onClick={() => setLightboxItem(null)} role="dialog" aria-label="Image preview">
          <button className="lightbox__close" onClick={() => setLightboxItem(null)} aria-label="Close">
            <X size={24} />
          </button>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxItem.imageUrl} alt={getLocalized(lightboxItem.altText, lang) || getLocalized(lightboxItem.title, lang)} />
            <div className="lightbox__info">
              <h3>{getLocalized(lightboxItem.title, lang)}</h3>
              {lightboxItem.description && <p>{getLocalized(lightboxItem.description, lang)}</p>}
              {lightboxItem.isPlaceholder && <small>{t('gallery.placeholder')}</small>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
