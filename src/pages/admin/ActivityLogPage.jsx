import { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import firestoreService from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { Activity, Clock, User, FileText, CheckCircle } from 'lucide-react';
import './ActivityLogPage.css';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.ACTIVITY_LOGS,
      [firestoreService.orderBy('timestamp', 'desc'), firestoreService.limit(50)],
      (data) => {
        setLogs(data);
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAction = (action) => {
    return (action || 'ACTION').replace(/_/g, ' ');
  };

  return (
    <div className="activity-log-page animate-fade-in">
      <AdminHeader
        title="Activity Audit Log"
        subtitle="Chronological log of admin actions, content edits, and system events"
      />

      {loading ? (
        <Loader text="Loading activity logs..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity recorded yet"
          description="Actions performed by admins and staff will appear in this audit log"
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
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="cell-date">
                    <span className="log-time">
                      <Clock size={12} /> {formatDate(log.timestamp)}
                    </span>
                  </td>
                  <td>
                    <div className="log-user">
                      <User size={14} />
                      <span>{log.userName || log.userId || 'System'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--info">{formatAction(log.action)}</span>
                  </td>
                  <td>
                    <code>{log.resource || 'general'}</code>
                  </td>
                  <td className="cell-details">
                    {log.metadata ? (
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
    timestamp: new Date(Date.now() - 600000),
    metadata: { ip: 'Goregaon, MH' },
  },
  {
    id: 'log-2',
    userName: 'Sachin Thakre',
    action: 'UPDATE_BUSINESS_PROFILE',
    resource: 'business',
    timestamp: new Date(Date.now() - 3600000),
    metadata: { section: 'openingHours' },
  },
  {
    id: 'log-3',
    userName: 'Sachin Thakre',
    action: 'UPDATE_ENQUIRY_STATUS',
    resource: 'enquiries',
    timestamp: new Date(Date.now() - 7200000),
    metadata: { id: 'TP-001042', status: 'CONTACTED' },
  },
];
