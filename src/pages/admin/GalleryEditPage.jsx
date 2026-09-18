import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { formatImageUrl } from '../../utils/helpers';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Save, ArrowLeft, CheckCircle, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import './GalleryEditPage.css';

export default function GalleryEditPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: { en: '', mr: '', hi: '' },
    description: { en: '', mr: '', hi: '' },
    category: 'flex-banners',
    imageUrl: '',
    altText: { en: '' },
    displayOrder: 1,
    featured: false,
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
      await firestoreService.deleteDocument(COLLECTIONS.GALLERY, id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_GALLERY_ITEM',
        'gallery',
        id,
        { title: formData.title?.en || 'Gallery Item' }
      );
      navigate('/admin/gallery');
    } catch (err) {
      console.error('Error deleting item:', err);
      setMessage({ type: 'error', text: 'Failed to delete item: ' + err.message });
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!isNew) {
      async function loadItem() {
        try {
          const docSnap = await firestoreService.getDocument(COLLECTIONS.GALLERY, id);
          if (docSnap) {
            setFormData({
              ...docSnap,
              title: { en: '', mr: '', hi: '', ...(docSnap.title || {}) },
              description: { en: '', mr: '', hi: '', ...(docSnap.description || {}) },
              altText: { en: '', ...(docSnap.altText || {}) },
            });
          }
        } catch (err) {
          console.error('Error loading gallery item:', err);
          setMessage({ type: 'error', text: 'Failed to load gallery item' });
        } finally {
          setLoading(false);
        }
      }
      loadItem();
    }
  }, [id, isNew]);

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
        const newDoc = await firestoreService.addDocument(COLLECTIONS.GALLERY, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'CREATE_GALLERY_ITEM',
          'gallery',
          newDoc.id,
          { title: formData.title.en }
        );
        navigate('/admin/gallery');
      } else {
        await firestoreService.setDocument(COLLECTIONS.GALLERY, id, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'UPDATE_GALLERY_ITEM',
          'gallery',
          id,
          { title: formData.title.en }
        );
        setMessage({ type: 'success', text: 'Gallery item updated successfully!' });
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setMessage({ type: 'error', text: 'Failed to save: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading gallery item..." />;

  return (
    <div className="gallery-edit-page animate-fade-in">
      <AdminHeader
        title={isNew ? 'Add Gallery Item' : `Edit: ${formData.title.en || 'Gallery Item'}`}
        subtitle="Upload or link portfolio pictures and assign categories"
        actions={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/gallery')}
          >
            Back to Gallery
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
            <h2>Image & Categorization</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL <span className="required">*</span></label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/... or Google Drive share link"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              required
            />
            <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Supports direct image links, Firebase Storage, and Google Drive links (make sure file access is &ldquo;Anyone with the link can view&rdquo;).
            </p>
          </div>

          {formData.imageUrl && (
            <div className="gallery-preview-box">
              <img src={formatImageUrl(formData.imageUrl)} alt="Sample preview" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="flex-banners">Flex & Banners</option>
                <option value="visiting-cards">Visiting Cards</option>
                <option value="wedding-cards">Wedding & Invitations</option>
                <option value="forms">Government & Legal Forms</option>
                <option value="bill-books">Bill Books & Registers</option>
                <option value="posters">Posters & Pamphlets</option>
                <option value="custom">Custom Prints</option>
              </select>
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

          <div className="admin-form-grid">
            <div className="form-group form-group--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <span>Published (Visible on site)</span>
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
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Item Details</h2>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Title (English) <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.title.en}
                onChange={(e) =>
                  setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Title (Marathi / मराठी)</label>
              <input
                type="text"
                className="form-input"
                value={formData.title.mr}
                onChange={(e) =>
                  setFormData({ ...formData, title: { ...formData.title, mr: e.target.value } })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Work Scope (English)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g., Customized invitation cards with gold foil stamping"
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Work Scope (Marathi / मराठी)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="उदा. सोन्याच्या फॉइलसह लग्नपत्रिका आणि डिझायनिंग काम"
              value={formData.description.mr || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, mr: e.target.value },
                })
              }
            />
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
              Delete Item
            </Button>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginLeft: isNew ? 'auto' : undefined }}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/gallery')}
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
              {saving ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item? It will be removed from your portfolio immediately."
        itemName={formData.title.en}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
