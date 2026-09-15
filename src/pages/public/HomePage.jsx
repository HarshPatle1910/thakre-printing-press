import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import {
  ArrowRight, Phone, MessageCircle, MapPin, Clock,
  Printer, FileText, Image, BookOpen, Scissors, BookCopy, CreditCard
} from 'lucide-react';
import Button from '../../components/common/Button';
import { getLocalized, formatTime, isCurrentlyOpen } from '../../utils/helpers';
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

import { SEED_DATA } from '../../config/seedData';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { business, openingHours } = useBusiness();
  const lang = i18n.language;
  const [services, setServices] = useState(SEED_DATA.services);
  const [homepage, setHomepage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    analyticsService.trackPageView('/');

    // Load published services
    firestoreService.getCollection(COLLECTIONS.SERVICES, [
      firestoreService.where('published', '==', true),
      firestoreService.orderBy('displayOrder', 'asc'),
    ]).then((data) => {
      if (data && data.length > 0) setServices(data);
    }).catch(console.error);

    // Load homepage content
    firestoreService.getDocument(COLLECTIONS.PAGES, 'homepage')
      .then(setHomepage).catch(console.error);

    // Load featured gallery
    firestoreService.getCollection(COLLECTIONS.GALLERY, [
      firestoreService.where('published', '==', true),
      firestoreService.where('featured', '==', true),
      firestoreService.limit(6),
    ]).then(setGalleryItems).catch(console.error);
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
                href={getGreetingWhatsAppUrl()}
                target="_blank"
                onClick={() => analyticsService.trackWhatsAppClick()}
              >
                {t('hero.whatsapp')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={Phone}
                href={getPhoneUrl(business.phone)}
                onClick={() => analyticsService.trackPhoneClick()}
              >
                {t('hero.callUs')}
              </Button>
            </div>

            <div className="hero__info">
              <div className="hero__info-item">
                <MapPin size={16} />
                <span>Goregaon, Gondia</span>
              </div>
              <div className={`hero__info-item ${isOpen ? 'hero__info-item--open' : ''}`}>
                <Clock size={16} />
                <span>{isOpen ? t('contact.openNow') : t('contact.closedNow')}</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
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
          </div>
        </div>
      </section>

      {/* === ANNOUNCEMENT === */}
      {homepage?.announcement && getLocalized(homepage.announcement, lang) && (
        <section className="announcement">
          <div className="container">
            <p className="announcement__text">{getLocalized(homepage.announcement, lang)}</p>
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
            {services.length > 0 ? services.map((service, i) => {
              const IconComponent = SERVICE_ICONS[service.slug] || Printer;
              return (
                <Link to={`/services/${service.slug}`} className="service-card" key={service.id} style={{ animationDelay: `${i * 0.05}s` }}>
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
            }) : (
              /* Default placeholder cards */
              ['Forms', 'Flex & Banner Printing', 'Wedding Cards', 'Xerox', 'Lamination', 'Book Binding', 'Book Printing'].map((name, i) => (
                <div className="service-card service-card--placeholder" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="service-card__icon">
                    <Printer size={28} />
                  </div>
                  <h3 className="service-card__title">{name}</h3>
                  <p className="service-card__desc">Professional {name.toLowerCase()} services</p>
                </div>
              ))
            )}
          </div>

          <div className="home-services__cta">
            <Button variant="outline" icon={ArrowRight} iconPosition="right" href="/services">
              {t('services.viewAll')}
            </Button>
          </div>
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
            {[
              { icon: Printer, title: 'Quality Printing', desc: 'High-quality printing using modern equipment and premium materials' },
              { icon: Clock, title: 'Timely Delivery', desc: 'We understand deadlines and deliver your orders on time' },
              { icon: CreditCard, title: 'Fair Pricing', desc: 'Competitive and transparent pricing for all services' },
              { icon: MessageCircle, title: 'Personal Service', desc: 'Friendly, personalized service from our family to yours' },
            ].map((item, i) => (
              <div className="why-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="why-card__icon">
                  <item.icon size={24} />
                </div>
                <h3 className="why-card__title">{item.title}</h3>
                <p className="why-card__desc">{item.desc}</p>
              </div>
            ))}
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
                <div className="gallery-preview-item" key={item.id}>
                  <img
                    src={item.imageUrl || item.thumbnailUrl}
                    alt={getLocalized(item.altText, lang) || getLocalized(item.title, lang)}
                    loading="lazy"
                  />
                  {item.isPlaceholder && (
                    <span className="gallery-preview-item__badge">{t('gallery.placeholder')}</span>
                  )}
                </div>
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
              href={getGreetingWhatsAppUrl()}
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
                    <p>{business.address?.line2}</p>
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
                    <p>Mon–Sat: {formatTime('09:00')} – {formatTime('20:00')}</p>
                    <p>Sunday: {t('contact.closed')}</p>
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
              <div className="home-location__map-placeholder">
                <MapPin size={48} />
                <p>Map will be displayed here</p>
                <small>Location can be configured in Admin Panel</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
