import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../config/constants';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switcher">
      <Globe size={16} className="lang-switcher__icon" />
      <select
        className="lang-switcher__select"
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
