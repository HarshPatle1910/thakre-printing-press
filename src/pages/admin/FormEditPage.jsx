import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Save, ArrowLeft, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import './FormEditPage.css';

export default function FormEditPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: { en: '', mr: '', hi: '' },
    category: 'government',
    description: { en: '', mr: '' },
    availability: 'available',
    price: '',
    priceNote: { en: '' },
    displayOrder: 1,
    published: true,
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await firestoreService.deleteDocument(COLLECTIONS.FORMS, id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_FORM',
        'forms',
        id,
        { name: formData.name?.en || 'Form' }
      );
      navigate('/admin/forms');
    } catch (err) {
      console.error('Error deleting form:', err);
      setMessage({ type: 'error', text: 'Failed to delete form: ' + err.message });
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!isNew) {
      async function loadForm() {
        try {
          const docSnap = await firestoreService.getDocument(COLLECTIONS.FORMS, id);
          if (docSnap) {
            setFormData({
              ...docSnap,
              name: { en: '', mr: '', hi: '', ...(docSnap.name || {}) },
              description: { en: '', mr: '', ...(docSnap.description || {}) },
              priceNote: { en: '', ...(docSnap.priceNote || {}) },
              published: docSnap.published !== false,
            });
          }
        } catch (err) {
          console.error('Error loading form:', err);
          setMessage({ type: 'error', text: 'Failed to load form details' });
        } finally {
          setLoading(false);
        }
      }
      loadForm();
    }
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        displayOrder: Number(formData.displayOrder) || 1,
        updatedBy: user?.uid || 'admin',
      };

      if (isNew) {
        const newDoc = await firestoreService.addDocument(COLLECTIONS.FORMS, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'CREATE_FORM',
          'forms',
          newDoc.id,
          { name: formData.name.en }
        );
        navigate('/admin/forms');
      } else {
        await firestoreService.setDocument(COLLECTIONS.FORMS, id, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'UPDATE_FORM',
          'forms',
          id,
          { name: formData.name.en }
        );
        setMessage({ type: 'success', text: 'Form updated successfully!' });
      }
    } catch (err) {
      console.error('Error saving form:', err);
      setMessage({ type: 'error', text: 'Failed to save form: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading form..." />;

  return (
    <div className="form-edit-page animate-fade-in">
      <AdminHeader
        title={isNew ? 'Add New Form' : `Edit: ${formData.name.en || 'Form'}`}
        subtitle="Configure official form metadata, price, and availability status"
        actions={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/forms')}
          >
            Back to Forms
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
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Form Information</h2>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Form Name (English) <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.name.en}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Form Name (Marathi / मराठी)</label>
              <input
                type="text"
                className="form-input"
                value={formData.name.mr}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, mr: e.target.value } })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="government">Government & Administration</option>
                <option value="revenue">Land & Revenue (7/12, etc.)</option>
                <option value="court">Court, Stamp & Affidavits</option>
                <option value="rto">RTO & Transport</option>
                <option value="school">School & College Formats</option>
                <option value="business">Business & Accounts Registers</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select
                className="form-select"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="available">Available in Stock</option>
                <option value="print_on_demand">Print On Demand</option>
                <option value="out_of_stock">Temporarily Out of Stock</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹ INR)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions (English)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
            />
          </div>

          <div className="form-group form-group--checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.published !== false}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <strong>Visible on Public Website (Published)</strong>
            </label>
            <small style={{ display: 'block', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Check this box to show this form immediately in the public catalog
            </small>
          </div>
        </section>

        <div className="admin-form-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {!isNew && (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Form
            </Button>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginLeft: isNew ? 'auto' : undefined }}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/forms')}
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
              {saving ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Form"
        message="Are you sure you want to delete this form? It will no longer be listed in the government forms registry."
        itemName={formData.name.en}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
