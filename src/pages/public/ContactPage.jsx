import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import { Phone, MessageCircle, MapPin, Clock, Mail, Navigation } from 'lucide-react';
import { getPhoneUrl, getGreetingWhatsAppUrl } from '../../utils/whatsapp';
import { formatPhone, formatTime, isCurrentlyOpen, getMapEmbedUrl } from '../../utils/helpers';
import { DAYS_OF_WEEK } from '../../config/constants';
import Button from '../../components/common/Button';
import analyticsService from '../../services/analyticsService';
import { useEffect } from 'react';
import './ContactPage.css';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const { business, openingHours } = useBusiness();
  const isOpen = isCurrentlyOpen(openingHours);

  useEffect(() => { analyticsService.trackPageView('/contact'); }, []);

  const handleMapClick = () => { analyticsService.trackMapClick(); };

  return (
    <main className="contact-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('contact.title')}</span>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            {/* Address */}
            <div className="contact-card">
              <div className="contact-card__icon"><MapPin size={24} /></div>
              <div>
                <h3>{t('contact.address')}</h3>
                <p>{business?.name}</p>
                <p>{business?.address?.line1}</p>
                <p>{business?.address?.line2}</p>
                <p>{business?.address?.city}{business?.address?.district ? `, ${business.address.district}` : ''}</p>
                <p>{business?.address?.state}{business?.address?.country ? `, ${business.address.country}` : ''}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="contact-card">
              <div className="contact-card__icon"><Phone size={24} /></div>
              <div>
                <h3>{t('contact.phone')}</h3>
                <a href={getPhoneUrl(business?.phone)} onClick={() => analyticsService.trackPhoneClick()}>
                  {formatPhone(business?.phone)}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="contact-card">
              <div className="contact-card__icon" style={{ background: 'var(--color-whatsapp)', color: '#fff' }}><MessageCircle size={24} /></div>
              <div>
                <h3>{t('contact.whatsapp')}</h3>
                <a href={getGreetingWhatsAppUrl(business?.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => analyticsService.trackWhatsAppClick()}>
                  {formatPhone(business?.whatsapp)}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="contact-card">
              <div className="contact-card__icon"><Clock size={24} /></div>
              <div>
                <h3>{t('contact.hours')}</h3>
                <div className={`contact-status ${isOpen ? 'contact-status--open' : 'contact-status--closed'}`}>
                  {isOpen ? t('contact.openNow') : t('contact.closedNow')}
                </div>
                <div className="hours-list">
                  {DAYS_OF_WEEK.map((day) => {
                    const h = openingHours?.[day];
                    return (
                      <div className="hours-row" key={day}>
                        <span className="hours-day">{t(`common.${day}`)}</span>
                        <span className="hours-time">
                          {h?.closed ? t('contact.closed') : `${formatTime(h?.open)} – ${formatTime(h?.close)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="contact-actions">
              <Button variant="primary" icon={Phone} href={getPhoneUrl(business?.phone)} onClick={() => analyticsService.trackPhoneClick()}>
                {t('common.call')}
              </Button>
              <Button variant="whatsapp" icon={MessageCircle} href={getGreetingWhatsAppUrl(business?.whatsapp)} target="_blank" onClick={() => analyticsService.trackWhatsAppClick()}>
                {t('common.whatsapp')}
              </Button>
              {business?.location?.googleMapsUrl && (
                <Button variant="outline" icon={Navigation} href={business.location.googleMapsUrl} target="_blank" onClick={handleMapClick}>
                  {t('contact.getDirections')}
                </Button>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="contact-map">
            {getMapEmbedUrl(business?.location) ? (
              <iframe
                src={getMapEmbedUrl(business?.location)}
                title="Business Location"
                className="contact-map__iframe"
                loading="lazy"
                allowFullScreen
              />
            ) : (
              <div className="contact-map__placeholder">
                <MapPin size={48} />
                <p>Map location will be configured</p>
                <small>Admin can set the Google Maps location</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
