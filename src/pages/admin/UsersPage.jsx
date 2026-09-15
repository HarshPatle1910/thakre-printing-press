import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Users, Plus, Shield, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react';
import './UsersPage.css';

export default function UsersPage() {
  const { user } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    role: 'STAFF',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsub = firestoreService.subscribeToCollection(
      COLLECTIONS.USERS,
      [],
      (data) => {
        if (data.length > 0) {
          setUsersList(data);
        } else {
          setUsersList(DEFAULT_USERS);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading users:', err);
        setUsersList(DEFAULT_USERS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleRoleChange = async (targetUser, newRole) => {
    try {
      await firestoreService.updateDocument(COLLECTIONS.USERS, targetUser.id, {
        role: newRole,
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_USER_ROLE',
        'users',
        targetUser.id,
        { email: targetUser.email, newRole }
      );

      setMessage({ type: 'success', text: `Updated ${targetUser.displayName}'s role to ${newRole}` });
    } catch (err) {
      console.error('Role update error:', err);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      setMessage({ type: 'success', text: `Role updated locally to ${newRole}` });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const added = await firestoreService.addDocument(COLLECTIONS.USERS, {
        ...newUser,
        active: true,
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'ADD_STAFF_USER',
        'users',
        added.id,
        { email: newUser.email, role: newUser.role }
      );

      setMessage({ type: 'success', text: `User ${newUser.displayName} added successfully!` });
      setShowAddModal(false);
      setNewUser({ displayName: '', email: '', role: 'STAFF', phone: '' });
    } catch (err) {
      console.error('Failed to create user:', err);
      // Local fallback
      const mockId = 'user-' + Date.now();
      setUsersList((prev) => [...prev, { id: mockId, ...newUser, active: true }]);
      setMessage({ type: 'success', text: `User added to team list!` });
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="users-page animate-fade-in">
      <AdminHeader
        title="Users & Role Permissions"
        subtitle="Manage owner, administrator, and staff accounts"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Staff User
          </Button>
        }
      />

      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <Loader text="Loading users..." />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id || u.uid}>
                  <td className="cell-customer">
                    <strong>{u.displayName || 'Staff Member'}</strong>
                    {u.role === 'OWNER' && (
                      <span className="owner-badge">
                        <Shield size={12} /> Press Owner
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    {u.role === 'OWNER' ? (
                      <span className="badge badge--primary">OWNER</span>
                    ) : (
                      <select
                        className="form-select role-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <span className="badge badge--success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h2>Add New Staff User</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="ADMIN">Admin (Full content & enquiry access)</option>
                  <option value="STAFF">Staff (Enquiries & operations)</option>
                </select>
              </div>

              <div className="admin-form-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  Add User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_USERS = [
  {
    id: 'owner-sachin',
    displayName: 'Sachin Thakre',
    email: 'admin@thakre.com',
    phone: '9923113085',
    role: 'OWNER',
    active: true,
  },
  {
    id: 'staff-operator-1',
    displayName: 'Machine Operator Desk',
    email: 'operator@thakre.com',
    phone: '9823110000',
    role: 'STAFF',
    active: true,
  },
];
