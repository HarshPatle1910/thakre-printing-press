import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import {
  Save,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Shield,
  Layers,
  Film,
  BarChart3,
  ExternalLink,
  RotateCcw,
  Info,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import './SettingsPage.css';

const DEFAULT_SETTINGS = {
  enquiryPrefix: 'TP-',
  enquiryCounter: 0,
  allowMultiServiceQuotes: true,
  maxServicesPerQuote: 10,
  requireCustomerPhone: true,
  autoWhatsAppRedirect: true,
  enableQuoteFileUpload: false,
  maxFileSizeMb: 10,
  allowedExtensions: 'pdf, jpg, jpeg, png, doc, docx, cdr, psd, ai',
  storageProvider: 'Google Drive (via Cloud Proxy)',
  enableSplashScreen: true,
  splashFrequency: 'session',
  enableAnalyticsTracking: true,
  defaultLanguage: 'en',
  maintenanceMode: false,
  maintenanceMessage: 'Our website is currently undergoing scheduled updates. For urgent printing orders, please call us or message on WhatsApp at +91 99231 13085.',
};

export default function SettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [counterResetting, setCounterResetting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const docSnap = await firestoreService.getDocument('settings', 'general');
        if (docSnap) {
          setSettings((prev) => ({ ...prev, ...docSnap }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetCounter = async () => {
    if (!window.confirm('Are you sure you want to reset the quotation number counter to 0? The next enquiry will start at number 1.')) {
      return;
    }

    setCounterResetting(true);
    try {
      await firestoreService.setDocument('settings', 'general', {
        enquiryCounter: 0,
      });
      setSettings((prev) => ({ ...prev, enquiryCounter: 0 }));
      setMessage({ type: 'success', text: 'Quotation counter reset to 0.' });
      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'RESET_ENQUIRY_COUNTER',
        'settings',
        'general',
        { enquiryCounter: 0 }
      );
    } catch (err) {
      console.error('Error resetting counter:', err);
      setMessage({ type: 'error', text: 'Failed to reset counter: ' + err.message });
    } finally {
      setCounterResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...settings,
        enquiryPrefix: (settings.enquiryPrefix || 'TP-').trim(),
        maxFileSizeMb: Number(settings.maxFileSizeMb) || 10,
        maxServicesPerQuote: Number(settings.maxServicesPerQuote) || 10,
        updatedBy: user?.uid || 'admin',
      };

      await firestoreService.setDocument('settings', 'general', payload);

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_SYSTEM_SETTINGS',
        'settings',
        'general',
        {
          maintenanceMode: payload.maintenanceMode,
          enableQuoteFileUpload: payload.enableQuoteFileUpload,
          allowMultiServiceQuotes: payload.allowMultiServiceQuotes,
          enableSplashScreen: payload.enableSplashScreen,
          splashFrequency: payload.splashFrequency,
        }
      );

      setMessage({ type: 'success', text: 'System settings updated and published successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error updating settings:', err);
      setMessage({ type: 'error', text: 'Failed to update settings: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const samplePrefix = (settings.enquiryPrefix || 'TP-').endsWith('-')
    ? (settings.enquiryPrefix || 'TP-')
    : `${settings.enquiryPrefix || 'TP-'}-`;
  const sampleEnquiryId = `${samplePrefix}${String((settings.enquiryCounter || 0) + 1).padStart(6, '0')}`;

  return (
    <div className="settings-page animate-fade-in">
      <AdminHeader
        title="System Settings"
        subtitle="Global platform configurations, quotation rules, file policies, video intro, and storefront status"
      />

      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: QUOTATION & MULTI-SERVICE ENGINE */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-wrap">
              <div className="settings-card__icon">
                <Layers size={22} />
              </div>
              <div>
                <h2>Quotation & Multi-Service Engine</h2>
                <p>Rules governing customer quotation requests, multi-item baskets, and automated follow-ups</p>
              </div>
            </div>
            <span className="badge-tag badge-tag--green">Active Engine</span>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Enquiry ID Prefix</label>
              <input
                type="text"
                className="form-input"
                value={settings.enquiryPrefix}
                onChange={(e) => handleChange('enquiryPrefix', e.target.value)}
                placeholder="TP-"
              />
              <span className="form-hint">Next generated ticket format:</span>
              <div className="settings-preview-chip">
                {sampleEnquiryId}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Number Counter</label>
              <div className="counter-control-group">
                <span className="counter-value-tag">
                  {settings.enquiryCounter || 0} Quotes Issued
                </span>
                <button
                  type="button"
                  className="btn-counter-reset"
                  onClick={handleResetCounter}
                  disabled={counterResetting}
                >
                  <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Reset to 0
                </button>
              </div>
              <span className="form-hint">Incremented automatically on each submitted quote</span>
            </div>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <span>Multi-Service Quote Enquiries</span>
                <span className="badge-tag badge-tag--blue">New Feature</span>
              </div>
              <p className="settings-toggle-desc">
                Allows customers to combine multiple printing requirements (e.g., Flex Banner + Visiting Cards + Letterhead) in a single request.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.allowMultiServiceQuotes}
                onChange={(e) => handleChange('allowMultiServiceQuotes', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="admin-form-grid" style={{ marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">Max Printing Services per Quotation</label>
              <input
                type="number"
                min="1"
                max="25"
                className="form-input"
                value={settings.maxServicesPerQuote}
                onChange={(e) => handleChange('maxServicesPerQuote', e.target.value)}
                disabled={!settings.allowMultiServiceQuotes}
              />
              <span className="form-hint">Limits customer cart items per submission (Default: 10)</span>
            </div>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <PhoneCall size={16} color="var(--color-primary)" />
                <span>Require 10-Digit Mobile Number</span>
                <span className="badge-tag badge-tag--green">Mandatory</span>
              </div>
              <p className="settings-toggle-desc">
                Ensures all customers provide an authentic 10-digit Indian phone number before submitting an enquiry.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.requireCustomerPhone}
                onChange={(e) => handleChange('requireCustomerPhone', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <MessageSquare size={16} color="#25D366" />
                <span>Instant WhatsApp Order Redirection</span>
              </div>
              <p className="settings-toggle-desc">
                After quote submission, automatically provides customer with a direct WhatsApp link containing their complete specifications to chat with Sachin Thakre.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.autoWhatsAppRedirect}
                onChange={(e) => handleChange('autoWhatsAppRedirect', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* SECTION 2: QUOTATION FILE UPLOAD POLICY */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-wrap">
              <div className="settings-card__icon">
                <HardDrive size={22} />
              </div>
              <div>
                <h2>Quotation File Upload Policy</h2>
                <p>Artwork handling, upload limits, and cloud storage infrastructure</p>
              </div>
            </div>
            <span className={`badge-tag ${settings.enableQuoteFileUpload ? 'badge-tag--green' : 'badge-tag--amber'}`}>
              {settings.enableQuoteFileUpload ? 'Uploads Active' : 'Direct WhatsApp Sharing'}
            </span>
          </div>

          {/* Informational Callout regarding file upload removal */}
          <div className="settings-notice settings-notice--amber">
            <Info size={20} className="settings-notice-icon" />
            <div>
              <strong>Current Design File Workflow</strong>
              File upload on the public <em>Request a Quote</em> page is currently turned <strong>OFF</strong> as per your recent update. Customers submit their print specifications directly, and heavy design artwork (CorelDRAW CDR, Photoshop PSD, PDF) is sent straight to Sachin Thakre via WhatsApp or in person at the press shop. This eliminates upload timeouts and ensures fast quotation.
            </div>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <span>Enable Direct File Upload on Quote Form</span>
              </div>
              <p className="settings-toggle-desc">
                Toggle this ON if you want customers to upload design files directly through the website form.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.enableQuoteFileUpload}
                onChange={(e) => handleChange('enableQuoteFileUpload', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="admin-form-grid" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Max File Upload Size (MB)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-input"
                value={settings.maxFileSizeMb}
                onChange={(e) => handleChange('maxFileSizeMb', e.target.value)}
                disabled={!settings.enableQuoteFileUpload}
              />
              <span className="form-hint">Maximum size per artwork file (MB)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Allowed File Extensions</label>
              <input
                type="text"
                className="form-input"
                value={settings.allowedExtensions}
                onChange={(e) => handleChange('allowedExtensions', e.target.value)}
                disabled={!settings.enableQuoteFileUpload}
              />
              <span className="form-hint">Formats accepted (e.g., pdf, jpg, cdr, psd, ai)</span>
            </div>
          </div>

          <div className="storage-info-box">
            <HardDrive size={18} className="storage-icon" />
            <div>
              <strong>Active Storage Infrastructure: Google Drive API (Proxy)</strong>
              <p>
                Customer uploads and media assets are routed to Google Drive Cloud Storage with local Firebase caching for instant preview and download in the admin dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: STARTUP VIDEO SPLASH SCREEN */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-wrap">
              <div className="settings-card__icon">
                <Film size={22} />
              </div>
              <div>
                <h2>Cinematic Video Splash Screen</h2>
                <p>3D animated printing press video intro displayed when visitors enter the site</p>
              </div>
            </div>
            <a
              href="/?splash=1"
              target="_blank"
              rel="noreferrer"
              className="settings-btn-link"
              title="Test video intro in a new tab"
            >
              <ExternalLink size={13} /> Preview Video Splash
            </a>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <span>Enable Video Splash Intro</span>
                <span className="badge-tag badge-tag--green">3D Asset</span>
              </div>
              <p className="settings-toggle-desc">
                Plays the cinematic 3D printing press video intro (<code>animation_starting_splash.mp4</code>) with ambient lighting and skip button.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.enableSplashScreen}
                onChange={(e) => handleChange('enableSplashScreen', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="admin-form-grid" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Playback Frequency</label>
              <select
                className="form-select"
                value={settings.splashFrequency}
                onChange={(e) => handleChange('splashFrequency', e.target.value)}
                disabled={!settings.enableSplashScreen}
              >
                <option value="session">Once Per Browser Session (Recommended for Best UX)</option>
                <option value="always">Every Visit to Home Page</option>
                <option value="disabled">Disabled Completely</option>
              </select>
              <span className="form-hint">
                Session mode ensures returning users aren't repeatedly delayed.
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 4: VISITOR ANALYTICS & LIVE TRACKING */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-wrap">
              <div className="settings-card__icon">
                <BarChart3 size={22} />
              </div>
              <div>
                <h2>Live Visitor Analytics & Event Tracking</h2>
                <p>Real-time telemetry recording page views, contact clicks, and quote conversion funnels</p>
              </div>
            </div>
            <a
              href="/admin/analytics"
              className="settings-btn-link"
            >
              <BarChart3 size={13} /> Open Analytics
            </a>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <span>Real-Time Event Tracking</span>
                <span className="badge-tag badge-tag--green">Firestore Live</span>
              </div>
              <p className="settings-toggle-desc">
                Collects aggregated daily visits across website routes, WhatsApp outreach clicks, and phone calls to feed the Admin Analytics Dashboard.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.enableAnalyticsTracking}
                onChange={(e) => handleChange('enableAnalyticsTracking', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* SECTION 5: STOREFRONT STATUS & MAINTENANCE MODE */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-wrap">
              <div className="settings-card__icon">
                <Shield size={22} />
              </div>
              <div>
                <h2>Storefront Availability & Localization</h2>
                <p>Emergency maintenance mode controls and default storefront language</p>
              </div>
            </div>
            <span className={`status-pill ${settings.maintenanceMode ? 'status-pill--maintenance' : 'status-pill--live'}`}>
              {settings.maintenanceMode ? 'Maintenance Mode Active' : 'Site Live Online'}
            </span>
          </div>

          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">
                <span>Maintenance Mode</span>
                <span className={`badge-tag ${settings.maintenanceMode ? 'badge-tag--amber' : 'badge-tag--gray'}`}>
                  {settings.maintenanceMode ? 'Pause Active' : 'Standard'}
                </span>
              </div>
              <p className="settings-toggle-desc">
                When active, public visitors see a branded maintenance notice with direct Call & WhatsApp buttons. The Admin portal remains fully accessible.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Maintenance Announcement Message</label>
            <textarea
              className="form-input"
              rows={3}
              value={settings.maintenanceMessage}
              onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
              placeholder="Message shown to public visitors during maintenance..."
              disabled={!settings.maintenanceMode}
            />
            <span className="form-hint">Displayed on the temporary pause screen</span>
          </div>

          <div className="admin-form-grid" style={{ marginTop: '16px' }}>
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
              <span className="form-hint">Default fallback for multilingual content</span>
            </div>
          </div>
        </section>

        {/* STICKY SAVE BAR */}
        <div className="settings-save-bar">
          <div className="settings-save-bar__status">
            <span>All modifications apply across the live storefront and admin panel immediately.</span>
          </div>
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving System Settings...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
