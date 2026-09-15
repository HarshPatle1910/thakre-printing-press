import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, FileText, Image, MessageSquare, Users, Package, HelpCircle, Phone, MessageCircle } from 'lucide-react';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatDateTime } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      firestoreService.getCollection(COLLECTIONS.ENQUIRIES, [firestoreService.orderBy('createdAt', 'desc'), firestoreService.limit(5)]),
      firestoreService.getCollection(COLLECTIONS.SERVICES, []),
      firestoreService.getCollection(COLLECTIONS.GALLERY, []),
      firestoreService.getCollection(COLLECTIONS.FORMS, []),
      firestoreService.getCollection(COLLECTIONS.FAQS, []),
    ]).then(([enquiries, services, gallery, forms, faqs]) => {
      const newEnquiries = enquiries.filter(e => e.status === 'NEW').length;
      setStats({
        totalEnquiries: enquiries.length,
        newEnquiries,
        services: services.length,
        gallery: gallery.length,
        forms: forms.length,
        faqs: faqs.length,
      });
      setRecentEnquiries(enquiries);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const statCards = [
    { label: 'New Enquiries', value: stats.newEnquiries || 0, icon: MessageSquare, color: 'var(--color-accent)' },
    { label: 'Total Enquiries', value: stats.totalEnquiries || 0, icon: FileText, color: 'var(--color-primary)' },
    { label: 'Services', value: stats.services || 0, icon: Package, color: 'var(--color-info)' },
    { label: 'Gallery Items', value: stats.gallery || 0, icon: Image, color: 'var(--color-success)' },
    { label: 'Forms', value: stats.forms || 0, icon: FileText, color: 'var(--color-warning)' },
    { label: 'FAQs', value: stats.faqs || 0, icon: HelpCircle, color: 'var(--color-text-tertiary)' },
  ];

  const statusColors = { NEW: 'var(--color-accent)', CONTACTED: 'var(--color-info)', IN_DISCUSSION: 'var(--color-warning)', COMPLETED: 'var(--color-success)', CANCELLED: 'var(--color-text-tertiary)' };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.displayName || user?.email}</p>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        {statCards.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card__icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div>
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="dashboard__view-all">View All →</Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="dashboard__empty">No enquiries yet. They'll appear here once customers submit requests.</div>
        ) : (
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr><th>ID</th><th>Customer</th><th>Service</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td><Link to={`/admin/enquiries/${enq.id}`} className="dashboard__link">{enq.enquiryId}</Link></td>
                    <td>{enq.customerName}</td>
                    <td>{enq.serviceName || '—'}</td>
                    <td><span className="badge" style={{ background: `${statusColors[enq.status] || 'var(--color-text-tertiary)'}15`, color: statusColors[enq.status] }}>{enq.status}</span></td>
                    <td>{formatDateTime(enq.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
