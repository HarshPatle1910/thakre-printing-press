import { useState, useEffect } from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Save, CheckCircle, AlertCircle, MapPin, Navigation } from 'lucide-react';
import './LocationPage.css';

export default function LocationPage() {
  const { business } = useBusiness();
  const { user } = useAuth();

  const [location, setLocation] = useState({
    lat: 21.2437,
    lng: 80.2084,
    googleMapsUrl: '',
    directions: 'Beside Jamya Timya Zilla Parishad School, Goregaon Main Road, Gondia–Kohmara Road',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (business?.location) {
      setLocation({
        lat: business.location.lat ?? 21.2437,
        lng: business.location.lng ?? 80.2084,
        googleMapsUrl: business.location.googleMapsUrl || '',
        directions: business.location.directions || 'Beside Jamya Timya Zilla Parishad School, Goregaon Main Road, Gondia–Kohmara Road',
      });
    }
  }, [business]);

  const handleChange = (field, value) => {
    setLocation((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.updateDocument(COLLECTIONS.BUSINESS, 'main', {
        location: {
          ...location,
          lat: parseFloat(location.lat) || 21.2437,
          lng: parseFloat(location.lng) || 80.2084,
        },
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_LOCATION',
        'business',
        'location'
      );

      setMessage({ type: 'success', text: 'Location details saved successfully!' });
    } catch (err) {
      console.error('Error saving location:', err);
      setMessage({ type: 'error', text: 'Failed to update location: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  // Google Maps embed URL generator
  const getEmbedSrc = () => {
    if (location.googleMapsUrl && location.googleMapsUrl.includes('google.com/maps/embed')) {
      return location.googleMapsUrl;
    }
    return `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=en&z=15&output=embed`;
  };

  return (
    <div className="location-page animate-fade-in">
      <AdminHeader
        title="Location & Google Maps"
        subtitle="Manage shop GPS coordinates, directions, and interactive map embed"
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
            <h2>Coordinates & Map Link</h2>
            <p>Precise coordinates for mobile map apps and direction finders</p>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={location.lat}
                onChange={(e) => handleChange('lat', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={location.lng}
                onChange={(e) => handleChange('lng', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Share / Embed URL (Optional custom iframe)</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://maps.google.com/..."
              value={location.googleMapsUrl}
              onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
            />
            <span className="form-hint">Leave blank to use coordinates-based Google Map</span>
          </div>

          <div className="form-group">
            <label className="form-label">Directions & Landmarks Guide</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={location.directions}
              onChange={(e) => handleChange('directions', e.target.value)}
            />
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2><MapPin size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Live Map Preview</h2>
            <p>How the map appears to visitors on your Contact page</p>
          </div>

          <div className="map-preview-container">
            <iframe
              title="Location Preview"
              src={getEmbedSrc()}
              width="100%"
              height="320"
              style={{ border: 0, borderRadius: 'var(--radius-md)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save Location'}
          </Button>
        </div>
      </form>
    </div>
  );
}
