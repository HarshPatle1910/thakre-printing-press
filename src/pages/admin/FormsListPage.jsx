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
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import './FormsListPage.css';

export default function FormsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.FORMS,
      [firestoreService.orderBy('displayOrder', 'asc')],
      (data) => {
        setForms(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching forms:', err);
        setForms(DEFAULT_FORMS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete form "${name?.en || name}"?`)) return;
    try {
      await firestoreService.deleteDocument(COLLECTIONS.FORMS, id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_FORM',
        'forms',
        id
      );
    } catch (err) {
      console.error('Error deleting form:', err);
      setForms((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const filteredForms = forms.filter((f) => {
    const name = f.name?.en || f.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="forms-list-page animate-fade-in">
      <AdminHeader
        title="Government & Legal Forms"
        subtitle="Manage official forms, affidavits, revenue formats, and certificates available at shop"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/admin/forms/new')}
          >
            Add Form
          </Button>
        }
      />

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading forms..." />
      ) : filteredForms.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No forms found"
          description={search ? 'Try adjusting your search query' : 'Add legal and government forms available at the shop'}
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/admin/forms/new')}
            >
              Add Form
            </Button>
          }
        />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Form Name</th>
                <th>Category</th>
                <th>Availability</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form) => (
                <tr key={form.id}>
                  <td className="cell-order">{form.displayOrder || 1}</td>
                  <td className="cell-title">
                    <strong>{form.name?.en || form.name}</strong>
                    {form.name?.mr && <span className="cell-subtitle">{form.name.mr}</span>}
                  </td>
                  <td>
                    <span className="badge badge--info">{form.category || 'General'}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        form.availability === 'available'
                          ? 'badge--success'
                          : 'badge--warning'
                      }`}
                    >
                      {form.availability === 'available' ? 'Available' : 'Print On Demand'}
                    </span>
                  </td>
                  <td>{form.price ? `₹${form.price}` : 'Nominal Fee'}</td>
                  <td className="cell-actions">
                    <button
                      className="table-action-btn"
                      onClick={() => navigate(`/admin/forms/${form.id}`)}
                      title="Edit form"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn table-action-btn--danger"
                      onClick={() => handleDelete(form.id, form.name)}
                      title="Delete form"
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

const DEFAULT_FORMS = [
  {
    id: 'form-7-12',
    name: { en: '7/12 Land Revenue Extract Application', mr: '७/१२ उतारा अर्ज' },
    category: 'revenue',
    availability: 'available',
    price: 10,
    displayOrder: 1,
  },
  {
    id: 'form-affidavit',
    name: { en: 'General Stamp Affidavit Format', mr: 'सर्वसाधारण प्रतिज्ञापत्र नमुना' },
    category: 'court',
    availability: 'available',
    price: 20,
    displayOrder: 2,
  },
  {
    id: 'form-income-cert',
    name: { en: 'Income Certificate Application Form', mr: 'उत्पन्न दाखला अर्ज' },
    category: 'government',
    availability: 'available',
    price: 15,
    displayOrder: 3,
  },
  {
    id: 'form-ration',
    name: { en: 'Ration Card Name Addition / Modification Form', mr: 'रेशन कार्ड नाव वाढवणे / दुरुस्ती अर्ज' },
    category: 'government',
    availability: 'available',
    price: 15,
    displayOrder: 4,
  },
];
