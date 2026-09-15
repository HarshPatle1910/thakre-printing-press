import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { Save, CheckCircle, AlertCircle, Plus, Trash2, Home } from 'lucide-react';
import './HomepageCMSPage.css';

export default function HomepageCMSPage() {
  const { user } = useAuth();

  const [homepageData, setHomepageData] = useState({
    hero: {
      title: {
        en: 'High Quality Printing & Designing Services in Goregaon',
        mr: 'गोरेगावमध्ये उच्च दर्जाची प्रिंटिंग आणि डिझायनिंग सेवा',
        hi: 'गोरेगांव में उच्च गुणवत्ता वाली प्रिंटिंग और डिज़ाइनिंग सेवाएं',
      },
      subtitle: {
        en: 'From vibrant flex banners and wedding invitations to official government forms and custom merchandise.',
        mr: 'आकर्षक फ्लेक्स बॅनर आणि लग्नाची आमंत्रण पत्रिका ते अधिकृत शासकीय फॉर्म्स आणि कस्टम प्रिंट्सपर्यंत.',
        hi: 'आकर्षक फ्लेक्स बैनर और शादी के निमंत्रण पत्र से लेकर सरकारी फॉर्म और कस्टम प्रिंट्स तक।',
      },
      image: '',
      ctaLabel: { en: 'Request a Quote', mr: 'कोटेशन मागा', hi: 'कोटेशन प्राप्त करें' },
    },
    announcement: {
      enabled: false,
      text: { en: 'Special discount on bulk wedding card printing this season!', mr: '', hi: '' },
    },
    whyChooseUs: [
      {
        icon: 'printer',
        title: { en: 'State-of-the-Art Machines', mr: 'आधुनिक मशिन्स', hi: 'आधुनिक मशीनें' },
        description: { en: 'Crisp, high-definition prints with durable color accuracy.', mr: '', hi: '' },
      },
      {
        icon: 'clock',
        title: { en: 'Fast Turnaround', mr: 'जलद वितरण', hi: 'तेज़ डिलीवरी' },
        description: { en: 'Urgent banner printing and same-day document prints available.', mr: '', hi: '' },
      },
      {
        icon: 'award',
        title: { en: 'Local Family Trust', mr: 'स्थानिक विश्वास', hi: 'स्थानीय विश्वसनीयता' },
        description: { en: 'Proudly serving Goregaon and Gondia district for years.', mr: '', hi: '' },
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const docSnap = await firestoreService.getDocument('pages', 'homepage');
        if (docSnap) {
          setHomepageData((prev) => ({
            ...prev,
            ...docSnap,
            hero: { ...prev.hero, ...(docSnap.hero || {}) },
            announcement: { ...prev.announcement, ...(docSnap.announcement || {}) },
            whyChooseUs: docSnap.whyChooseUs || prev.whyChooseUs,
          }));
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroChange = (field, lang, value) => {
    setHomepageData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: typeof prev.hero[field] === 'object'
          ? { ...prev.hero[field], [lang]: value }
          : value,
      },
    }));
  };

  const handleAnnouncementChange = (field, value) => {
    setHomepageData((prev) => ({
      ...prev,
      announcement: { ...prev.announcement, [field]: value },
    }));
  };

  const handleAddWhyChoose = () => {
    setHomepageData((prev) => ({
      ...prev,
      whyChooseUs: [
        ...prev.whyChooseUs,
        {
          icon: 'printer',
          title: { en: 'New Feature', mr: '', hi: '' },
          description: { en: 'Description here', mr: '', hi: '' },
        },
      ],
    }));
  };

  const handleRemoveWhyChoose = (index) => {
    setHomepageData((prev) => ({
      ...prev,
      whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== index),
    }));
  };

  const handleWhyChooseChange = (index, field, lang, value) => {
    setHomepageData((prev) => {
      const updated = [...prev.whyChooseUs];
      updated[index] = {
        ...updated[index],
        [field]: { ...updated[index][field], [lang]: value },
      };
      return { ...prev, whyChooseUs: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.setDocument('pages', 'homepage', {
        ...homepageData,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_HOMEPAGE_CMS',
        'pages',
        'homepage'
      );

      setMessage({ type: 'success', text: 'Homepage CMS saved successfully!' });
    } catch (err) {
      console.error('Error saving homepage CMS:', err);
      setMessage({ type: 'error', text: 'Failed to save homepage: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="homepage-cms-page animate-fade-in">
      <AdminHeader
        title="Homepage CMS"
        subtitle="Manage hero banner, announcement bar, and promotional sections"
      />

      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Announcement Bar */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Top Announcement Bar</h2>
            <p>Notice banner displayed above the main navigation</p>
          </div>

          <div className="form-group">
            <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={homepageData.announcement.enabled}
                onChange={(e) => handleAnnouncementChange('enabled', e.target.checked)}
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          {homepageData.announcement.enabled && (
            <div className="form-group">
              <label className="form-label">Announcement Text</label>
              <input
                type="text"
                className="form-input"
                value={homepageData.announcement.text?.en || ''}
                onChange={(e) =>
                  handleAnnouncementChange('text', {
                    ...homepageData.announcement.text,
                    en: e.target.value,
                  })
                }
              />
            </div>
          )}
        </section>

        {/* Hero Section */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Hero Banner</h2>
            <p>Main headline and call-to-action on the homepage</p>
          </div>

          <div className="form-group">
            <label className="form-label">Hero Title (English)</label>
            <input
              type="text"
              className="form-input"
              value={homepageData.hero.title.en}
              onChange={(e) => handleHeroChange('title', 'en', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Title (Marathi / मराठी)</label>
            <input
              type="text"
              className="form-input"
              value={homepageData.hero.title.mr}
              onChange={(e) => handleHeroChange('title', 'mr', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Title (Hindi / हिंदी)</label>
            <input
              type="text"
              className="form-input"
              value={homepageData.hero.title.hi}
              onChange={(e) => handleHeroChange('title', 'hi', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Subtitle (English)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={homepageData.hero.subtitle.en}
              onChange={(e) => handleHeroChange('subtitle', 'en', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Background / Featured Image URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={homepageData.hero.image || ''}
              onChange={(e) => handleHeroChange('image', null, e.target.value)}
            />
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="admin-card">
          <div className="admin-card__header flex-between">
            <div>
              <h2>Why Choose Us Points</h2>
              <p>Key value propositions shown on the home page</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddWhyChoose}
            >
              Add Point
            </Button>
          </div>

          <div className="why-choose-list">
            {homepageData.whyChooseUs.map((item, idx) => (
              <div key={idx} className="why-choose-item">
                <div className="why-choose-item__header">
                  <strong>Point #{idx + 1}</strong>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => handleRemoveWhyChoose(idx)}
                    title="Remove point"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Title (English)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.title.en}
                      onChange={(e) => handleWhyChooseChange(idx, 'title', 'en', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description (English)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.description.en}
                      onChange={(e) => handleWhyChooseChange(idx, 'description', 'en', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save Homepage CMS'}
          </Button>
        </div>
      </form>
    </div>
  );
}
