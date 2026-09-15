import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import { Phone, MapPin, Clock, Mail, Printer } from 'lucide-react';
import { getPhoneUrl, getGreetingWhatsAppUrl } from '../../utils/whatsapp';
import { formatPhone } from '../../utils/helpers';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__section footer__brand-section">
            <Link to="/" className="footer__brand">
              {business.branding?.logo ? (
                <img src={business.branding.logo} alt={business.name} className="footer__logo" />
              ) : (
                <div className="footer__logo-placeholder">
                  <Printer size={24} />
                  <span>{business.name}</span>
                </div>
              )}
            </Link>
            <p className="footer__tagline">{t('footer.tagline')}</p>

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
                <span>Mon–Sat: 9:00 AM – 8:00 PM</span>
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
