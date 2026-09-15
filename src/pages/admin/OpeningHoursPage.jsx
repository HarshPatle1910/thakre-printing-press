import { useState, useEffect } from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import { Save, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import './OpeningHoursPage.css';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function OpeningHoursPage() {
  const { openingHours } = useBusiness();
  const { user } = useAuth();

  const [hours, setHours] = useState({});
  const [holidayNotice, setHolidayNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (openingHours) {
      setHours({ ...openingHours });
      setHolidayNotice(openingHours.holidayNotice || '');
    }
  }, [openingHours]);

  const handleTimeChange = (day, field, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { open: '09:00', close: '20:00', closed: false }),
        [field]: value,
      },
    }));
  };

  const handleClosedToggle = (day, isClosed) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { open: '09:00', close: '20:00', closed: false }),
        closed: isClosed,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await firestoreService.setDocument(COLLECTIONS.BUSINESS, 'openingHours', {
        ...hours,
        holidayNotice,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_OPENING_HOURS',
        'business',
        'openingHours'
      );

      setMessage({ type: 'success', text: 'Opening hours updated successfully!' });
    } catch (err) {
      console.error('Error updating hours:', err);
      setMessage({ type: 'error', text: 'Failed to update hours: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="opening-hours-page animate-fade-in">
      <AdminHeader
        title="Opening Hours"
        subtitle="Manage shop operating timings and special holiday schedules"
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
            <h2>Weekly Schedule</h2>
            <p>Set normal working hours for each day of the week</p>
          </div>

          <div className="hours-table-wrapper">
            <table className="hours-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Opening Time</th>
                  <th>Closing Time</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(({ key, label }) => {
                  const dayData = hours[key] || { open: '09:00', close: '20:00', closed: false };
                  return (
                    <tr key={key} className={dayData.closed ? 'hours-row--closed' : ''}>
                      <td className="hours-day-cell">
                        <strong>{label}</strong>
                      </td>
                      <td>
                        <label className="checkbox-toggle">
                          <input
                            type="checkbox"
                            checked={dayData.closed}
                            onChange={(e) => handleClosedToggle(key, e.target.checked)}
                          />
                          <span>{dayData.closed ? 'Closed' : 'Open'}</span>
                        </label>
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-input form-input--time"
                          disabled={dayData.closed}
                          value={dayData.open || '09:00'}
                          onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-input form-input--time"
                          disabled={dayData.closed}
                          value={dayData.close || '20:00'}
                          onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h2>Special Holiday / Temporary Closure Notice</h2>
            <p>Optional notice displayed on the website when the shop is temporarily closed</p>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Message</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Closed on 15th August for Independence Day"
              value={holidayNotice}
              onChange={(e) => setHolidayNotice(e.target.value)}
            />
          </div>
        </section>

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
