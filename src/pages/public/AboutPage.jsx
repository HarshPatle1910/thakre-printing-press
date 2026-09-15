import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import analyticsService from '../../services/analyticsService';
import Loader from '../../components/common/Loader';
import './AboutPage.css';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.trackPageView('/about');
    firestoreService.getDocument(COLLECTIONS.ABOUT, 'main')
      .then((data) => { setAbout(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="about-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('about.title')}</span>
          <h1>{t('about.title')}</h1>
          <p>{t('about.subtitle')}</p>
        </div>

        {/* Business story */}
        {about?.businessHistory && (
          <section className="about-section">
            <div className="about-story">
              <p>{getLocalized(about.businessHistory, lang)}</p>
            </div>
          </section>
        )}

        {/* Family business */}
        {about?.familyDescription && (
          <section className="about-section about-family">
            <h2>{t('about.familyBusiness')}</h2>
            <p>{getLocalized(about.familyDescription, lang)}</p>
          </section>
        )}

        {/* Team */}
        {about?.familyMembers?.filter(m => m.published !== false).length > 0 && (
          <section className="about-section">
            <h2>{t('about.teamTitle')}</h2>
            <div className="team-grid">
              {about.familyMembers
                .filter(m => m.published !== false)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((member, i) => (
                <div className="team-card" key={i}>
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="team-card__photo" />
                  ) : (
                    <div className="team-card__photo-placeholder"><Users size={32} /></div>
                  )}
                  <h3>{member.name}</h3>
                  <p className="team-card__role">{getLocalized(member.role, lang)}</p>
                  {member.biography && <p className="team-card__bio">{getLocalized(member.biography, lang)}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {!about && (
          <div className="about-placeholder">
            <Users size={48} />
            <h3>About Us</h3>
            <p>Learn about Thakre Printing Press — a family-run printing business serving Goregaon and surrounding areas.</p>
            <p className="about-placeholder__note">Business history and team details can be managed through the Admin Panel.</p>
          </div>
        )}
      </div>
    </main>
  );
}
