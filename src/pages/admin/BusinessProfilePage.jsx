import { useState, useEffect } from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Save, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import './BusinessProfilePage.css';

export default function BusinessProfilePage() {
  const { business } = useBusiness();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    establishedYear: '',
    familyBusiness: true,
    phone: '',
    whatsapp: '',
    email: '',
    description: { en: '', mr: '', hi: '' },
    familyStory: { en: '', mr: '', hi: '' },
    address: {
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      country: '',
      pin: '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        owner: business.owner || '',
        establishedYear: business.establishedYear || '',
        familyBusiness: business.familyBusiness ?? true,
        phone: business.phone || '',
        whatsapp: business.whatsapp || '',
        email: business.email || '',
        description: {
          en: business.description?.en || '',
          mr: business.description?.mr || '',
          hi: business.description?.hi || '',
        },
        familyStory: {
          en: business.familyStory?.en || '',
          mr: business.familyStory?.mr || '',
          hi: business.familyStory?.hi || '',
        },
        address: {
          line1: business.address?.line1 || '',
          line2: business.address?.line2 || '',
          landmark: business.address?.landmark || '',
          city: business.address?.city || '',
          district: business.address?.district || '',
          state: business.address?.state || '',
          country: business.address?.country || 'India',
          pin: business.address?.pin || '',
        },
      });
    }
  }, [business]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.setDocument(COLLECTIONS.BUSINESS, 'main', {
        ...formData,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_BUSINESS_PROFILE',
        'business',
        'main',
        { name: formData.name }
      );

      setMessage({ type: 'success', text: 'Business profile updated successfully!' });
    } catch (err) {
      console.error('Error updating business profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="business-profile-page animate-fade-in">
      <AdminHeader
        title="Business Profile"
        subtitle="Manage primary business identity, contact details, and location"
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
            <h2>Basic Information</h2>
            <p>Identity and ownership details</p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Business Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Owner Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Established Year</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2012"
                value={formData.establishedYear}
                onChange={(e) => handleChange('establishedYear', e.target.value)}
              />
            </div>

            <div className="form-group form-group--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.familyBusiness}
                  onChange={(e) => handleChange('familyBusiness', e.target.checked)}
                />
                <span>Family Business (highlights community heritage)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description (English)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.description.en}
              onChange={(e) => handleNestedChange('description', 'en', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Description (Marathi / मराठी)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.description.mr}
              onChange={(e) => handleNestedChange('description', 'mr', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Description (Hindi / हिंदी)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.description.hi}
              onChange={(e) => handleNestedChange('description', 'hi', e.target.value)}
            />
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Contact Information</h2>
            <p>Direct contact lines displayed to customers</p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Primary Phone <span className="required">*</span></label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number <span className="required">*</span></label>
              <input
                type="tel"
                className="form-input"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@thakreprinting.com"
              />
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Physical Address</h2>
            <p>Location shown on contact page, footer, and invoices</p>
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 1</label>
            <input
              type="text"
              className="form-input"
              value={formData.address.line1}
              onChange={(e) => handleNestedChange('address', 'line1', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 2 (Road/Highway)</label>
            <input
              type="text"
              className="form-input"
              value={formData.address.line2}
              onChange={(e) => handleNestedChange('address', 'line2', e.target.value)}
            />
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Landmark</label>
              <input
                type="text"
                className="form-input"
                value={formData.address.landmark}
                onChange={(e) => handleNestedChange('address', 'landmark', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Town</label>
              <input
                type="text"
                className="form-input"
                value={formData.address.city}
                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                className="form-input"
                value={formData.address.district}
                onChange={(e) => handleNestedChange('address', 'district', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                value={formData.address.state}
                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal / PIN Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.address.pin}
                onChange={(e) => handleNestedChange('address', 'pin', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="admin-form-actions">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Save}
            loading={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
