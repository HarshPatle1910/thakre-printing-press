import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../contexts/BusinessContext';
import { Menu, X, Phone, Printer } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Button from '../common/Button';
import { getPhoneUrl } from '../../utils/whatsapp';
import analyticsService from '../../services/analyticsService';
import './Header.css';

export default function Header() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/gallery', label: t('nav.gallery') },
    { path: '/forms', label: t('nav.forms') },
    { path: '/about', label: t('nav.about') },
    { path: '/faq', label: t('nav.faq') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const handlePhoneClick = () => {
    analyticsService.trackPhoneClick();
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__container">
        <Link to="/" className="header__brand" aria-label={business.name}>
          {business.branding?.logo ? (
            <img src={business.branding.logo} alt={business.name} className="header__logo" />
          ) : (
            <div className="header__logo-placeholder">
              <Printer size={24} />
              <span className="header__brand-name">{business.name}</span>
            </div>
          )}
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`} aria-label="Main navigation">
          <ul className="header__nav-list">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`header__nav-link ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="header__nav-actions">
            <LanguageSwitcher />
            <a
              href={getPhoneUrl(business.phone)}
              className="header__phone-link"
              onClick={handlePhoneClick}
              aria-label={`Call ${business.phone}`}
            >
              <Phone size={16} />
              <span>{business.phone}</span>
            </a>
            <Button variant="primary" size="sm" href="/quote">
              {t('hero.cta')}
            </Button>
          </div>
        </nav>

        <button
          className="header__menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
