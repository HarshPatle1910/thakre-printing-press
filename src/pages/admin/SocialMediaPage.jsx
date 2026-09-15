import { useState, useEffect } from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { Save, CheckCircle, AlertCircle, Share2, Camera, Video, Globe } from 'lucide-react';

export default function SocialMediaPage() {
  const { business } = useBusiness();
  const { user } = useAuth();

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    googleMyBusiness: '',
    twitter: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (business?.socialLinks) {
      setSocialLinks({
        facebook: business.socialLinks.facebook || '',
        instagram: business.socialLinks.instagram || '',
        youtube: business.socialLinks.youtube || '',
        googleMyBusiness: business.socialLinks.googleMyBusiness || '',
        twitter: business.socialLinks.twitter || '',
      });
    }
  }, [business]);

  const handleChange = (platform, value) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.updateDocument(COLLECTIONS.BUSINESS, 'main', {
        socialLinks,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_SOCIAL_LINKS',
        'business',
        'socialLinks'
      );

      setMessage({ type: 'success', text: 'Social media links updated successfully!' });
    } catch (err) {
      console.error('Error updating social links:', err);
      setMessage({ type: 'error', text: 'Failed to update social links: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="social-media-page animate-fade-in">
      <AdminHeader
        title="Social Media Links"
        subtitle="Manage customer-facing social media profiles and Google business page"
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
            <h2>Profiles & Pages</h2>
            <p>Links will appear in the website footer and contact section</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Camera size={16} className="social-input-icon" /> Instagram Profile URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://instagram.com/thakreprintingpress"
              value={socialLinks.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Share2 size={16} className="social-input-icon" /> Facebook Page URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://facebook.com/thakreprinting"
              value={socialLinks.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Video size={16} className="social-input-icon" /> YouTube Channel URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://youtube.com/@thakreprinting"
              value={socialLinks.youtube}
              onChange={(e) => handleChange('youtube', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Globe size={16} className="social-input-icon" /> Google My Business / Review Link
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://g.page/r/..."
              value={socialLinks.googleMyBusiness}
              onChange={(e) => handleChange('googleMyBusiness', e.target.value)}
            />
            <span className="form-hint">Used for encouraging happy customers to leave Google ratings</span>
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save Social Links'}
          </Button>
        </div>
      </form>
    </div>
  );
}
