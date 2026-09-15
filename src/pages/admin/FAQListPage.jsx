import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Plus, Edit, Trash2, Search, HelpCircle } from 'lucide-react';
import './FAQListPage.css';

export default function FAQListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.FAQS,
      [firestoreService.orderBy('displayOrder', 'asc')],
      (data) => {
        setFaqs(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching FAQs:', err);
        setFaqs(DEFAULT_FAQS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleDelete = async (id, question) => {
    if (!window.confirm(`Delete FAQ "${question?.en || question}"?`)) return;
    try {
      await firestoreService.deleteDocument(COLLECTIONS.FAQS, id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_FAQ',
        'faqs',
        id
      );
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const q = f.question?.en || f.question || '';
    return q.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="faq-list-page animate-fade-in">
      <AdminHeader
        title="Frequently Asked Questions"
        subtitle="Manage customer questions and answers in English, Marathi, and Hindi"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/admin/faqs/new')}
          >
            Add FAQ
          </Button>
        }
      />

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading FAQs..." />
      ) : filteredFaqs.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs found"
          description={search ? 'Try adjusting your search criteria' : 'Add common customer questions to save time answering repeated inquiries'}
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/admin/faqs/new')}
            >
              Add FAQ
            </Button>
          }
        />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Question</th>
                <th>Category</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaqs.map((faq) => (
                <tr key={faq.id}>
                  <td className="cell-order">{faq.displayOrder || 1}</td>
                  <td className="cell-title">
                    <strong>{faq.question?.en || faq.question}</strong>
                    {faq.question?.mr && (
                      <span className="cell-subtitle">{faq.question.mr}</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge--info">{faq.category || 'General'}</span>
                  </td>
                  <td>
                    <span className={`badge ${faq.published !== false ? 'badge--success' : 'badge--warning'}`}>
                      {faq.published !== false ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="cell-actions">
                    <button
                      className="table-action-btn"
                      onClick={() => navigate(`/admin/faqs/${faq.id}`)}
                      title="Edit FAQ"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn table-action-btn--danger"
                      onClick={() => handleDelete(faq.id, faq.question)}
                      title="Delete FAQ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const DEFAULT_FAQS = [
  {
    id: 'faq-turnaround',
    question: { en: 'What is the usual delivery turnaround time?', mr: 'प्रिंटिंग काम पूर्ण होण्यासाठी किती वेळ लागतो?' },
    category: 'Timeline',
    displayOrder: 1,
    published: true,
  },
  {
    id: 'faq-file-formats',
    question: { en: 'Which file formats do you accept for banner and card printing?', mr: 'तुम्ही कोणत्या फाईल फॉरमॅट्स स्वीकारता?' },
    category: 'Files',
    displayOrder: 2,
    published: true,
  },
  {
    id: 'faq-design-help',
    question: { en: 'Can you create custom artwork if I do not have a ready design?', mr: 'माझ्याकडे तयार डिझाईन नसेल तर तुम्ही डिझाइन बनवून द्याल का?' },
    category: 'Design',
    displayOrder: 3,
    published: true,
  },
];
