import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Upload, Check, MessageCircle, X } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import { getQuoteWhatsAppUrl } from '../../utils/whatsapp';
import firestoreService from '../../services/firestoreService';
import enquiryService from '../../services/enquiryService';
import storageService from '../../services/storageService';
import analyticsService from '../../services/analyticsService';
import { COLLECTIONS } from '../../config/constants';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import './QuotePage.css';

import { SEED_DATA } from '../../config/seedData';

export default function QuotePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service') || '';

  const [services, setServices] = useState(SEED_DATA.services);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    serviceId: preSelectedService || 'flex-banner-printing',
    quantity: '',
    requirement: '',
    additionalNotes: '',
  });
  const [dynamicFields, setDynamicFields] = useState({});
  const [files, setFiles] = useState([]);

  useEffect(() => {
    analyticsService.trackQuoteFormOpened();
    analyticsService.trackPageView('/quote');
    firestoreService.getCollection(COLLECTIONS.SERVICES, [
      firestoreService.where('published', '==', true),
      firestoreService.orderBy('displayOrder', 'asc'),
    ]).then((data) => {
      const activeServices = data && data.length > 0 ? data : SEED_DATA.services;
      setServices(activeServices);
      setLoading(false);
      const targetId = preSelectedService || activeServices[0]?.id || activeServices[0]?.slug;
      if (targetId) {
        const svc = activeServices.find(s => s.id === targetId || s.slug === targetId);
        if (svc?.enquiryFields) {
          const initial = {};
          svc.enquiryFields.forEach(f => { initial[f.name] = ''; });
          setDynamicFields(initial);
        }
      }
    }).catch(() => setLoading(false));
  }, [preSelectedService]);

  const selectedService = services.find(s => s.id === form.serviceId);

  const handleServiceChange = (serviceId) => {
    setForm(prev => ({ ...prev, serviceId }));
    const svc = services.find(s => s.id === serviceId);
    if (svc?.enquiryFields) {
      const initial = {};
      svc.enquiryFields.forEach(f => { initial[f.name] = ''; });
      setDynamicFields(initial);
    } else {
      setDynamicFields({});
    }
  };

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = [];
    for (const file of newFiles) {
      const validation = storageService.validateFile(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, files: validation.error }));
        return;
      }
      validFiles.push(file);
    }
    setFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, files: null }));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.serviceId) newErrors.serviceId = 'Please select a service';
    if (!form.requirement.trim()) newErrors.requirement = 'Please describe your requirement';

    // Validate required dynamic fields
    if (selectedService?.enquiryFields) {
      selectedService.enquiryFields.forEach(field => {
        if (field.required && !dynamicFields[field.name]?.trim()) {
          newErrors[`dynamic_${field.name}`] = `${getLocalized(field.label, lang)} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Upload files
      let uploadedFiles = [];
      if (files.length > 0) {
        uploadedFiles = await storageService.uploadFiles(files, 'enquiries/temp');
        analyticsService.trackFileUpload();
      }

      // Submit enquiry
      const result = await enquiryService.submitEnquiry({
        ...form,
        serviceName: selectedService ? getLocalized(selectedService.title, lang) : '',
        dynamicFields,
        files: uploadedFiles,
      });

      analyticsService.trackQuoteFormSubmitted();
      setSuccess(result);
    } catch (err) {
      console.error('Enquiry submission failed:', err);
      setErrors({ submit: 'Failed to submit. Please try again or contact us on WhatsApp.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text={t('common.loading')} />;

  if (success) {
    return (
      <main className="quote-page section">
        <div className="container">
          <div className="quote-success animate-fade-in-up">
            <div className="quote-success__icon">
              <Check size={48} />
            </div>
            <h1>{t('quote.successTitle')}</h1>
            <p>{t('quote.successMessage')}</p>
            <div className="quote-success__id">
              <span>{t('quote.enquiryId')}:</span>
              <strong>{success.enquiryId}</strong>
            </div>
            <div className="quote-success__actions">
              <Button
                variant="whatsapp"
                icon={MessageCircle}
                href={getQuoteWhatsAppUrl(success.enquiryId)}
                target="_blank"
              >
                {t('quote.whatsappFollowUp')}
              </Button>
              <Button variant="outline" onClick={() => { setSuccess(null); setForm({ customerName: '', phone: '', email: '', serviceId: '', quantity: '', requirement: '', additionalNotes: '' }); setDynamicFields({}); setFiles([]); }}>
                {t('quote.submitAnother')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="quote-page section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('quote.title')}</span>
          <h1>{t('quote.title')}</h1>
          <p>{t('quote.subtitle')}</p>
        </div>

        <form className="quote-form" onSubmit={handleSubmit} noValidate>
          <div className="quote-form__grid">
            {/* Name */}
            <div className="form-group">
              <label className="form-label">{t('quote.name')} <span className="required">*</span></label>
              <input type="text" className={`form-input ${errors.customerName ? 'form-input--error' : ''}`} value={form.customerName} onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))} />
              {errors.customerName && <div className="form-error">{errors.customerName}</div>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">{t('quote.mobile')} <span className="required">*</span></label>
              <input type="tel" className={`form-input ${errors.phone ? 'form-input--error' : ''}`} value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">{t('quote.email')} <span className="form-hint">({t('quote.optional')})</span></label>
              <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Service */}
            <div className="form-group">
              <label className="form-label">{t('quote.service')} <span className="required">*</span></label>
              <select className={`form-select ${errors.serviceId ? 'form-input--error' : ''}`} value={form.serviceId} onChange={(e) => handleServiceChange(e.target.value)}>
                <option value="">{t('quote.selectService')}</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{getLocalized(s.title, lang)}</option>
                ))}
              </select>
              {errors.serviceId && <div className="form-error">{errors.serviceId}</div>}
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">{t('quote.quantity')}</label>
              <input type="number" className="form-input" min="1" value={form.quantity} onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))} />
            </div>
          </div>

          {/* Dynamic service-specific fields */}
          {selectedService?.enquiryFields?.length > 0 && (
            <div className="quote-form__dynamic">
              <h3 className="quote-form__dynamic-title">
                {getLocalized(selectedService.title, lang)} — Additional Details
              </h3>
              <div className="quote-form__grid">
                {selectedService.enquiryFields.map((field) => (
                  <div className="form-group" key={field.name}>
                    <label className="form-label">
                      {getLocalized(field.label, lang)}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select className={`form-select ${errors[`dynamic_${field.name}`] ? 'form-input--error' : ''}`} value={dynamicFields[field.name] || ''} onChange={(e) => setDynamicFields(prev => ({ ...prev, [field.name]: e.target.value }))}>
                        <option value="">Select...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea className={`form-textarea ${errors[`dynamic_${field.name}`] ? 'form-textarea--error' : ''}`} value={dynamicFields[field.name] || ''} onChange={(e) => setDynamicFields(prev => ({ ...prev, [field.name]: e.target.value }))} />
                    ) : (
                      <input type={field.type || 'text'} className={`form-input ${errors[`dynamic_${field.name}`] ? 'form-input--error' : ''}`} value={dynamicFields[field.name] || ''} onChange={(e) => setDynamicFields(prev => ({ ...prev, [field.name]: e.target.value }))} />
                    )}
                    {errors[`dynamic_${field.name}`] && <div className="form-error">{errors[`dynamic_${field.name}`]}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirement */}
          <div className="form-group">
            <label className="form-label">{t('quote.requirement')} <span className="required">*</span></label>
            <textarea className={`form-textarea ${errors.requirement ? 'form-textarea--error' : ''}`} value={form.requirement} onChange={(e) => setForm(prev => ({ ...prev, requirement: e.target.value }))} />
            {errors.requirement && <div className="form-error">{errors.requirement}</div>}
          </div>

          {/* Additional notes */}
          <div className="form-group">
            <label className="form-label">{t('quote.additionalNotes')} <span className="form-hint">({t('quote.optional')})</span></label>
            <textarea className="form-textarea" value={form.additionalNotes} onChange={(e) => setForm(prev => ({ ...prev, additionalNotes: e.target.value }))} />
          </div>

          {/* File upload */}
          <div className="form-group">
            <label className="form-label">{t('quote.uploadFiles')}</label>
            <div className="file-upload-zone">
              <input type="file" id="fileUpload" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileAdd} className="file-upload-input" />
              <label htmlFor="fileUpload" className="file-upload-label">
                <Upload size={24} />
                <span>Choose files or drag and drop</span>
                <small>{t('quote.uploadHint')}</small>
              </label>
            </div>
            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, i) => (
                  <div className="file-item" key={i}>
                    <span className="file-item__name">{file.name}</span>
                    <span className="file-item__size">{(file.size / 1024).toFixed(0)} KB</span>
                    <button type="button" className="file-item__remove" onClick={() => removeFile(i)} aria-label="Remove file">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.files && <div className="form-error">{errors.files}</div>}
          </div>

          {errors.submit && <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{errors.submit}</div>}

          <Button type="submit" variant="primary" size="lg" icon={Send} loading={submitting} fullWidth>
            {submitting ? t('quote.submitting') : t('quote.submit')}
          </Button>
        </form>
      </div>
    </main>
  );
}
