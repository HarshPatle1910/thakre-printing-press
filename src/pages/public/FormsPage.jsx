import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Check, XCircle } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './FormsPage.css';

import { SEED_DATA } from '../../config/seedData';

export default function FormsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [forms, setForms] = useState(SEED_DATA.forms);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    analyticsService.trackPageView('/forms');
    firestoreService.getCollection(COLLECTIONS.FORMS, [
      firestoreService.where('published', '==', true),
      firestoreService.orderBy('displayOrder', 'asc'),
    ]).then((data) => {
      if (data && data.length > 0) setForms(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = forms.filter(f => {
    if (!search) return true;
    const name = getLocalized(f.name, lang).toLowerCase();
    const desc = getLocalized(f.description, lang).toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || desc.includes(q);
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
          <div className="forms-search">
            <Search size={18} />
            <input type="text" placeholder={t('forms.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" />
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title={t('forms.noForms')} />
        ) : (
          <div className="forms-grid">
            {filtered.map((form) => (
              <div className="form-card" key={form.id}>
                {form.previewImage && <img src={form.previewImage} alt={getLocalized(form.name, lang)} className="form-card__image" loading="lazy" />}
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
