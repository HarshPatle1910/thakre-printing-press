import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Plus, Edit, Trash2, Search, Package, Check, X, CheckCircle, AlertCircle } from 'lucide-react';
import './ServicesListPage.css';

export default function ServicesListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.SERVICES,
      [firestoreService.orderBy('displayOrder', 'asc')],
      (data) => {
        setServices(data || []);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching services:', err);
        setServices(DEFAULT_SERVICES);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleTogglePublished = async (service) => {
    const newStatus = !service.published;
    try {
      await firestoreService.updateDocument(COLLECTIONS.SERVICES, service.id, {
        published: newStatus,
      });
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_SERVICE_STATUS',
        'services',
        service.id,
        { published: newStatus }
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, published: newStatus } : s))
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionMessage(null);
    try {
      await firestoreService.deleteDocument(COLLECTIONS.SERVICES, deleteTarget.id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_SERVICE',
        'services',
        deleteTarget.id,
        { title: deleteTarget.title?.en || deleteTarget.title }
      );
      setActionMessage({
        type: 'success',
        text: `Service "${deleteTarget.title?.en || deleteTarget.title}" deleted successfully!`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setActionMessage({ type: 'error', text: 'Failed to delete service: ' + err.message });
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const name = s.title?.en || s.title || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="services-list-page animate-fade-in">
      <AdminHeader
        title="Services Management"
        subtitle="Manage printing services, descriptions, pricing guidelines, and quote forms"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/admin/services/new')}
          >
            Add Service
          </Button>
        }
      />

      {actionMessage && (
        <div className={`admin-alert admin-alert--${actionMessage.type}`} style={{ marginBottom: '1.25rem' }}>
          {actionMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading services..." />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No services found"
          description={search ? 'Try adjusting your search criteria' : 'Get started by creating your first printing service'}
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/admin/services/new')}
            >
              Add Service
            </Button>
          }
        />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Service Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td className="cell-order">{service.displayOrder || 1}</td>
                  <td className="cell-title">
                    <strong>{service.title?.en || service.title}</strong>
                    {service.title?.mr && (
                      <span className="cell-subtitle">{service.title.mr}</span>
                    )}
                  </td>
                  <td className="cell-slug">
                    <code>{service.slug}</code>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-toggle ${service.published ? 'status-toggle--active' : ''}`}
                      onClick={() => handleTogglePublished(service)}
                      title="Click to toggle status"
                    >
                      <StatusBadge status={service.published ? 'PUBLISHED' : 'DRAFT'} />
                    </button>
                  </td>
                  <td>
                    {service.featured ? (
                      <span className="badge badge--primary">Featured</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="cell-actions">
                    <button
                      className="table-action-btn"
                      onClick={() => navigate(`/admin/services/${service.id}`)}
                      title="Edit Service"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      className="table-action-btn table-action-btn--danger"
                      onClick={() => setDeleteTarget(service)}
                      title="Delete Service"
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

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Service"
        message="Are you sure you want to delete this service? All service details, specifications, and inquiries will be permanently removed."
        itemName={deleteTarget?.title?.en || deleteTarget?.title || ''}
        confirmText="Yes, Delete Service"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

const DEFAULT_SERVICES = [
  {
    id: 'flex-banner',
    slug: 'flex-banner-printing',
    title: { en: 'Flex & Banner Printing', mr: 'फ्लेक्स आणि बॅनर प्रिंटिंग', hi: 'फ्लेक्स और बैनर प्रिंटिंग' },
    displayOrder: 1,
    published: true,
    featured: true,
  },
  {
    id: 'visiting-cards',
    slug: 'visiting-cards',
    title: { en: 'Visiting Cards & Stationery', mr: 'व्हिजिटिंग कार्ड्स आणि स्टेशनरी', hi: 'विजिटिंग कार्ड्स और स्टेशनरी' },
    displayOrder: 2,
    published: true,
    featured: true,
  },
  {
    id: 'wedding-cards',
    slug: 'wedding-cards',
    title: { en: 'Wedding & Invitation Cards', mr: 'लग्न आणि आमंत्रण पत्रिका', hi: 'शादी और निमंत्रण पत्र' },
    displayOrder: 3,
    published: true,
    featured: true,
  },
  {
    id: 'forms-catalog',
    slug: 'government-forms',
    title: { en: 'Government & Legal Forms', mr: 'शासकीय आणि न्यायालयीन फॉर्म्स', hi: 'सरकारी और कानूनी फॉर्म' },
    displayOrder: 4,
    published: true,
    featured: false,
  },
  {
    id: 'bill-books',
    slug: 'bill-books-registers',
    title: { en: 'Bill Books & Challans', mr: 'बिल बुक्स आणि चलन', hi: 'बिल बुक्स और चालान' },
    displayOrder: 5,
    published: true,
    featured: false,
  },
];
