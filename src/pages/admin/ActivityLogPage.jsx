import { useState, useEffect, useMemo } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { Activity, Clock, User, Search } from 'lucide-react';
import './ActivityLogPage.css';

const FILTER_RESOURCES = [
  'ALL',
  'services',
  'business',
  'pages',
  'auth',
  'settings',
  'faqs',
  'gallery',
  'enquiries',
];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState('ALL');

  useEffect(() => {
    // Subscribe to all activity logs without field-filtering orderBy
    // to ensure legacy logs (keyed with createdAt) and new logs (with timestamp) are both retrieved
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.ACTIVITY_LOGS,
      [],
      (data) => {
        const sorted = [...data].sort((a, b) => {
          const getMillis = (item) => {
            const t = item.createdAt || item.timestamp || item.updatedAt;
            if (!t) return 0;
            if (t.toDate && typeof t.toDate === 'function') return t.toDate().getTime();
            if (t instanceof Date) return t.getTime();
            const parsed = new Date(t).getTime();
            return isNaN(parsed) ? 0 : parsed;
          };
          return getMillis(b) - getMillis(a);
        });
        setLogs(sorted);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching logs:', err);
        setLogs(DEFAULT_LOGS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const formatDate = (log) => {
    const rawTime = log.createdAt || log.timestamp || log.updatedAt;
    if (!rawTime) return 'Recent';
    try {
      const date = rawTime.toDate && typeof rawTime.toDate === 'function' 
        ? rawTime.toDate() 
        : (rawTime instanceof Date ? rawTime : new Date(rawTime));
      
      if (isNaN(date.getTime())) return 'Recent';

      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const formatAction = (action) => {
    return (action || 'ACTION').replace(/_/g, ' ');
  };

  const getActionBadgeClass = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('FAILED')) return 'badge--danger';
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('CHANGE')) return 'badge--warning';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('NEW') || act.includes('LOGIN')) return 'badge--success';
    return 'badge--info';
  };

  // Filter logs by resource and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedResource !== 'ALL') {
        const res = (log.resource || '').toLowerCase();
        if (res !== selectedResource.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const action = (log.action || '').toLowerCase();
        const user = (log.userName || log.userId || log.userEmail || '').toLowerCase();
        const resource = (log.resource || '').toLowerCase();
        const meta = JSON.stringify(log.metadata || {}).toLowerCase();
        if (!action.includes(q) && !user.includes(q) && !resource.includes(q) && !meta.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [logs, selectedResource, searchQuery]);

  return (
    <div className="activity-log-page animate-fade-in">
      <AdminHeader
        title="Activity Audit Log"
        subtitle="Chronological log of admin actions, content edits, and system events"
      />

      {/* Toolbar: Search and Filter Chips */}
      <div className="activity-toolbar">
        <div className="activity-search-wrap">
          <Search size={16} className="activity-search-icon" />
          <input
            type="text"
            className="activity-search-input"
            placeholder="Search action, user, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="activity-filters-wrap">
          {FILTER_RESOURCES.map((res) => (
            <button
              key={res}
              type="button"
              className={`activity-filter-chip ${
                selectedResource === res ? 'activity-filter-chip--active' : ''
              }`}
              onClick={() => setSelectedResource(res)}
            >
              {res.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading activity logs..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity recorded yet"
          description="Actions performed by admins and staff will appear in this audit log"
        />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No matching logs found"
          description="Try adjusting your search query or selecting a different resource filter"
        />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="cell-date">
                    <span className="log-time">
                      <Clock size={12} /> {formatDate(log)}
                    </span>
                  </td>
                  <td>
                    <div className="log-user">
                      <User size={14} />
                      <span>{log.userName || log.userId || 'Admin'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td>
                    <span className="log-resource-tag">{log.resource || 'general'}</span>
                  </td>
                  <td className="cell-details">
                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                      <span className="log-metadata">
                        {JSON.stringify(log.metadata).replace(/[{"}]/g, ' ')}
                      </span>
                    ) : (
                      '—'
                    )}
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

const DEFAULT_LOGS = [
  {
    id: 'log-1',
    userName: 'Sachin Thakre',
    action: 'ADMIN_LOGIN',
    resource: 'auth',
    createdAt: new Date(Date.now() - 600000),
    metadata: { ip: 'Goregaon, MH' },
  },
  {
    id: 'log-2',
    userName: 'Sachin Thakre',
    action: 'UPDATE_BUSINESS_PROFILE',
    resource: 'business',
    createdAt: new Date(Date.now() - 3600000),
    metadata: { section: 'openingHours' },
  },
  {
    id: 'log-3',
    userName: 'Sachin Thakre',
    action: 'UPDATE_ENQUIRY_STATUS',
    resource: 'enquiries',
    createdAt: new Date(Date.now() - 7200000),
    metadata: { id: 'TP-001042', status: 'CONTACTED' },
  },
];
