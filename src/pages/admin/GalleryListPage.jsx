import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatImageUrl } from '../../utils/helpers';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import './GalleryListPage.css';

export default function GalleryListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.GALLERY,
      [firestoreService.orderBy('displayOrder', 'asc')],
      (data) => {
        setItems(data || []);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching gallery:', err);
        setItems(DEFAULT_GALLERY);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionMessage(null);
    try {
      await firestoreService.deleteDocument(COLLECTIONS.GALLERY, deleteTarget.id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_GALLERY_ITEM',
        'gallery',
        deleteTarget.id,
        { title: deleteTarget.title?.en || deleteTarget.title }
      );
      setActionMessage({
        type: 'success',
        text: `Gallery item "${deleteTarget.title?.en || deleteTarget.title}" deleted successfully!`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      setActionMessage({ type: 'error', text: 'Failed to delete item: ' + err.message });
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const name = item.title?.en || item.title || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="gallery-list-page animate-fade-in">
      <AdminHeader
        title="Gallery Management"
        subtitle="Organize portfolio samples, past print jobs, and showcase images"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/admin/gallery/new')}
          >
            Add Image
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
            placeholder="Search gallery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select form-select--filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="flex-banners">Flex & Banners</option>
          <option value="visiting-cards">Visiting Cards</option>
          <option value="wedding-cards">Wedding Cards</option>
          <option value="forms">Forms & Registers</option>
          <option value="posters">Posters & Pamphlets</option>
        </select>
      </div>

      {loading ? (
        <Loader text="Loading gallery..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No gallery items found"
          description={search ? 'Try adjusting your search criteria' : 'Add sample print jobs to showcase your print quality'}
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/admin/gallery/new')}
            >
              Add Image
            </Button>
          }
        />
      ) : (
        <div className="gallery-admin-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="gallery-admin-card">
              <div className="gallery-admin-card__thumb">
                {item.imageUrl ? (
                  <img src={formatImageUrl(item.imageUrl)} alt={item.title?.en || 'Gallery sample'} referrerPolicy="no-referrer" />
                ) : (
                  <div className="gallery-placeholder">
                    <ImageIcon size={32} />
                  </div>
                )}
                <span className="gallery-card-category">{item.category}</span>
              </div>

              <div className="gallery-admin-card__body">
                <h3>{item.title?.en || item.title || 'Untitled'}</h3>
                {item.title?.mr && <p className="text-secondary-sm">{item.title.mr}</p>}
                {(item.description?.en || (typeof item.description === 'string' && item.description)) && (
                  <p className="gallery-admin-card__desc">
                    {item.description?.en || item.description}
                  </p>
                )}

                <div className="gallery-admin-card__meta">
                  <StatusBadge status={item.published !== false ? 'PUBLISHED' : 'DRAFT'} />
                  {item.featured && <span className="badge badge--primary">Featured</span>}
                </div>
              </div>

              <div className="gallery-admin-card__footer">
                <button
                  type="button"
                  className="table-action-btn"
                  onClick={() => navigate(`/admin/gallery/${item.id}`)}
                  title="Edit item"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="table-action-btn table-action-btn--danger"
                  onClick={() => setDeleteTarget(item)}
                  title="Delete item"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item? This will remove the photo and all details permanently."
        itemName={deleteTarget?.title?.en || deleteTarget?.title || ''}
        confirmText="Yes, Delete Item"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

const DEFAULT_GALLERY = [
  {
    id: 'sample-flex-1',
    title: { en: 'Grand Opening Flex Banner', mr: 'भव्य उद्घाटन फ्लेक्स बॅनर' },
    category: 'flex-banners',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    published: true,
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'sample-card-1',
    title: { en: 'Gold Foil Visiting Card', mr: 'गोल्ड फॉइल व्हिजिटिंग कार्ड' },
    category: 'visiting-cards',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    published: true,
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'sample-wedding-1',
    title: { en: 'Traditional Wedding Invitation', mr: 'पारंपरिक लग्नपत्रिका' },
    category: 'wedding-cards',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    published: true,
    featured: true,
    displayOrder: 3,
  },
];
