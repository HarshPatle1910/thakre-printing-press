import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { Save, CheckCircle, AlertCircle, Settings, HardDrive, Shield } from 'lucide-react';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    enquiryPrefix: 'TP-',
    maxFileSizeMb: 10,
    allowedExtensions: 'pdf, jpg, jpeg, png, doc, docx, cdr, psd',
    defaultLanguage: 'en',
    maintenanceMode: false,
    storageProvider: 'Google Drive (via Cloud Proxy)',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const docSnap = await firestoreService.getDocument('settings', 'general');
        if (docSnap) {
          setSettings((prev) => ({ ...prev, ...docSnap }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.setDocument('settings', 'general', {
        ...settings,
        maxFileSizeMb: Number(settings.maxFileSizeMb) || 10,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_SYSTEM_SETTINGS',
        'settings',
        'general'
      );

      setMessage({ type: 'success', text: 'System settings saved successfully!' });
    } catch (err) {
      console.error('Error updating settings:', err);
      setMessage({ type: 'error', text: 'Failed to update settings: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page animate-fade-in">
      <AdminHeader
        title="System Settings"
        subtitle="Global platform options, file upload policies, and storage configurations"
      />

      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Enquiry & Storage Configurations</h2>
            <p>Parameters for customer quotation numbers and file uploads</p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Enquiry ID Prefix</label>
              <input
                type="text"
                className="form-input"
                value={settings.enquiryPrefix}
                onChange={(e) => handleChange('enquiryPrefix', e.target.value)}
              />
              <span className="form-hint">E.g., TP- will generate IDs like TP-001042</span>
            </div>

            <div className="form-group">
              <label className="form-label">Max File Upload Size (MB)</label>
              <input
                type="number"
                className="form-input"
                value={settings.maxFileSizeMb}
                onChange={(e) => handleChange('maxFileSizeMb', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allowed File Extensions (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={settings.allowedExtensions}
              onChange={(e) => handleChange('allowedExtensions', e.target.value)}
            />
            <span className="form-hint">E.g. pdf, jpg, png, docx, cdr (CorelDRAW), psd</span>
          </div>

          <div className="form-group">
            <label className="form-label">Active Storage Architecture</label>
            <div className="storage-info-box">
              <HardDrive size={18} className="storage-icon" />
              <div>
                <strong>Google Drive API (Storage Provider)</strong>
                <p>Artwork and customer design uploads are synced to Google Drive with local Firebase cache.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Localization & Availability</h2>
            <p>Default storefront behaviors</p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Default Website Language</label>
              <select
                className="form-select"
                value={settings.defaultLanguage}
                onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              >
                <option value="en">English</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
            </div>

            <div className="form-group form-group--checkbox">
              <label className="checkbox-label" style={{ marginTop: '28px' }}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                />
                <span>Maintenance Mode (Shows temporary pause message)</span>
              </label>
            </div>
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
