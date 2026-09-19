import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Check, XCircle } from 'lucide-react';
import { getLocalized, formatImageUrl } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import './FormsPage.css';

export default function FormsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    analyticsService.trackPageView('/forms');

    // Real-time listener for live updates from Firebase
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.FORMS,
      [],
      (data) => {
        const published = (data || [])
          .filter((f) => f.published !== false)
          .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        setForms(published);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to subscribe to forms:', err);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const filtered = forms.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameEn = (f.name?.en || '').toLowerCase();
    const nameMr = (f.name?.mr || '').toLowerCase();
    const nameHi = (f.name?.hi || '').toLowerCase();
    const descEn = (f.description?.en || '').toLowerCase();
    const descMr = (f.description?.mr || '').toLowerCase();
    const localizedName = getLocalized(f.name, lang).toLowerCase();
    const localizedDesc = getLocalized(f.description, lang).toLowerCase();

    return (
      nameEn.includes(q) ||
      nameMr.includes(q) ||
      nameHi.includes(q) ||
      descEn.includes(q) ||
      descMr.includes(q) ||
      localizedName.includes(q) ||
      localizedDesc.includes(q)
    );
  });

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="forms-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('forms.title')}</span>
          <h1>{t('forms.title')}</h1>
          <p>{t('forms.subtitle')}</p>
        </div>

        {forms.length > 0 && (
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder={t('forms.search')}
            ariaLabel={t('forms.search')}
            count={search.trim() ? filtered.length : undefined}
            id="forms-search"
          />
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('forms.noForms')}
            message={
              search
                ? `No official forms found matching "${search}". Try searching by department or keyword.`
                : "Official forms will appear here once added to the catalog."
            }
            action={
              search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  {t('common.clearSearch')}
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="forms-grid">
            {filtered.map((form) => (
              <div className="form-card" key={form.id}>
                {form.previewImage && <img src={formatImageUrl(form.previewImage)} alt={getLocalized(form.name, lang)} className="form-card__image" loading="lazy" referrerPolicy="no-referrer" />}
                <div className="form-card__body">
                  <h3>{getLocalized(form.name, lang)}</h3>
                  {form.description && <p>{getLocalized(form.description, lang)}</p>}
                  <div className="form-card__meta">
                    <span className={`form-card__availability ${form.availability === 'available' ? '' : 'form-card__availability--unavailable'}`}>
                      {form.availability === 'available' ? <><Check size={14} /> {t('forms.available')}</> : <><XCircle size={14} /> {t('forms.unavailable')}</>}
                    </span>
                    {form.price ? <span className="form-card__price">₹{form.price}</span> : <span className="form-card__price">{t('forms.priceOnRequest')}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
