import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, X, Maximize2 } from 'lucide-react';
import { getLocalized, formatImageUrl } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './GalleryPage.css';

const CATEGORY_FALLBACK_NAMES = {
  'flex-banners': 'Flex & Banners',
  'visiting-cards': 'Visiting Cards',
  'wedding-cards': 'Wedding & Invitations',
  'forms': 'Government & Legal Forms',
  'bill-books': 'Bill Books & Registers',
  'posters': 'Posters & Pamphlets',
  'custom': 'Custom Prints',
};

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

    let unsubGallery = null;
    let unsubCategories = null;

    try {
      unsubGallery = firestoreService.subscribeToCollection(
        COLLECTIONS.GALLERY,
        [
          firestoreService.where('published', '==', true),
          firestoreService.orderBy('displayOrder', 'asc'),
        ],
        (data) => {
          setItems(data || []);
          setLoading(false);
        },
        async (err) => {
          console.warn('Fallback fetching gallery items:', err);
          try {
            const all = await firestoreService.getCollection(COLLECTIONS.GALLERY);
            const filtered = (all || [])
              .filter((i) => i.published !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setItems(filtered);
          } catch (fetchErr) {
            console.error('Failed to load gallery items:', fetchErr);
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (e) {
      console.warn('Error subscribing to gallery:', e);
    }

    try {
      unsubCategories = firestoreService.subscribeToCollection(
        COLLECTIONS.GALLERY_CATEGORIES,
        [firestoreService.orderBy('displayOrder', 'asc')],
        (data) => {
          setCategories(data || []);
        },
        async (catErr) => {
          console.warn('Fallback fetching gallery categories:', catErr);
          try {
            const catData = await firestoreService.getCollection(COLLECTIONS.GALLERY_CATEGORIES);
            setCategories(catData || []);
          } catch (e) {
            console.error('Failed to load gallery categories:', e);
          }
        }
      );
    } catch (e) {
      console.warn('Error subscribing to categories:', e);
    }

    return () => {
      if (typeof unsubGallery === 'function') unsubGallery();
      if (typeof unsubCategories === 'function') unsubCategories();
    };
  }, []);

  const getCategoryTitle = (catSlug) => {
    if (!catSlug) return '';
    const found = categories.find((c) => c.slug === catSlug);
    if (found) return getLocalized(found.name, lang);
    return CATEGORY_FALLBACK_NAMES[catSlug] || catSlug.replace(/-/g, ' ');
  };

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);

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
            <button
              className={`gallery-filter ${activeCategory === 'all' ? 'gallery-filter--active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
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
            {filtered.map((item) => {
              const itemTitle = getLocalized(item.title, lang) || 'Printing Work';
              const itemDesc = getLocalized(item.description, lang);
              const catTitle = getCategoryTitle(item.category);

              return (
                <div
                  className="gallery-card"
                  key={item.id}
                  onClick={() => setLightboxItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setLightboxItem(item)}
                  aria-label={`View ${itemTitle}`}
                >
                  <div className="gallery-card__thumb">
                    <img
                      src={formatImageUrl(item.thumbnailUrl || item.imageUrl)}
                      alt={getLocalized(item.altText, lang) || itemTitle}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="gallery-card__overlay">
                      <span className="gallery-card__zoom-btn">
                        <Maximize2 size={16} />
                        <span>Preview</span>
                      </span>
                    </div>
                    {catTitle && (
                      <span className="gallery-card__category-badge">{catTitle}</span>
                    )}
                    {item.isPlaceholder && (
                      <span className="gallery-card__badge">{t('gallery.placeholder')}</span>
                    )}
                  </div>

                  <div className="gallery-card__body">
                    <h3 className="gallery-card__title">{itemTitle}</h3>
                    {itemDesc && (
                      <p className="gallery-card__desc">{itemDesc}</p>
                    )}
                  </div>
                </div>
              );
            })}
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
            <div className="lightbox__image-wrapper">
              <img
                src={formatImageUrl(lightboxItem.imageUrl || lightboxItem.thumbnailUrl)}
                alt={getLocalized(lightboxItem.altText, lang) || getLocalized(lightboxItem.title, lang)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lightbox__info">
              <div className="lightbox__meta">
                {lightboxItem.category && (
                  <span className="lightbox__category-badge">{getCategoryTitle(lightboxItem.category)}</span>
                )}
                {lightboxItem.isPlaceholder && (
                  <span className="lightbox__placeholder-badge">{t('gallery.placeholder')}</span>
                )}
              </div>
              <h3>{getLocalized(lightboxItem.title, lang)}</h3>
              {getLocalized(lightboxItem.description, lang) && (
                <p className="lightbox__desc">{getLocalized(lightboxItem.description, lang)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
