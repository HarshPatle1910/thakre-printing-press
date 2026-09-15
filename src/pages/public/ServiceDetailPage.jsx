import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MessageCircle, ArrowRight } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import { getServiceWhatsAppUrl } from '../../utils/whatsapp';
import firestoreService from '../../services/firestoreService';
import analyticsService from '../../services/analyticsService';
import { COLLECTIONS } from '../../config/constants';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import './ServiceDetailPage.css';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    firestoreService.getCollection(COLLECTIONS.SERVICES, [
      firestoreService.where('slug', '==', slug),
      firestoreService.limit(1),
    ]).then((results) => {
      if (results.length > 0) {
        setService(results[0]);
        analyticsService.trackServiceView(slug);
        // Load related services
        firestoreService.getCollection(COLLECTIONS.SERVICES, [
          firestoreService.where('published', '==', true),
          firestoreService.orderBy('displayOrder', 'asc'),
          firestoreService.limit(4),
        ]).then((all) => {
          setRelatedServices(all.filter(s => s.slug !== slug).slice(0, 3));
        });
      } else {
        setError(true);
      }
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <Loader text={t('common.loading')} />;
  if (error || !service) return <ErrorState title="Service not found" message="The service you're looking for doesn't exist." />;

  const title = getLocalized(service.title, lang);
  const description = getLocalized(service.description, lang);

  return (
    <main className="service-detail section">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t('nav.home')}</Link>
          <ChevronRight size={14} />
          <Link to="/services">{t('nav.services')}</Link>
          <ChevronRight size={14} />
          <span>{title}</span>
        </nav>

        {/* Hero */}
        <div className="service-detail__hero">
          <div className="service-detail__hero-content">
            <h1>{title}</h1>
            <p className="service-detail__hero-desc">{getLocalized(service.shortDescription, lang)}</p>
            <div className="service-detail__hero-actions">
              <Button variant="primary" icon={ArrowRight} iconPosition="right" href={`/quote?service=${service.id}`}>
                {t('services.enquire')}
              </Button>
              <Button
                variant="whatsapp"
                icon={MessageCircle}
                href={getServiceWhatsAppUrl(title)}
                target="_blank"
                onClick={() => analyticsService.trackWhatsAppClick()}
              >
                {t('common.whatsapp')}
              </Button>
            </div>
          </div>
          {service.heroImage && (
            <div className="service-detail__hero-image">
              <img src={service.heroImage} alt={title} />
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <section className="service-detail__section">
            <div className="service-detail__description" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
          </section>
        )}

        {/* Features / Sub-services */}
        {service.subServices?.length > 0 && (
          <section className="service-detail__section">
            <h2>{t('services.subServices')}</h2>
            <div className="service-detail__features-grid">
              {service.subServices.map((sub, i) => (
                <div className="service-detail__feature-card" key={i}>
                  <h3>{getLocalized(sub.title, lang)}</h3>
                  <p>{getLocalized(sub.description, lang)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {service.faqs?.length > 0 && (
          <section className="service-detail__section">
            <h2>{t('faq.title')}</h2>
            <div className="service-detail__faqs">
              {service.faqs.map((faq, i) => (
                <details className="faq-item" key={i}>
                  <summary className="faq-item__question">{getLocalized(faq.question, lang)}</summary>
                  <div className="faq-item__answer">{getLocalized(faq.answer, lang)}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="service-detail__cta">
          <h2>Interested in {title}?</h2>
          <p>Get a quote or reach out on WhatsApp for quick assistance.</p>
          <div className="service-detail__cta-actions">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" href={`/quote?service=${service.id}`}>
              {t('hero.cta')}
            </Button>
            <Button variant="whatsapp" size="lg" icon={MessageCircle} href={getServiceWhatsAppUrl(title)} target="_blank">
              {t('common.whatsapp')}
            </Button>
          </div>
        </section>

        {/* Related services */}
        {relatedServices.length > 0 && (
          <section className="service-detail__section">
            <h2>{t('services.relatedServices')}</h2>
            <div className="services-grid">
              {relatedServices.map((rs) => (
                <Link to={`/services/${rs.slug}`} className="service-card" key={rs.id}>
                  <h3 className="service-card__title">{getLocalized(rs.title, lang)}</h3>
                  <p className="service-card__desc">{getLocalized(rs.shortDescription, lang)}</p>
                  <span className="service-card__link">{t('services.viewDetails')} <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
