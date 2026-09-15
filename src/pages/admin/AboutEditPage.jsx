import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import './AboutEditPage.css';

export default function AboutEditPage() {
  const { user } = useAuth();

  const [aboutData, setAboutData] = useState({
    businessHistory: {
      en: 'Thakre Printing Press was founded in Goregaon with a vision to bring metropolitan-standard printing technology to our local community in Gondia district.',
      mr: 'ठाकरे प्रिंटिंग प्रेसची स्थापना गोरेगावमध्ये स्थानिक नागरिकांना आणि संस्थांना उच्च दर्जाची मुद्रण सेवा देण्याच्या उद्देशाने झाली.',
      hi: 'ठाकरे प्रिंटिंग प्रेस की स्थापना गोरेगांव में उच्च गुणवत्ता की प्रिंटिंग सेवाएं प्रदान करने के लिए की गई थी।',
    },
    familyDescription: {
      en: 'As a committed family business, we treat every customer order with personal care and perfection.',
      mr: 'एक कौटुंबिक व्यवसाय म्हणून आम्ही प्रत्येक ग्राहकाच्या ऑर्डरकडे वैयक्तिक लक्ष देतो.',
      hi: 'एक पारिवारिक व्यवसाय के रूप में हम प्रत्येक ग्राहक की आवश्यकताओं को व्यक्तिगत देखभाल के साथ पूरा करते हैं।',
    },
    familyMembers: [
      {
        name: 'Sachin Thakre',
        role: { en: 'Founder & Managing Director', mr: 'संस्थापक आणि संचालक' },
        biography: { en: 'Over a decade of hands-on expertise in digital printing, machine maintenance, and customer relations.' },
        photo: '',
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadAbout() {
      try {
        const docSnap = await firestoreService.getDocument('about', 'main');
        if (docSnap) {
          setAboutData((prev) => ({
            ...prev,
            ...docSnap,
            businessHistory: { ...prev.businessHistory, ...(docSnap.businessHistory || {}) },
            familyDescription: { ...prev.familyDescription, ...(docSnap.familyDescription || {}) },
            familyMembers: docSnap.familyMembers || prev.familyMembers,
          }));
        }
      } catch (err) {
        console.error('Error loading about data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAbout();
  }, []);

  const handleAddMember = () => {
    setAboutData((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        {
          name: '',
          role: { en: 'Team Member', mr: '' },
          biography: { en: '' },
          photo: '',
        },
      ],
    }));
  };

  const handleRemoveMember = (index) => {
    setAboutData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const handleMemberChange = (index, field, lang, value) => {
    setAboutData((prev) => {
      const updated = [...prev.familyMembers];
      if (lang) {
        updated[index] = {
          ...updated[index],
          [field]: { ...updated[index][field], [lang]: value },
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, familyMembers: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.setDocument('about', 'main', {
        ...aboutData,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_ABOUT_PAGE',
        'about',
        'main'
      );

      setMessage({ type: 'success', text: 'About page details updated successfully!' });
    } catch (err) {
      console.error('Error saving about details:', err);
      setMessage({ type: 'error', text: 'Failed to save: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading about details..." />;

  return (
    <div className="about-edit-page animate-fade-in">
      <AdminHeader
        title="About & Family Story"
        subtitle="Manage the business history, family roots, and leadership profiles"
      />

      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Business Journey & History</h2>
            <p>Tell customers how Thakre Printing Press started and grew</p>
          </div>

          <div className="form-group">
            <label className="form-label">Story / History (English)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={aboutData.businessHistory.en}
              onChange={(e) =>
                setAboutData({
                  ...aboutData,
                  businessHistory: { ...aboutData.businessHistory, en: e.target.value },
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Story / History (Marathi / मराठी)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={aboutData.businessHistory.mr}
              onChange={(e) =>
                setAboutData({
                  ...aboutData,
                  businessHistory: { ...aboutData.businessHistory, mr: e.target.value },
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Family Business Narrative (English)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={aboutData.familyDescription.en}
              onChange={(e) =>
                setAboutData({
                  ...aboutData,
                  familyDescription: { ...aboutData.familyDescription, en: e.target.value },
                })
              }
            />
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header flex-between">
            <div>
              <h2>Team & Family Members</h2>
              <p>Showcase owner and key personnel with photo and role</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          </div>

          <div className="members-list">
            {aboutData.familyMembers.map((member, idx) => (
              <div key={idx} className="member-card-edit">
                <div className="member-card-edit__header">
                  <strong>Member #{idx + 1}</strong>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => handleRemoveMember(idx)}
                    title="Remove member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, 'name', null, e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role / Designation (English)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={member.role?.en || ''}
                      onChange={(e) => handleMemberChange(idx, 'role', 'en', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role (Marathi / मराठी)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={member.role?.mr || ''}
                      onChange={(e) => handleMemberChange(idx, 'role', 'mr', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Photo URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/photo.jpg"
                      value={member.photo || ''}
                      onChange={(e) => handleMemberChange(idx, 'photo', null, e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / Experience</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={member.biography?.en || ''}
                    onChange={(e) => handleMemberChange(idx, 'biography', 'en', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save About Details'}
          </Button>
        </div>
      </form>
    </div>
  );
}
