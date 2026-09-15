import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { MessageSquare, Search, Phone, MessageCircle, Eye, Calendar } from 'lucide-react';
import './EnquiriesListPage.css';

const STATUS_FILTERS = ['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function EnquiriesListPage() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.ENQUIRIES,
      [firestoreService.orderBy('createdAt', 'desc')],
      (data) => {
        setEnquiries(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading enquiries:', err);
        setEnquiries(DEFAULT_ENQUIRIES);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredEnquiries = enquiries.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (item.id || '').toLowerCase().includes(query) ||
      (item.customerName || '').toLowerCase().includes(query) ||
      (item.phone || '').includes(query) ||
      (item.serviceName || '').toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="enquiries-list-page animate-fade-in">
      <AdminHeader
        title="Customer Enquiries & Quotations"
        subtitle="Track incoming job quotes, contact customers, and manage order statuses"
      />

      {/* Filter Tabs */}
      <div className="status-tabs">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={`status-tab ${statusFilter === status ? 'status-tab--active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
            {status !== 'ALL' && (
              <span className="status-tab__count">
                {enquiries.filter((e) => e.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, phone, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading enquiries..." />
      ) : filteredEnquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No matching enquiries for the current filters'
              : 'Customer requests from the website quote form will appear here'
          }
        />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td className="cell-id">
                    <strong>{enquiry.id}</strong>
                  </td>
                  <td className="cell-customer">
                    <span className="customer-name">{enquiry.customerName}</span>
                    <span className="customer-phone">{enquiry.phone}</span>
                  </td>
                  <td className="cell-service">
                    <span>{enquiry.serviceName || 'General Enquiry'}</span>
                    {enquiry.quantity && (
                      <span className="cell-subtitle">Qty: {enquiry.quantity}</span>
                    )}
                  </td>
                  <td className="cell-date">
                    <span className="date-text">{formatDate(enquiry.createdAt)}</span>
                  </td>
                  <td>
                    <StatusBadge status={enquiry.status || 'NEW'} />
                  </td>
                  <td className="cell-actions">
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="table-action-btn"
                      title="Call customer"
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={`https://wa.me/91${enquiry.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Namaskar ${enquiry.customerName}, regarding your printing enquiry (${enquiry.id}) at Thakre Printing Press Goregaon:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="table-action-btn table-action-btn--whatsapp"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <button
                      className="table-action-btn"
                      onClick={() => navigate(`/admin/enquiries/${enquiry.id}`)}
                      title="View full enquiry details"
                    >
                      <Eye size={16} />
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

const DEFAULT_ENQUIRIES = [
  {
    id: 'TP-001042',
    customerName: 'Rameshwar Patle',
    phone: '9823456789',
    serviceName: 'Flex & Banner Printing',
    quantity: '2 Banners (10x4 ft)',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3600000),
    requirement: 'Need flex banners for shop opening ceremony on Thursday.',
  },
  {
    id: 'TP-001041',
    customerName: 'Dr. Anita Rahangdale',
    phone: '9421345678',
    serviceName: 'Visiting Cards & Stationery',
    quantity: '1000 cards',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 86400000),
    requirement: 'Matte finish visiting cards with clinic address.',
  },
  {
    id: 'TP-001040',
    customerName: 'Pravin Bisen',
    phone: '9765432109',
    serviceName: 'Wedding & Invitation Cards',
    quantity: '500 Cards',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 172800000),
    requirement: 'Red and gold floral design wedding cards with Marathi calligraphy.',
  },
];
