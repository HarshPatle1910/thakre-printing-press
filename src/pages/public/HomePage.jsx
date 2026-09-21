import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import {
  ArrowRight, Phone, MessageCircle, MapPin, Clock,
  Printer, FileText, Image, BookOpen, Scissors, BookCopy, CreditCard,
  Award, Shield, Check
} from 'lucide-react';
import Button from '../../components/common/Button';
import { getLocalized, formatTime, isCurrentlyOpen, getMapEmbedUrl, formatImageUrl } from '../../utils/helpers';
import { getGreetingWhatsAppUrl, getPhoneUrl } from '../../utils/whatsapp';
import analyticsService from '../../services/analyticsService';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import './HomePage.css';

const SERVICE_ICONS = {
  'forms': FileText,
  'flex-banner-printing': Image,
  'wedding-cards': CreditCard,
  'xerox': Printer,
  'lamination': Scissors,
  'book-binding': BookCopy,
  'book-printing': BookOpen,
};

const WHY_ICONS = {
  'printer': Printer,
  'clock': Clock,
  'credit-card': CreditCard,
  'creditcard': CreditCard,
  'message-circle': MessageCircle,
  'messagecircle': MessageCircle,
  'award': Award,
  'shield': Shield,
  'check': Check,
  'file-text': FileText,
  'image': Image,
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { business, openingHours } = useBusiness();
  const lang = i18n.language;
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [homepage, setHomepage] = useState(null);
  const [heroImgError, setHeroImgError] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    setHeroImgError(false);
  }, [homepage?.hero?.image]);

  useEffect(() => {
    analyticsService.trackPageView('/');

    // Load published services from Firebase
    async function loadServices() {
      try {
        let list = [];
        try {
          list = await firestoreService.getCollection(COLLECTIONS.SERVICES, [
            firestoreService.where('published', '==', true),
            firestoreService.orderBy('displayOrder', 'asc'),
          ]);
        } catch (err) {
          console.warn('Fallback fetching services on HomePage:', err);
          const all = await firestoreService.getCollection(COLLECTIONS.SERVICES);
          list = (all || [])
            .filter(s => s.published !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
        setServices(list || []);
      } catch (err) {
        console.error('Failed to load services on HomePage:', err);
      } finally {
        setLoadingServices(false);
      }
    }

    // Subscribe to homepage CMS data from Firebase in real-time
    const unsubscribeHomepage = firestoreService.subscribeToDocument(
      COLLECTIONS.PAGES,
      'homepage',
      (data) => {
        if (data) setHomepage(data);
      },
      (err) => console.error('Failed to subscribe to homepage CMS data:', err)
    );

    // Load featured gallery items from Firebase
    async function loadGallery() {
      try {
        let items = [];
        try {
          items = await firestoreService.getCollection(COLLECTIONS.GALLERY, [
            firestoreService.where('published', '==', true),
            firestoreService.where('featured', '==', true),
            firestoreService.limit(6),
          ]);
        } catch (err) {
          console.warn('Fallback fetching gallery on HomePage:', err);
          const all = await firestoreService.getCollection(COLLECTIONS.GALLERY);
          items = (all || [])
            .filter(g => g.published !== false && g.featured)
            .slice(0, 6);
        }
        setGalleryItems(items || []);
      } catch (err) {
        console.error('Failed to load gallery on HomePage:', err);
      }
    }

    loadServices();
    loadGallery();

    return () => {
      if (typeof unsubscribeHomepage === 'function') {
        unsubscribeHomepage();
      }
    };
  }, []);

  const isOpen = isCurrentlyOpen(openingHours);

  const heroTitle = homepage?.hero?.title
    ? getLocalized(homepage.hero.title, lang)
    : t('hero.defaultTitle');

  const heroSubtitle = homepage?.hero?.subtitle
    ? getLocalized(homepage.hero.subtitle, lang)
    : t('hero.defaultSubtitle');

  return (
    <main className="home">
      {/* === HERO === */}
      <section className="hero">
        <div className="hero__bg-pattern" aria-hidden="true" />
        <div className="container hero__container">
          <div className="hero__content">
            <div className="hero__badge">
              <Printer size={16} />
              <span>Printing • Designing • Documents</span>
            </div>
            <h1 className="hero__title">{heroTitle}</h1>
            <p className="hero__subtitle">{heroSubtitle}</p>

            <div className="hero__actions">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" href="/quote">
                {t('hero.cta')}
              </Button>
              <Button
                variant="whatsapp"
                size="lg"
                icon={MessageCircle}
                href={getGreetingWhatsAppUrl(business.whatsapp)}
                target="_blank"
                onClick={() => analyticsService.trackWhatsAppClick()}
              >
                {t('hero.whatsapp')}
              </Button>
              <Button
                variant="outline-light"
                size="lg"
                icon={Phone}
                href={getPhoneUrl(business.phone)}
                onClick={() => analyticsService.trackPhoneClick()}
                className="hero__btn-call"
              >
                {t('hero.callUs')}
              </Button>
            </div>

            <div className="hero__info">
              <div className="hero__info-item">
                <MapPin size={16} />
                <span>{business.address?.city || 'Goregaon'}, {business.address?.district || 'Gondia'}</span>
              </div>
              <div className={`hero__info-item ${isOpen ? 'hero__info-item--open' : ''}`}>
                <Clock size={16} />
                <span>{isOpen ? t('contact.openNow') : t('contact.closedNow')}</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            {homepage?.hero?.image && !heroImgError ? (
              <div className="hero__banner-preview">
                <img
                  src={formatImageUrl(homepage.hero.image)}
                  alt={heroTitle}
                  className="hero__banner-img"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    console.warn('Hero image failed to load, falling back to badges');
                    setHeroImgError(true);
                  }}
                />
                <div className="hero__banner-overlay">
                  <span className="hero__banner-badge">
                    <Printer size={14} />
                    {business?.name || 'Thakre Printing Press'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="hero__card hero__card--1">
                  <Printer size={32} />
                  <span>Printing</span>
                </div>
                <div className="hero__card hero__card--2">
                  <Image size={32} />
                  <span>Designing</span>
                </div>
                <div className="hero__card hero__card--3">
                  <FileText size={32} />
                  <span>Documents</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* === ANNOUNCEMENT === */}
      {homepage?.announcement && (homepage.announcement.enabled !== false) && getLocalized(homepage.announcement.text || homepage.announcement, lang) && (
        <section className="announcement">
          <div className="container">
            <p className="announcement__text">{getLocalized(homepage.announcement.text || homepage.announcement, lang)}</p>
          </div>
        </section>
      )}

      {/* === SERVICES === */}
      <section className="section home-services">
        <div className="container">
          <div className="section-header">
            <span className="section-label">{t('services.title')}</span>
            <h2>{t('services.title')}</h2>
            <p>{t('services.subtitle')}</p>
          </div>

          <div className="services-grid">
            {services.length > 0 ? (
              services.map((service, i) => {
                const IconComponent = SERVICE_ICONS[service.slug] || Printer;
                return (
                  <Link to={`/services/${service.slug}`} className="service-card" key={service.id || i} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="service-card__icon">
                      <IconComponent size={28} />
                    </div>
                    <h3 className="service-card__title">{getLocalized(service.title, lang)}</h3>
                    <p className="service-card__desc">{getLocalized(service.shortDescription, lang)}</p>
                    <span className="service-card__link">
                      {t('services.viewDetails')} <ArrowRight size={14} />
                    </span>
                  </Link>
                );
              })
            ) : loadingServices ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: 'var(--space-8)' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>{t('common.loading')}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: 'var(--space-8)' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>No services published yet.</p>
              </div>
            )}
          </div>

          {services.length > 0 && (
            <div className="home-services__cta">
              <Button variant="outline" icon={ArrowRight} iconPosition="right" href="/services">
                {t('services.viewAll')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* === WHY CHOOSE US === */}
      <section className="section home-why" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2>Your Local Printing Partner</h2>
            <p>Quality printing services right here in Goregaon</p>
          </div>

          <div className="why-grid">
            {(homepage?.whyChooseUs && homepage.whyChooseUs.length > 0
              ? homepage.whyChooseUs
              : [
                  { icon: 'printer', title: { en: 'Quality Printing', mr: 'दर्जेदार प्रिंटिंग', hi: 'गुणवत्तापूर्ण प्रिंटिंग' }, description: { en: 'High-quality printing using modern equipment and premium materials' } },
                  { icon: 'clock', title: { en: 'Timely Delivery', mr: 'वेळेवर वितरण', hi: 'समय पर डिलीवरी' }, description: { en: 'We understand deadlines and deliver your orders on time' } },
                  { icon: 'credit-card', title: { en: 'Fair Pricing', mr: 'वाजवी दर', hi: 'उचित मूल्य' }, description: { en: 'Competitive and transparent pricing for all services' } },
                  { icon: 'message-circle', title: { en: 'Personal Service', mr: 'वैयक्तिक सेवा', hi: 'व्यक्तिगत सेवा' }, description: { en: 'Friendly, personalized service from our family to yours' } },
                ]
            ).map((item, i) => {
              const IconComp = WHY_ICONS[String(item.icon).toLowerCase()] || Printer;
              return (
                <div className="why-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="why-card__icon">
                    <IconComp size={24} />
                  </div>
                  <h3 className="why-card__title">{getLocalized(item.title, lang)}</h3>
                  <p className="why-card__desc">{getLocalized(item.description, lang)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === GALLERY PREVIEW === */}
      {galleryItems.length > 0 && (
        <section className="section home-gallery">
          <div className="container">
            <div className="section-header">
              <span className="section-label">{t('gallery.title')}</span>
              <h2>{t('gallery.title')}</h2>
              <p>{t('gallery.subtitle')}</p>
            </div>
            <div className="gallery-preview-grid">
              {galleryItems.map((item) => (
                <Link to="/gallery" className="gallery-preview-item" key={item.id} title={getLocalized(item.title, lang)}>
                  <img
                    src={formatImageUrl(item.imageUrl || item.thumbnailUrl)}
                    alt={getLocalized(item.altText, lang) || getLocalized(item.title, lang)}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="gallery-preview-item__overlay">
                    <span className="gallery-preview-item__title">{getLocalized(item.title, lang)}</span>
                    {getLocalized(item.description, lang) && (
                      <span className="gallery-preview-item__desc">{getLocalized(item.description, lang)}</span>
                    )}
                  </div>
                  {item.isPlaceholder && (
                    <span className="gallery-preview-item__badge">{t('gallery.placeholder')}</span>
                  )}
                </Link>
              ))}
            </div>
            <div className="home-services__cta">
              <Button variant="outline" icon={ArrowRight} iconPosition="right" href="/gallery">
                {t('common.viewMore')}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* === CTA SECTION === */}
      <section className="home-cta">
        <div className="container home-cta__container">
          <div className="home-cta__content">
            <h2>Ready to Get Started?</h2>
            <p>Tell us about your printing needs and get a quote today.</p>
          </div>
          <div className="home-cta__actions">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" href="/quote">
              {t('hero.cta')}
            </Button>
            <Button
              variant="whatsapp"
              size="lg"
              icon={MessageCircle}
              href={getGreetingWhatsAppUrl(business.whatsapp)}
              target="_blank"
            >
              {t('hero.whatsapp')}
            </Button>
          </div>
        </div>
      </section>

      {/* === LOCATION === */}
      <section className="section home-location">
        <div className="container">
          <div className="home-location__grid">
            <div className="home-location__info">
              <span className="section-label">{t('contact.title')}</span>
              <h2>Find Us</h2>
              <div className="home-location__details">
                <div className="home-location__item">
                  <MapPin size={20} />
                  <div>
                    <p>{business.address?.line1}</p>
                    {business.address?.line2 && <p>{business.address.line2}</p>}
                    <p>{business.address?.city}, {business.address?.district}, {business.address?.state}</p>
                  </div>
                </div>
                <div className="home-location__item">
                  <Phone size={20} />
                  <a href={getPhoneUrl(business.phone)}>{business.phone}</a>
                </div>
                <div className="home-location__item">
                  <Clock size={20} />
                  <div>
                    <p>
                      {openingHours?.monday?.closed
                        ? 'Mon–Sat: Closed'
                        : `Mon–Sat: ${formatTime(openingHours?.monday?.open || '09:00')} – ${formatTime(openingHours?.monday?.close || '20:00')}`}
                    </p>
                    <p>
                      Sunday: {openingHours?.sunday?.closed
                        ? t('contact.closed')
                        : `${formatTime(openingHours?.sunday?.open)} – ${formatTime(openingHours?.sunday?.close)}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="home-location__actions">
                <Button variant="secondary" icon={MapPin} href="/contact">
                  {t('contact.getDirections')}
                </Button>
                <Button
                  variant="outline"
                  icon={Phone}
                  href={getPhoneUrl(business.phone)}
                  onClick={() => analyticsService.trackPhoneClick()}
                >
                  {t('common.call')}
                </Button>
              </div>
            </div>
            <div className="home-location__map">
              {getMapEmbedUrl(business.location) ? (
                <iframe
                  src={getMapEmbedUrl(business.location)}
                  title="Business Location"
                  className="home-location__map-iframe"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="home-location__map-placeholder">
                  <MapPin size={48} />
                  <p>Map will be displayed here</p>
                  <small>Location can be configured in Admin Panel</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
