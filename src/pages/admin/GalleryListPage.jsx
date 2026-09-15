import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import './GalleryListPage.css';

export default function GalleryListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.GALLERY,
      [firestoreService.orderBy('displayOrder', 'asc')],
      (data) => {
        setItems(data);
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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete gallery item "${title?.en || title}"?`)) return;
    try {
      await firestoreService.deleteDocument(COLLECTIONS.GALLERY, id);
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'DELETE_GALLERY_ITEM',
        'gallery',
        id
      );
    } catch (err) {
      console.error('Error deleting:', err);
      setItems((prev) => prev.filter((i) => i.id !== id));
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
                  <img src={item.imageUrl} alt={item.title?.en || 'Gallery sample'} />
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

                <div className="gallery-admin-card__meta">
                  <StatusBadge status={item.published !== false ? 'PUBLISHED' : 'DRAFT'} />
                  {item.featured && <span className="badge badge--primary">Featured</span>}
                </div>
              </div>

              <div className="gallery-admin-card__footer">
                <button
                  className="table-action-btn"
                  onClick={() => navigate(`/admin/gallery/${item.id}`)}
                  title="Edit item"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  className="table-action-btn table-action-btn--danger"
                  onClick={() => handleDelete(item.id, item.title)}
                  title="Delete item"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
