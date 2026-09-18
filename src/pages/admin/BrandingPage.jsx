import { useState, useEffect } from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { formatImageUrl } from '../../utils/helpers';
import { Save, CheckCircle, AlertCircle, Image, Palette, Eye } from 'lucide-react';
import './BrandingPage.css';

export default function BrandingPage() {
  const { business } = useBusiness();
  const { user } = useAuth();

  const [branding, setBranding] = useState({
    logo: '',
    logoDark: '',
    logoLight: '',
    favicon: '',
    socialImage: '',
    tagline: 'Quality Printing & Designing at Goregaon',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (business?.branding) {
      setBranding({
        logo: business.branding.logo || '',
        logoDark: business.branding.logoDark || '',
        logoLight: business.branding.logoLight || '',
        favicon: business.branding.favicon || '',
        socialImage: business.branding.socialImage || '',
        tagline: business.branding.tagline || 'Quality Printing & Designing at Goregaon',
      });
    }
  }, [business]);

  const handleChange = (field, value) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.updateDocument(COLLECTIONS.BUSINESS, 'main', {
        branding,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_BRANDING',
        'business',
        'branding'
      );

      setMessage({ type: 'success', text: 'Branding updated successfully!' });
    } catch (err) {
      console.error('Error updating branding:', err);
      setMessage({ type: 'error', text: 'Failed to update branding: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="branding-page animate-fade-in">
      <AdminHeader
        title="Branding & Identity"
        subtitle="Configure logos, favicons, and social preview assets"
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
            <h2>Logo Assets</h2>
            <p>Direct image URLs for website headers, footers, and invoices</p>
          </div>

          <div className="form-group">
            <label className="form-label">Main Logo URL (Square or Landscape)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/logo.png"
              value={branding.logo}
              onChange={(e) => handleChange('logo', e.target.value)}
            />
            <span className="form-hint">Recommended format: PNG, SVG, or WebP with transparent background. Supports Google Drive links (&ldquo;Anyone with link can view&rdquo;).</span>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Dark Background Logo (Light / White Version)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/logo-white.png or Google Drive link"
                value={branding.logoLight}
                onChange={(e) => handleChange('logoLight', e.target.value)}
              />
              <span className="form-hint">Used on dark headers, banners, and footers</span>
            </div>

            <div className="form-group">
              <label className="form-label">Favicon URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/favicon.png or Google Drive link"
                value={branding.favicon}
                onChange={(e) => handleChange('favicon', e.target.value)}
              />
              <span className="form-hint">Icon displayed in browser tab</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Social Share Image (OG Image preview for WhatsApp/FB)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/social-preview.jpg or Google Drive link"
              value={branding.socialImage}
              onChange={(e) => handleChange('socialImage', e.target.value)}
            />
            <span className="form-hint">Recommended size: 1200x630 pixels. Used when sharing link on WhatsApp/Facebook.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Brand Tagline</label>
            <input
              type="text"
              className="form-input"
              value={branding.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
            />
          </div>
        </section>

        {/* Live Preview Card */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2><Eye size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Asset Live Preview</h2>
            <p>How your logo looks on light and dark surfaces</p>
          </div>

          <div className="branding-preview-grid">
            <div className="branding-preview-box branding-preview-box--light">
              <span className="preview-label">Light Surface (Main Logo)</span>
              {branding.logo ? (
                <img
                  src={formatImageUrl(branding.logo)}
                  alt="Light preview"
                  className="preview-img"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="preview-placeholder" style={{ display: branding.logo ? 'none' : 'flex' }}>
                Thakre Printing Press
              </div>
            </div>

            <div className="branding-preview-box branding-preview-box--dark">
              <span className="preview-label">Dark Surface (Light / White Logo)</span>
              {branding.logoLight || branding.logo ? (
                <img
                  src={formatImageUrl(branding.logoLight || branding.logo)}
                  alt="Dark preview"
                  className="preview-img"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="preview-placeholder preview-placeholder--light" style={{ display: (branding.logoLight || branding.logo) ? 'none' : 'flex' }}>
                Thakre Printing Press
              </div>
            </div>

            {branding.favicon && (
              <div className="branding-preview-box branding-preview-box--light">
                <span className="preview-label">Favicon Preview</span>
                <img
                  src={formatImageUrl(branding.favicon)}
                  alt="Favicon preview"
                  style={{ width: '48px', height: '48px', objectFit: 'contain', margin: 'auto' }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {branding.socialImage && (
              <div className="branding-preview-box branding-preview-box--light">
                <span className="preview-label">Social Share (OG Preview)</span>
                <img
                  src={formatImageUrl(branding.socialImage)}
                  alt="Social share preview"
                  style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', margin: 'auto' }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </form>
    </div>
  );
}
