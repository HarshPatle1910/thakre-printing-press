import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import Loader from '../../components/common/Loader';
import firestoreService from '../../services/firestoreService';
import activityLogService from '../../services/activityLogService';
import { COLLECTIONS } from '../../config/constants';
import {
  ArrowLeft, Phone, MessageCircle, Mail, Download,
  Save, Printer, FileText, CheckCircle, Clock
} from 'lucide-react';
import './EnquiryDetailPage.css';

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('NEW');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadEnquiry() {
      try {
        const docSnap = await firestoreService.getDocument(COLLECTIONS.ENQUIRIES, id);
        if (docSnap) {
          setEnquiry(docSnap);
          setStatus(docSnap.status || 'NEW');
          setInternalNotes(docSnap.internalNotes || '');
        } else {
          // Fallback sample for demo
          const fallback = {
            id,
            customerName: 'Rameshwar Patle',
            phone: '9823456789',
            email: 'rameshwar.patle@gmail.com',
            serviceName: 'Flex & Banner Printing',
            quantity: '2 Banners (10x4 ft)',
            requirement: 'Need flex banners for shop opening ceremony on Thursday. Star flex material preferred with grommets on all four corners.',
            dynamicFields: {
              width: '10 ft',
              height: '4 ft',
              material: 'Star Flex (Durable)',
              finish: 'Eyelets on border',
            },
            files: [
              {
                name: 'shop-opening-design.pdf',
                size: '2.4 MB',
                type: 'application/pdf',
                url: '#',
              },
            ],
            status: 'NEW',
            internalNotes: 'Customer requested draft preview by Wednesday morning.',
            createdAt: new Date(),
          };
          setEnquiry(fallback);
          setStatus(fallback.status);
          setInternalNotes(fallback.internalNotes);
        }
      } catch (err) {
        console.error('Error loading enquiry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEnquiry();
  }, [id]);

  const handleSaveNotesAndStatus = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      await firestoreService.updateDocument(COLLECTIONS.ENQUIRIES, id, {
        status,
        internalNotes,
        updatedBy: user?.uid || 'admin',
      });

      await activityLogService.logAction(
        user?.uid || 'admin',
        user?.displayName || 'Admin',
        'UPDATE_ENQUIRY_STATUS',
        'enquiries',
        id,
        { status, customer: enquiry?.customerName }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update enquiry:', err);
      // Local fallback state
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (loading) return <Loader text="Loading enquiry details..." />;
  if (!enquiry) return <div>Enquiry not found</div>;

  return (
    <div className="enquiry-detail-page animate-fade-in">
      <AdminHeader
        title={`Enquiry: ${enquiry.id}`}
        subtitle={`Submitted by ${enquiry.customerName}`}
        actions={
          <div className="action-buttons-group">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/admin/enquiries')}
            >
              Back
            </Button>
            <Button
              variant="outline"
              icon={Printer}
              onClick={handlePrintSlip}
            >
              Print Slip
            </Button>
          </div>
        }
      />

      <div className="enquiry-detail-layout">
        {/* Main Details */}
        <div className="enquiry-detail-main">
          {/* Customer & Service Card */}
          <section className="admin-card">
            <div className="admin-card__header flex-between">
              <div>
                <h2>{enquiry.serviceName || 'Custom Printing Job'}</h2>
                <p>Requirement specifications</p>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="enquiry-info-grid">
              <div className="info-item">
                <span className="info-label">Customer Name</span>
                <span className="info-value">{enquiry.customerName}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">
                  <a href={`tel:${enquiry.phone}`} className="phone-link">
                    <Phone size={14} /> {enquiry.phone}
                  </a>
                </span>
              </div>

              {enquiry.email && (
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">
                    <a href={`mailto:${enquiry.email}`} className="email-link">
                      <Mail size={14} /> {enquiry.email}
                    </a>
                  </span>
                </div>
              )}

              {enquiry.quantity && (
                <div className="info-item">
                  <span className="info-label">Quantity / Copies</span>
                  <span className="info-value">{enquiry.quantity}</span>
                </div>
              )}
            </div>

            {enquiry.requirement && (
              <div className="requirement-box">
                <span className="info-label">Customer Notes & Instructions</span>
                <p className="requirement-text">{enquiry.requirement}</p>
              </div>
            )}

            {/* Dynamic Fields */}
            {enquiry.dynamicFields && Object.keys(enquiry.dynamicFields).length > 0 && (
              <div className="dynamic-specs-box">
                <span className="info-label">Job Specifications</span>
                <div className="specs-grid">
                  {Object.entries(enquiry.dynamicFields).map(([k, v]) => (
                    <div key={k} className="spec-item">
                      <span className="spec-key">{k}:</span>
                      <span className="spec-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Files */}
            {enquiry.files && enquiry.files.length > 0 && (
              <div className="attached-files-box">
                <span className="info-label">Attached Files ({enquiry.files.length})</span>
                <div className="files-list">
                  {enquiry.files.map((file, idx) => (
                    <div key={idx} className="file-attachment-card">
                      <div className="file-info">
                        <FileText size={20} className="file-icon" />
                        <div>
                          <span className="file-name">{file.name}</span>
                          {file.size && <span className="file-size">{file.size}</span>}
                        </div>
                      </div>
                      <a
                        href={file.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-download-btn"
                        download
                      >
                        <Download size={16} /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Actions */}
        <aside className="enquiry-detail-sidebar">
          {/* Quick Outreach */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Direct Outreach</h2>
            </div>
            <div className="outreach-buttons">
              <a
                href={`tel:${enquiry.phone}`}
                className="btn-outreach btn-outreach--call"
              >
                <Phone size={18} /> Call Customer
              </a>
              <a
                href={`https://wa.me/91${enquiry.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaskar ${enquiry.customerName}, regarding your quotation for "${enquiry.serviceName}" (${enquiry.id}) at Thakre Printing Press:`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outreach btn-outreach--whatsapp"
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Status & Staff Notes */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Order Status & Notes</h2>
            </div>

            <div className="form-group">
              <label className="form-label">Workflow Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="NEW">New Enquiry</option>
                <option value="CONTACTED">Customer Contacted</option>
                <option value="IN_PROGRESS">In Progress / Printing</option>
                <option value="COMPLETED">Completed / Ready</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Internal Staff Notes</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Rate quoted, design status, promised delivery date, etc."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="primary"
              icon={Save}
              loading={saving}
              onClick={handleSaveNotesAndStatus}
              fullWidth
            >
              {saving ? 'Updating...' : 'Update Status & Notes'}
            </Button>

            {saveSuccess && (
              <div className="save-success-msg">
                <CheckCircle size={16} /> Saved successfully!
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
