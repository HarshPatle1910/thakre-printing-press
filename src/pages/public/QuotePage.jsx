import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Check, MessageCircle, Plus, Trash2, Package, Layers } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import { getQuoteWhatsAppUrl } from '../../utils/whatsapp';
import { useBusiness } from '../../contexts/BusinessContext';
import firestoreService from '../../services/firestoreService';
import enquiryService from '../../services/enquiryService';
import analyticsService from '../../services/analyticsService';
import { COLLECTIONS } from '../../config/constants';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import './QuotePage.css';

function createNewItem(serviceId = '') {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    serviceId: serviceId || '',
    quantity: '',
    requirement: '',
    dynamicFields: {},
  };
}

export default function QuotePage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const lang = i18n.language;
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service') || '';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    additionalNotes: '',
  });

  const [items, setItems] = useState([createNewItem(preSelectedService)]);

  useEffect(() => {
    analyticsService.trackQuoteFormOpened();
    analyticsService.trackPageView('/quote');

    async function loadServices() {
      try {
        let activeServices = [];
        try {
          activeServices = await firestoreService.getCollection(COLLECTIONS.SERVICES, [
            firestoreService.where('published', '==', true),
            firestoreService.orderBy('displayOrder', 'asc'),
          ]);
        } catch (queryErr) {
          console.warn('Fallback fetching services without compound order in QuotePage:', queryErr);
          const all = await firestoreService.getCollection(COLLECTIONS.SERVICES);
          activeServices = (all || [])
            .filter((s) => s.published !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }

        const validServices = activeServices || [];
        setServices(validServices);

        // If pre-selected service is present and first item has no service, pre-select it
        if (preSelectedService) {
          const match = validServices.find(
            (s) => s.id === preSelectedService || s.slug === preSelectedService
          );
          if (match) {
            setItems((prev) => {
              if (prev.length > 0 && !prev[0].serviceId) {
                const next = [...prev];
                next[0] = { ...next[0], serviceId: match.id || match.slug };
                if (match.enquiryFields) {
                  const initialDyn = {};
                  match.enquiryFields.forEach((f) => { initialDyn[f.name] = ''; });
                  next[0].dynamicFields = initialDyn;
                }
                return next;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('Failed to load services for quote from Firebase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [preSelectedService]);

  // Handle adding another service item
  const handleAddItem = () => {
    setItems((prev) => [...prev, createNewItem()]);
  };

  // Handle removing a service item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    // Clear errors associated with this item
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`item_${index}_`)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  // Handle changing fields in an item
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      if (field === 'serviceId') {
        const svc = services.find((s) => s.id === value || s.slug === value);
        const initialDyn = {};
        if (svc?.enquiryFields) {
          svc.enquiryFields.forEach((f) => { initialDyn[f.name] = ''; });
        }
        next[index].dynamicFields = initialDyn;
      }
      return next;
    });

    // Clear related error
    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`item_${index}_${field}`]: null }));
    }
  };

  // Handle dynamic field changes for a specific item
  const handleItemDynamicChange = (index, fieldName, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        dynamicFields: {
          ...next[index].dynamicFields,
          [fieldName]: value,
        },
      };
      return next;
    });

    if (errors[`item_${index}_dynamic_${fieldName}`]) {
      setErrors((prev) => ({ ...prev, [`item_${index}_dynamic_${fieldName}`]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Customer info validation
    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!form.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit number';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    // Items validation
    if (!items || items.length === 0) {
      newErrors.general = 'Please add at least one service requirement';
    } else {
      items.forEach((item, index) => {
        if (!item.serviceId) {
          newErrors[`item_${index}_serviceId`] = 'Please select a service';
        }
        if (!item.requirement.trim()) {
          newErrors[`item_${index}_requirement`] = 'Please describe your requirement for this service';
        }

        const svc = services.find((s) => s.id === item.serviceId || s.slug === item.serviceId);
        if (svc?.enquiryFields) {
          svc.enquiryFields.forEach((field) => {
            if (field.required && !item.dynamicFields?.[field.name]?.trim()) {
              newErrors[`item_${index}_dynamic_${field.name}`] = `${getLocalized(field.label, lang)} is required`;
            }
          });
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
      // Map enriched items with localized service title
      const enrichedItems = items.map((item) => {
        const svc = services.find((s) => s.id === item.serviceId || s.slug === item.serviceId);
        return {
          ...item,
          serviceName: svc ? getLocalized(svc.title, lang) : (item.serviceId || 'Printing Service'),
        };
      });

      const result = await enquiryService.submitEnquiry({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        additionalNotes: form.additionalNotes,
        items: enrichedItems,
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

            {/* Summary of services in this enquiry */}
            {success.items && success.items.length > 0 && (
              <div className="quote-success__summary">
                <span className="quote-success__summary-title">Requested Services ({success.items.length}):</span>
                <ul className="quote-success__summary-list">
                  {success.items.map((it, idx) => (
                    <li key={idx} className="quote-success__summary-item">
                      <span className="quote-success__item-name">
                        #{idx + 1} {it.serviceName}
                      </span>
                      {it.quantity && (
                        <span className="quote-success__item-qty">Qty: {it.quantity}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="quote-success__actions">
              <Button
                variant="whatsapp"
                icon={MessageCircle}
                href={getQuoteWhatsAppUrl(success.enquiryId, business?.whatsapp, success.serviceName)}
                target="_blank"
              >
                {t('quote.whatsappFollowUp')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setForm({
                    customerName: '',
                    phone: '',
                    email: '',
                    additionalNotes: '',
                  });
                  setItems([createNewItem()]);
                }}
              >
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
          {/* Customer Information Header */}
          <div className="quote-section-heading">
            <h3>1. Customer Details</h3>
            <p>We'll use this information to send you the quotation and delivery updates.</p>
          </div>

          <div className="quote-form__grid">
            {/* Name */}
            <div className="form-group">
              <label className="form-label">{t('quote.name')} <span className="required">*</span></label>
              <input
                type="text"
                className={`form-input ${errors.customerName ? 'form-input--error' : ''}`}
                value={form.customerName}
                onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Your full name"
              />
              {errors.customerName && <div className="form-error">{errors.customerName}</div>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">{t('quote.mobile')} <span className="required">*</span></label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            {/* Email */}
            <div className="form-group quote-form__grid-full">
              <label className="form-label">{t('quote.email')} <span className="form-hint">({t('quote.optional')})</span></label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
          </div>

          {/* Multiple Services & Requirements Section */}
          <div className="quote-section-heading" style={{ marginTop: 'var(--space-8)' }}>
            <div className="quote-section-heading__row">
              <div>
                <h3>2. Services & Requirements</h3>
                <p>Add all the printing items and requirements you would like quoted together.</p>
              </div>
              <span className="quote-count-badge">
                <Layers size={14} />
                {items.length} {items.length === 1 ? 'Service' : 'Services'}
              </span>
            </div>
          </div>

          <div className="quote-items-list">
            {items.map((item, index) => {
              const selectedSvc = services.find(
                (s) => s.id === item.serviceId || s.slug === item.serviceId
              );

              return (
                <div className="quote-item-card" key={item.id}>
                  <div className="quote-item-card__header">
                    <div className="quote-item-card__title-wrap">
                      <div className="quote-item-card__num-badge">
                        <Package size={14} />
                        <span>Service #{index + 1}</span>
                      </div>
                      {selectedSvc && (
                        <span className="quote-item-card__selected-name">
                          {getLocalized(selectedSvc.title, lang)}
                        </span>
                      )}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        className="quote-item-card__remove-btn"
                        onClick={() => handleRemoveItem(index)}
                        title="Remove this service"
                      >
                        <Trash2 size={15} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="quote-form__grid">
                    {/* Service Selection */}
                    <div className="form-group">
                      <label className="form-label">{t('quote.service')} <span className="required">*</span></label>
                      <select
                        className={`form-select ${errors[`item_${index}_serviceId`] ? 'form-input--error' : ''}`}
                        value={item.serviceId}
                        onChange={(e) => handleItemChange(index, 'serviceId', e.target.value)}
                      >
                        <option value="">{t('quote.selectService')}</option>
                        {services.map((s) => (
                          <option key={s.id || s.slug} value={s.id || s.slug}>
                            {getLocalized(s.title, lang)}
                          </option>
                        ))}
                      </select>
                      {errors[`item_${index}_serviceId`] && (
                        <div className="form-error">{errors[`item_${index}_serviceId`]}</div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="form-group">
                      <label className="form-label">{t('quote.quantity')} <span className="form-hint">({t('quote.optional')})</span></label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="e.g. 100, 500, 1000"
                      />
                    </div>
                  </div>

                  {/* Dynamic service-specific fields for this item */}
                  {selectedSvc?.enquiryFields?.length > 0 && (
                    <div className="quote-item-card__dynamic">
                      <span className="quote-item-card__dynamic-title">
                        {getLocalized(selectedSvc.title, lang)} — Specifications
                      </span>
                      <div className="quote-form__grid">
                        {selectedSvc.enquiryFields.map((field) => (
                          <div className="form-group" key={field.name}>
                            <label className="form-label">
                              {getLocalized(field.label, lang)}
                              {field.required && <span className="required">*</span>}
                            </label>
                            {field.type === 'select' ? (
                              <select
                                className={`form-select ${errors[`item_${index}_dynamic_${field.name}`] ? 'form-input--error' : ''}`}
                                value={item.dynamicFields[field.name] || ''}
                                onChange={(e) => handleItemDynamicChange(index, field.name, e.target.value)}
                              >
                                <option value="">Select...</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : field.type === 'textarea' ? (
                              <textarea
                                className={`form-textarea ${errors[`item_${index}_dynamic_${field.name}`] ? 'form-textarea--error' : ''}`}
                                value={item.dynamicFields[field.name] || ''}
                                onChange={(e) => handleItemDynamicChange(index, field.name, e.target.value)}
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                className={`form-input ${errors[`item_${index}_dynamic_${field.name}`] ? 'form-input--error' : ''}`}
                                value={item.dynamicFields[field.name] || ''}
                                onChange={(e) => handleItemDynamicChange(index, field.name, e.target.value)}
                              />
                            )}
                            {errors[`item_${index}_dynamic_${field.name}`] && (
                              <div className="form-error">{errors[`item_${index}_dynamic_${field.name}`]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirement Description */}
                  <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                    <label className="form-label">
                      Requirement & Specifications <span className="required">*</span>
                    </label>
                    <textarea
                      className={`form-textarea ${errors[`item_${index}_requirement`] ? 'form-textarea--error' : ''}`}
                      value={item.requirement}
                      onChange={(e) => handleItemChange(index, 'requirement', e.target.value)}
                      placeholder="Specify size (e.g. 8x4 ft), paper thickness (GSM), matte/gloss finish, binding style, or design details..."
                      rows={3}
                    />
                    {errors[`item_${index}_requirement`] && (
                      <div className="form-error">{errors[`item_${index}_requirement`]}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Another Service Button */}
          <div className="quote-add-item-wrap">
            <button
              type="button"
              className="quote-add-item-btn"
              onClick={handleAddItem}
            >
              <div className="quote-add-item-btn__icon">
                <Plus size={18} />
              </div>
              <div className="quote-add-item-btn__text">
                <strong>+ Add Another Service or Requirement</strong>
                <span>Add Visiting Cards, Banners, Wedding Cards, Bill Books, or Forms to this quote</span>
              </div>
            </button>
          </div>

          {/* Additional notes for the entire enquiry */}
          <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
            <label className="form-label">
              {t('quote.additionalNotes')} <span className="form-hint">({t('quote.optional')})</span>
            </label>
            <textarea
              className="form-textarea"
              value={form.additionalNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any overall deadlines, delivery preferences, or general notes for the shop..."
              rows={3}
            />
          </div>

          {errors.submit && (
            <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>
              {errors.submit}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" icon={Send} loading={submitting} fullWidth>
            {submitting
              ? t('quote.submitting')
              : items.length > 1
                ? `Submit Quote for ${items.length} Services`
                : t('quote.submit')}
          </Button>
        </form>
      </div>
    </main>
  );
}
