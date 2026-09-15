import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Save, ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import './ServiceEditPage.css';

export default function ServiceEditPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    slug: '',
    title: { en: '', mr: '', hi: '' },
    shortDescription: { en: '', mr: '', hi: '' },
    description: { en: '', mr: '', hi: '' },
    heroImage: '',
    icon: 'printer',
    displayOrder: 1,
    published: true,
    featured: false,
    features: [{ title: { en: '' }, description: { en: '' } }],
    subServices: [{ title: { en: '' }, description: { en: '' } }],
    enquiryFields: [
      { name: 'quantity', label: { en: 'Quantity / Copies' }, type: 'number', required: true },
    ],
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isNew) {
      async function loadService() {
        try {
          const docSnap = await firestoreService.getDocument(COLLECTIONS.SERVICES, id);
          if (docSnap) {
            setFormData({
              ...docSnap,
              title: { en: '', mr: '', hi: '', ...(docSnap.title || {}) },
              shortDescription: { en: '', mr: '', hi: '', ...(docSnap.shortDescription || {}) },
              description: { en: '', mr: '', hi: '', ...(docSnap.description || {}) },
              features: docSnap.features || [],
              subServices: docSnap.subServices || [],
              enquiryFields: docSnap.enquiryFields || [],
            });
          }
        } catch (err) {
          console.error('Error fetching service:', err);
          setMessage({ type: 'error', text: 'Failed to load service details' });
        } finally {
          setLoading(false);
        }
      }
      loadService();
    }
  }, [id, isNew]);

  const handleTitleChange = (lang, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        title: { ...prev.title, [lang]: value },
      };
      if (lang === 'en' && isNew && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { title: { en: '' }, description: { en: '' } }],
    }));
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddSubService = () => {
    setFormData((prev) => ({
      ...prev,
      subServices: [...prev.subServices, { title: { en: '' }, description: { en: '' } }],
    }));
  };

  const handleRemoveSubService = (index) => {
    setFormData((prev) => ({
      ...prev,
      subServices: prev.subServices.filter((_, i) => i !== index),
    }));
  };

  const handleAddEnquiryField = () => {
    setFormData((prev) => ({
      ...prev,
      enquiryFields: [
        ...prev.enquiryFields,
        { name: 'customField', label: { en: 'New Field' }, type: 'text', required: false },
      ],
    }));
  };

  const handleRemoveEnquiryField = (index) => {
    setFormData((prev) => ({
      ...prev,
      enquiryFields: prev.enquiryFields.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        displayOrder: Number(formData.displayOrder) || 1,
        updatedBy: user?.uid || 'admin',
      };

      if (isNew) {
        const newDoc = await firestoreService.addDocument(COLLECTIONS.SERVICES, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'CREATE_SERVICE',
          'services',
          newDoc.id,
          { title: formData.title.en }
        );
        navigate('/admin/services');
      } else {
        await firestoreService.setDocument(COLLECTIONS.SERVICES, id, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'UPDATE_SERVICE',
          'services',
          id,
          { title: formData.title.en }
        );
        setMessage({ type: 'success', text: 'Service updated successfully!' });
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setMessage({ type: 'error', text: 'Failed to save service: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading service details..." />;

  return (
    <div className="service-edit-page animate-fade-in">
      <AdminHeader
        title={isNew ? 'Create New Service' : `Edit: ${formData.title.en || 'Service'}`}
        subtitle="Configure service presentation, features, and custom quotation form inputs"
        actions={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/services')}
          >
            Back to List
          </Button>
        }
      />

      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Core Info */}
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Basic Information</h2>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Service Title (English) <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.title.en}
                onChange={(e) => handleTitleChange('en', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Title (Marathi / मराठी)</label>
              <input
                type="text"
                className="form-input"
                value={formData.title.mr}
                onChange={(e) => handleTitleChange('mr', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Title (Hindi / हिंदी)</label>
              <input
                type="text"
                className="form-input"
                value={formData.title.hi}
                onChange={(e) => handleTitleChange('hi', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero / Sample Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.heroImage}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-group form-group--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <span>Published (Visible on Website)</span>
              </label>
            </div>

            <div className="form-group form-group--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span>Featured on Homepage</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description (English)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.shortDescription.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shortDescription: { ...formData.shortDescription, en: e.target.value },
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Detailed Description (English)</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
            />
          </div>
        </section>

        {/* Dynamic Enquiry Fields */}
        <section className="admin-card">
          <div className="admin-card__header flex-between">
            <div>
              <h2>Quotation Form Dynamic Fields</h2>
              <p>Custom input fields shown on the quote page when this service is selected</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddEnquiryField}
            >
              Add Field
            </Button>
          </div>

          <div className="dynamic-fields-list">
            {formData.enquiryFields.map((field, idx) => (
              <div key={idx} className="dynamic-field-row">
                <div className="field-group">
                  <label className="field-sublabel">Field Key</label>
                  <input
                    type="text"
                    className="form-input"
                    value={field.name}
                    placeholder="e.g. width"
                    onChange={(e) => {
                      const updated = [...formData.enquiryFields];
                      updated[idx].name = e.target.value;
                      setFormData({ ...formData, enquiryFields: updated });
                    }}
                  />
                </div>

                <div className="field-group">
                  <label className="field-sublabel">Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={field.label?.en || field.name}
                    placeholder="e.g. Banner Width (ft)"
                    onChange={(e) => {
                      const updated = [...formData.enquiryFields];
                      updated[idx].label = { ...updated[idx].label, en: e.target.value };
                      setFormData({ ...formData, enquiryFields: updated });
                    }}
                  />
                </div>

                <div className="field-group">
                  <label className="field-sublabel">Type</label>
                  <select
                    className="form-select"
                    value={field.type}
                    onChange={(e) => {
                      const updated = [...formData.enquiryFields];
                      updated[idx].type = e.target.value;
                      setFormData({ ...formData, enquiryFields: updated });
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown Select</option>
                  </select>
                </div>

                <div className="field-group field-group--checkbox">
                  <label className="checkbox-label" style={{ marginTop: '24px' }}>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const updated = [...formData.enquiryFields];
                        updated[idx].required = e.target.checked;
                        setFormData({ ...formData, enquiryFields: updated });
                      }}
                    />
                    <span>Required</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="btn-icon-danger"
                  style={{ marginTop: '20px' }}
                  onClick={() => handleRemoveEnquiryField(idx)}
                  title="Remove field"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/services')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Save}
            loading={saving}
          >
            {saving ? 'Saving...' : 'Save Service'}
          </Button>
        </div>
      </form>
    </div>
  );
}
