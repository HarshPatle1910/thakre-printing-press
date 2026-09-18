import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import { Phone, MapPin, Clock, Mail, Printer } from 'lucide-react';
import { getPhoneUrl } from '../../utils/whatsapp';
import { formatPhone, formatTime, getLocalized, formatImageUrl } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import './Footer.css';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { business, openingHours } = useBusiness();
  const [footerServices, setFooterServices] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const year = new Date().getFullYear();

  const footerLogo = formatImageUrl(business?.branding?.logoLight || business?.branding?.logo);

  useEffect(() => {
    setLogoError(false);
  }, [business?.branding?.logo, business?.branding?.logoLight]);

  useEffect(() => {
    firestoreService.getCollection(COLLECTIONS.SERVICES, [
      firestoreService.where('published', '==', true),
      firestoreService.orderBy('displayOrder', 'asc'),
      firestoreService.limit(6),
    ])
      .then(setFooterServices)
      .catch((err) => console.error('Failed to load footer services:', err));
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__section footer__brand-section">
            <Link to="/" className="footer__brand" aria-label={business.name}>
              {footerLogo && !logoError ? (
                <img
                  src={footerLogo}
                  alt={business.name}
                  className="footer__logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="footer__logo-placeholder">
                  <Printer size={24} />
                  <span>{business.name}</span>
                </div>
              )}
            </Link>
            <p className="footer__tagline">{business.branding?.tagline || t('footer.tagline')}</p>

            {/* Social links */}
            {business.socialLinks && Object.keys(business.socialLinks).some(k => business.socialLinks[k]) && (
              <div className="footer__social">
                {business.socialLinks.facebook && (
                  <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                )}
                {business.socialLinks.instagram && (
                  <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                )}
                {business.socialLinks.youtube && (
                  <a href={business.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">YT</a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.quickLinks')}</h4>
            <ul className="footer__links">
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/about">{t('nav.about')}</Link></li>
              <li><Link to="/gallery">{t('nav.gallery')}</Link></li>
              <li><Link to="/faq">{t('nav.faq')}</Link></li>
              <li><Link to="/quote">{t('nav.quote')}</Link></li>
              <li><Link to="/contact">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.ourServices')}</h4>
            <ul className="footer__links">
              {footerServices.map((svc) => (
                <li key={svc.id || svc.slug}>
                  <Link to={`/services/${svc.slug}`}>{getLocalized(svc.title, lang)}</Link>
                </li>
              ))}
              <li><Link to="/services">All Services</Link></li>
              <li><Link to="/forms">{t('nav.forms')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.contactInfo')}</h4>
            <ul className="footer__contact-list">
              <li>
                <Phone size={16} />
                <a href={getPhoneUrl(business.phone)}>{formatPhone(business.phone)}</a>
              </li>
              {business.email && (
                <li>
                  <Mail size={16} />
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </li>
              )}
              <li>
                <MapPin size={16} />
                <span>
                  {business.address?.line1}<br />
                  {business.address?.city}, {business.address?.district}<br />
                  {business.address?.state}
                </span>
              </li>
              <li>
                <Clock size={16} />
                <span>
                  {openingHours?.monday?.closed
                    ? 'Mon–Sat: Closed'
                    : `Mon–Sat: ${formatTime(openingHours?.monday?.open || '09:00')} – ${formatTime(openingHours?.monday?.close || '20:00')}`}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            {t('footer.copyright', { year })}
          </p>
          <div className="footer__legal">
            <Link to="/privacy">{t('nav.privacy')}</Link>
            <Link to="/terms">{t('nav.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
