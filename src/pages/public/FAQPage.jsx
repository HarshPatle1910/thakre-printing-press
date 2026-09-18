import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './FAQPage.css';

export default function FAQPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.trackPageView('/faq');
    firestoreService.getCollection(COLLECTIONS.FAQS, [
      firestoreService.where('published', '==', true),
      firestoreService.orderBy('displayOrder', 'asc'),
    ]).then((data) => {
      setFaqs(data || []);
      setLoading(false);
    }).catch((err) => {
      console.warn('Fallback fetching FAQs without compound order:', err);
      firestoreService.getCollection(COLLECTIONS.FAQS)
        .then((all) => {
          const published = (all || [])
            .filter((f) => f.published !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setFaqs(published);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch FAQs from Firebase:', error);
          setFaqs([]);
          setLoading(false);
        });
    });
  }, []);

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="faq-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('faq.title')}</span>
          <h1>{t('faq.title')}</h1>
          <p>{t('faq.subtitle')}</p>
        </div>

        {faqs.length === 0 ? (
          <EmptyState icon={HelpCircle} title={t('faq.noFaqs')} />
        ) : (
          <div className="faq-list">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.id}>
                <summary className="faq-item__question">{getLocalized(faq.question, lang)}</summary>
                <div className="faq-item__answer">{getLocalized(faq.answer, lang)}</div>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
