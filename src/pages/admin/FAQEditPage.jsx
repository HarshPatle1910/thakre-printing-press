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
import './FAQEditPage.css';

export default function FAQEditPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    question: { en: '', mr: '', hi: '' },
    answer: { en: '', mr: '', hi: '' },
    category: 'General',
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
      await firestoreService.deleteDocument(COLLECTIONS.FAQS, id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_FAQ',
        'faqs',
        id,
        { question: formData.question?.en || 'FAQ' }
      );
      navigate('/admin/faqs');
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setMessage({ type: 'error', text: 'Failed to delete FAQ: ' + err.message });
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!isNew) {
      async function loadFaq() {
        try {
          const docSnap = await firestoreService.getDocument(COLLECTIONS.FAQS, id);
          if (docSnap) {
            setFormData({
              ...docSnap,
              question: { en: '', mr: '', hi: '', ...(docSnap.question || {}) },
              answer: { en: '', mr: '', hi: '', ...(docSnap.answer || {}) },
            });
          }
        } catch (err) {
          console.error('Error loading FAQ:', err);
          setMessage({ type: 'error', text: 'Failed to load FAQ details' });
        } finally {
          setLoading(false);
        }
      }
      loadFaq();
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
        const newDoc = await firestoreService.addDocument(COLLECTIONS.FAQS, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'CREATE_FAQ',
          'faqs',
          newDoc.id,
          { question: formData.question.en }
        );
        navigate('/admin/faqs');
      } else {
        await firestoreService.setDocument(COLLECTIONS.FAQS, id, payload);
        await activityLogService.logAction(
          user?.uid || 'admin',
          user?.displayName || 'Admin',
          'UPDATE_FAQ',
          'faqs',
          id,
          { question: formData.question.en }
        );
        setMessage({ type: 'success', text: 'FAQ updated successfully!' });
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setMessage({ type: 'error', text: 'Failed to save FAQ: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading FAQ..." />;

  return (
    <div className="faq-edit-page animate-fade-in">
      <AdminHeader
        title={isNew ? 'Add New FAQ' : 'Edit FAQ'}
        subtitle="Provide clear answers to customer inquiries in multiple languages"
        actions={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/faqs')}
          >
            Back to FAQs
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
            <h2>Question</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Question (English) <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              value={formData.question.en}
              onChange={(e) =>
                setFormData({ ...formData, question: { ...formData.question, en: e.target.value } })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Question (Marathi / मराठी)</label>
            <input
              type="text"
              className="form-input"
              value={formData.question.mr}
              onChange={(e) =>
                setFormData({ ...formData, question: { ...formData.question, mr: e.target.value } })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Question (Hindi / हिंदी)</label>
            <input
              type="text"
              className="form-input"
              value={formData.question.hi}
              onChange={(e) =>
                setFormData({ ...formData, question: { ...formData.question, hi: e.target.value } })
              }
            />
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="General">General Questions</option>
                <option value="Printing & Quality">Printing & Quality</option>
                <option value="Timeline & Delivery">Timeline & Delivery</option>
                <option value="Pricing & Payment">Pricing & Payment</option>
                <option value="Design Services">Design Services</option>
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

          <div className="form-group form-group--checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <span>Published on Website</span>
            </label>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Answer</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Answer (English) <span className="required">*</span></label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.answer.en}
              onChange={(e) =>
                setFormData({ ...formData, answer: { ...formData.answer, en: e.target.value } })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Answer (Marathi / मराठी)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.answer.mr}
              onChange={(e) =>
                setFormData({ ...formData, answer: { ...formData.answer, mr: e.target.value } })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Answer (Hindi / हिंदी)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.answer.hi}
              onChange={(e) =>
                setFormData({ ...formData, answer: { ...formData.answer, hi: e.target.value } })
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
              Delete FAQ
            </Button>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginLeft: isNew ? 'auto' : undefined }}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/faqs')}
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
              {saving ? 'Saving...' : 'Save FAQ'}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ question and answer?"
        itemName={formData.question.en}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
