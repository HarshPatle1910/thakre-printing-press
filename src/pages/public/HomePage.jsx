import { useState, useEffect } from 'react';
import HeroCanvas from '../../components/common/HeroCanvas';
import useScrollReveal from '../../hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import {
  ArrowRight, Phone, MessageCircle, MapPin, Clock,
  Printer, FileText, Image, BookOpen, Scissors, BookCopy, CreditCard,
  Award, Shield, Check, FileCheck, Sparkles, Download, Layers
} from 'lucide-react';
import Button from '../../components/common/Button';
import { getLocalized, formatTime, isCurrentlyOpen, getMapEmbedUrl, formatImageUrl } from '../../utils/helpers';
import { getGreetingWhatsAppUrl, getPhoneUrl } from '../../utils/whatsapp';
import analyticsService from '../../services/analyticsService';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import './HomePage.css';

const SERVICE_ICONS = {
  'flex-banner-printing': Image,
  'visiting-cards': CreditCard,
  'wedding-cards': Award,
  'government-forms': FileText,
  'forms': FileText,
  'bill-books-registers': BookCopy,
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

const DEFAULT_SERVICES = [
  {
    id: 'flex-banner-printing',
    slug: 'flex-banner-printing',
    title: { en: 'Flex & Banner Printing', mr: 'फ्लेक्स आणि बॅनर प्रिंटिंग', hi: 'फ्लेक्स और बैनर प्रिंटिंग' },
    shortDescription: {
      en: 'High-resolution vinyl, flex, hoardings & promotional star banners in all custom sizes.',
      mr: 'उच्च दर्जाचे फ्लेक्स, बॅनर, होर्डिंग्ज आणि जाहिरात बोर्ड प्रिंटिंग.',
      hi: 'उच्च गुणवत्ता वाले फ्लेक्स, बैनर, होर्डिंग्स और विज्ञापन बोर्ड प्रिंटिंग।'
    },
  },
  {
    id: 'visiting-cards',
    slug: 'visiting-cards',
    title: { en: 'Visiting Cards & Business Stationery', mr: 'व्हिजिटिंग कार्ड्स आणि स्टेशनरी', hi: 'विजिटिंग कार्ड्स और स्टेशनरी' },
    shortDescription: {
      en: 'Premium matte, gloss, velvet & spot-UV visiting cards, letterheads, and envelopes.',
      mr: 'मॅट, ग्लॉस आणि स्पॉट-UV व्हिजिटिंग कार्ड्स आणि बिझनेस स्टेशनरी.',
      hi: 'प्रीमियम मैट, ग्लॉस और स्पॉट-यूवी विजिटिंग कार्ड्स एवं लेटरहेड्स।'
    },
  },
  {
    id: 'wedding-cards',
    slug: 'wedding-cards',
    title: { en: 'Wedding & Invitation Cards', mr: 'लग्न आणि आमंत्रण पत्रिका', hi: 'शादी और निमंत्रण पत्र' },
    shortDescription: {
      en: 'Exclusive designer wedding cards, royal scrolls, laser-cut, and religious event invitations.',
      mr: 'आकर्षक लग्नपत्रिका, साखरपुडा आणि सर्व धार्मिक कार्यक्रमांची निमंत्रण पत्रे.',
      hi: 'आकर्षक विवाह पत्रिका, सगाई और धार्मिक आयोजनों के सुंदर निमंत्रण पत्र।'
    },
  },
  {
    id: 'government-forms',
    slug: 'government-forms',
    title: { en: 'Government & Legal Forms', mr: 'शासकीय आणि न्यायालयीन फॉर्म्स', hi: 'सरकारी और कानूनी फॉर्म' },
    shortDescription: {
      en: 'Official MahaDBT, 7/12 land records, caste/income certificate application formats & stamp affidavits.',
      mr: 'महाडीबीटी, ७/१२ उतारा, जात/उत्पन्न दाखला, प्रतिज्ञापत्र व इतर शासकीय अर्ज नमुने.',
      hi: 'महाडीबीटी, 7/12 खतौनी, जाति/आय प्रमाण पत्र और सभी सरकारी व कानूनी आवेदन पत्र।'
    },
  },
  {
    id: 'bill-books-registers',
    slug: 'bill-books-registers',
    title: { en: 'Bill Books, Challans & Registers', mr: 'बिल बुक्स आणि चलन रजिस्टर्स', hi: 'बिल बुक्स और चालान रजिस्टर्स' },
    shortDescription: {
      en: 'Custom carbonless NCR duplicate/triplicate bill books, delivery challans, and receipt books.',
      mr: 'कार्बनलेस NCR ड्युप्लिकेट/ट्रिप्लिकेट बिल बुक्स, पावती पुस्तके आणि रजिस्टर्स.',
      hi: 'कार्बनलेस डुप्लीकेट/ट्रिप्लीकेट बिल बुक्स, डिलीवरी चालान और रसीद कट्टे।'
    },
  },
];

const DEFAULT_FORMS = [
  {
    id: 'form-7-12',
    name: { en: '7/12 Land Revenue Extract Application', mr: '७/१२ जमीन महसूल उतारा अर्ज', hi: '7/12 जमीन राजस्व उद्धरण आवेदन' },
    category: 'Land & Revenue',
    badge: 'MahaBhumi',
    description: {
      en: 'Standard application format for obtaining official 7/12 and 8-A land record extracts from Tahsil / Revenue Office.',
      mr: 'महसूल विभागाकडून ७/१२ व ८-अ जमिनीचा अधिकृत उतारा मिळवण्यासाठी अर्ज नमुना.',
      hi: 'राजस्व विभाग से 7/12 व 8-ए खतौनी भू-अभिलेख प्राप्त करने हेतु आधिकारिक आवेदन प्रारूप।'
    },
  },
  {
    id: 'form-affidavit',
    name: { en: 'General Stamp Affidavit Format', mr: 'सर्वसाधारण प्रतिज्ञापत्र नमुना', hi: 'सामान्य शपथ पत्र प्रारूप' },
    category: 'Legal / Notary',
    badge: 'Notary Stamp',
    description: {
      en: 'Legal affidavit format for stamp paper (₹100/₹500) declarations, name change, address proof & official notarization.',
      mr: 'स्टॅम्प पेपर प्रतिज्ञापत्र, नाव बदल, पत्ता पुरावा व इतर सर्व कायदेशीर घोषणांसाठी नमुना.',
      hi: 'स्टांप पेपर शपथ पत्र, नाम परिवर्तन, निवास प्रमाण व सभी कानूनी घोषणाओं का प्रारूप।'
    },
  },
  {
    id: 'form-caste-cert',
    name: { en: 'Caste Certificate Application Form', mr: 'जात प्रमाणपत्र अर्ज', hi: 'जाति प्रमाण पत्र आवेदन' },
    category: 'Citizen Services',
    badge: 'Aaple Sarkar',
    description: {
      en: 'Official application format for SC, ST, OBC, VJNT caste certificates with required document checklist.',
      mr: 'एससी, एसटी, ओबीसी, व्हीजेएनटी प्रवर्गासाठी जात प्रमाणपत्र व पडताळणी अर्ज नमुना.',
      hi: 'अनुसूचित जाति/जनजाति, अन्य पिछड़ा वर्ग हेतु जाति प्रमाण पत्र का आधिकारिक आवेदन।'
    },
  },
  {
    id: 'form-income-cert',
    name: { en: 'Income Certificate Application Form', mr: 'उत्पन्न दाखला अर्ज', hi: 'आय प्रमाण पत्र आवेदन' },
    category: 'Tahsil Office',
    badge: 'Tahsil Revenue',
    description: {
      en: 'Application for annual family income certificate from Tahsildar for scholarships, college admissions & government schemes.',
      mr: 'शैक्षणिक शिष्यवृत्ती व शासकीय योजनांसाठी तहसीलदार उत्पन्न दाखला अर्ज नमुना.',
      hi: 'छात्रवृत्ति, कॉलेज प्रवेश एवं सरकारी योजनाओं हेतु तहसीलदार आय प्रमाण पत्र आवेदन।'
    },
  },
  {
    id: 'form-rto',
    name: { en: 'RTO Driving License Learning Application', mr: 'आरटीओ ड्रायव्हिंग लायसन्स अर्ज', hi: 'आरटीओ ड्राइविंग लाइसेंस आवेदन' },
    category: 'RTO / Transport',
    badge: 'Sarathi Parivahan',
    description: {
      en: 'Government Form 2 application format for Learner Driving License and vehicular permits.',
      mr: 'आरटीओ शिकाऊ वाहन चालविण्याचा परवाना व नोंदणीसाठी अधिकृत फॉर्म २ नमुना.',
      hi: 'आरटीओ लर्नर ड्राइविंग लाइसेंस एवं वाहन परमिट हेतु आधिकारिक फॉर्म 2 आवेदन प्रारूप।'
    },
  },
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { business, openingHours } = useBusiness();
  const lang = i18n.language;
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loadingServices, setLoadingServices] = useState(false);
  const [forms, setForms] = useState(DEFAULT_FORMS);
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
            .filter((s) => s.published !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
        if (list && list.length > 0) {
          setServices(list);
        }
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

    // Load forms from Firebase
    async function loadForms() {
      try {
        const liveForms = await firestoreService.getCollection(COLLECTIONS.FORMS);
        const published = (liveForms || [])
          .filter((f) => f.published !== false)
          .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        if (published.length > 0) {
          setForms(published);
        }
      } catch (err) {
        console.warn('Forms loaded with default templates:', err);
      }
    }

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
            .filter((g) => g.published !== false && g.featured)
            .slice(0, 6);
        }
        setGalleryItems(items || []);
      } catch (err) {
        console.error('Failed to load gallery on HomePage:', err);
      }
    }

    loadServices();
    loadForms();
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

  const revealRef = useScrollReveal();

  return (
    <main className="home" ref={revealRef}>
      {/* === HERO === */}
      <section className="hero">
        {/* CMYK Ink blobs drifting in background */}
        <div className="hero__blob hero__blob--cyan" aria-hidden="true" />
        <div className="hero__blob hero__blob--magenta" aria-hidden="true" />
        <div className="hero__blob hero__blob--yellow" aria-hidden="true" />
        <div className="hero__blob hero__blob--accent" aria-hidden="true" />
        {/* Canvas particle animation (CMYK streams) */}
        <HeroCanvas />
        <div className="hero__bg-pattern" aria-hidden="true" />
        <div className="container hero__container">
          <div className="hero__content">
            <div className="hero__badge" data-reveal="down" data-reveal-delay="1">
              <Printer size={16} />
              <span>Printing &#x2022; Designing &#x2022; Documents</span>
            </div>
            <h1 className="hero__title" data-reveal="up" data-reveal-delay="2">{heroTitle}</h1>
            <p className="hero__subtitle" data-reveal="up" data-reveal-delay="3">{heroSubtitle}</p>

            <div className="hero__actions">
              <Button data-reveal="up" data-reveal-delay="4" variant="primary" size="lg" icon={ArrowRight} iconPosition="right" href="/quote">
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

            <div className="hero__info" data-reveal="up" data-reveal-delay="5">
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

          <div className="hero__visual" data-reveal="right" data-reveal-delay="2">
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
          <div className="section-header" data-reveal="up">
            <span className="section-label">{t('services.title')}</span>
            <h2>{t('services.title')}</h2>
            <p>{t('services.subtitle')}</p>
          </div>

          <div className="services-grid">
            {services.map((service, i) => {
              const IconComponent = SERVICE_ICONS[service.slug] || Printer;
              return (
                <Link
                  to={`/services/${service.slug}`}
                  className="service-card"
                  key={service.id || i}
                  data-reveal="up"
                  data-reveal-delay={String((i % 4) + 1)}
                >
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
            })}
          </div>

          <div className="home-services__cta">
            <Button variant="outline" icon={ArrowRight} iconPosition="right" href="/services">
              {t('services.viewAll')}
            </Button>
          </div>
        </div>
      </section>

      {/* === OFFICIAL & GOVERNMENT FORMS === */}
      <section className="section home-forms">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Official & Citizen Forms</span>
            <h2>Government & Legal Forms Assistance</h2>
            <p>Ready-to-fill standard formats, revenue records, affidavits & certificates with instant printing & guidance right here in Goregaon.</p>
          </div>

          <div className="home-forms__grid">
            {forms.slice(0, 4).map((form, i) => (
              <div className="home-form-card" key={form.id || i} data-reveal="scale" data-reveal-delay={String((i % 4) + 1)}>
                <div className="home-form-card__header">
                  <span className="home-form-card__badge">{form.category || 'Official Form'}</span>
                  <span className="home-form-card__status">
                    <Check size={13} /> Available
                  </span>
                </div>
                <div className="home-form-card__body">
                  <div className="home-form-card__icon-wrap">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="home-form-card__title">{getLocalized(form.name || form.title, lang)}</h3>
                    <p className="home-form-card__desc">
                      {getLocalized(form.description, lang) || 'Official standard format available for immediate printing and filling.'}
                    </p>
                  </div>
                </div>
                <div className="home-form-card__footer">
                  <span className="home-form-card__meta">✓ Verified Official Format</span>
                  <Link to="/forms" className="home-form-card__link">
                    <span>View Form</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="home-forms__banner" data-reveal="up">
            <div className="home-forms__banner-content">
              <div className="home-forms__banner-badge">
                <Sparkles size={16} />
                <span>Documentation Support</span>
              </div>
              <h3>Need help filling or printing any official form?</h3>
              <p>Visit our press in Goregaon for complete form formats, Marathi/English typing, notarized affidavits, and online application printouts.</p>
            </div>
            <div className="home-forms__banner-actions">
              <Button variant="primary" icon={ArrowRight} iconPosition="right" href="/forms">
                Browse All Forms
              </Button>
              <Button
                variant="whatsapp"
                icon={MessageCircle}
                href={getGreetingWhatsAppUrl(business.whatsapp)}
                target="_blank"
              >
                Ask on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* === WHY CHOOSE US === */}
      <section className="section home-why" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="container">
          <div className="section-header" data-reveal="up">
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
                <div className="why-card" key={i} data-reveal="scale" data-reveal-delay={String((i % 4) + 1)}>
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
            <div className="section-header" data-reveal="up">
              <span className="section-label">{t('gallery.title')}</span>
              <h2>{t('gallery.title')}</h2>
              <p>{t('gallery.subtitle')}</p>
            </div>
            <div className="gallery-preview-grid">
              {galleryItems.map((item, gi) => (
                <Link to="/gallery" className="gallery-preview-item" key={item.id} title={getLocalized(item.title, lang)}
                  data-reveal="scale" data-reveal-delay={String((gi % 6) + 1)}>
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
