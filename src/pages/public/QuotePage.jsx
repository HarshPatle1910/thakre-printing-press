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

/**
 * Rich specifications & dropdown options for each service category.
 * Used to ensure dropdowns are never empty and all essential job requirements are asked.
 */
export const SERVICE_SPEC_DEFAULTS = {
  'flex-banner-printing': [
    {
      name: 'material',
      label: { en: 'Flex Material', mr: 'फ्लेक्स मटेरियल', hi: 'फ्लेक्स मटेरियल' },
      type: 'select',
      required: true,
      options: [
        'Normal Star Flex (Standard 280 GSM)',
        'Heavy Duty Star Flex (Premium 340 GSM - Gloss)',
        'Blackout Flex (100% Non-Transparent / Heavy)',
        'Backlit Flex (For Glowing Light Board)',
        'Vinyl Sticker / Eco-Solvent (High Definition)',
        'One Way Vision / Mesh Banner',
      ],
    },
    {
      name: 'dimensions',
      label: { en: 'Banner Size (Width × Height)', mr: 'बॅनर आकार', hi: 'बैनर का आकार' },
      type: 'select',
      required: true,
      options: [
        '6 × 3 Feet (Standard Shop Board)',
        '8 × 4 Feet (Popular Event / Hoarding)',
        '10 × 5 Feet (Large Outdoor)',
        '12 × 6 Feet (Commercial Board)',
        'Custom Size (Specified in requirements below)',
      ],
    },
    {
      name: 'fitting',
      label: { en: 'Fitting & Eyelets', mr: 'फिटिंग आणि आयलेट्स', hi: 'फिटिंग और आईलेट्स' },
      type: 'select',
      required: false,
      options: [
        'Eyelets (Metal Rings on all 4 corners/edges)',
        'Border Pocket (For Iron Pipe Insertion)',
        'Direct Pasting on Foam Sheet / Sunboard',
        'No Fitting (Raw Printed Roll)',
      ],
    },
  ],

  'visiting-cards': [
    {
      name: 'paperType',
      label: { en: 'Card Paper Type', mr: 'कार्ड पेपर प्रकार', hi: 'कार्ड पेपर प्रकार' },
      type: 'select',
      required: true,
      options: [
        '350 GSM Premium Art Card (Standard & Durable)',
        '400 GSM Ultra-Thick Card',
        'Textured Ivory / Royal Linen Paper',
        'Metallic Shimmer Card (Gold / Silver Sheen)',
        'Plastic / Transparent Tear-Proof Card',
      ],
    },
    {
      name: 'finish',
      label: { en: 'Lamination Finish', mr: 'लॅमिनेशन फिनिश', hi: 'लेमिनेशन फिनिश' },
      type: 'select',
      required: true,
      options: [
        'Matte Lamination (Elegant & Non-reflective)',
        'Gloss Lamination (High Shine & Vibrant)',
        'Velvet Touch / Soft-Feel Lamination',
        'Spot UV + Matte (Raised Gloss on Logo/Name)',
        'Gold Foil Embossed + Velvet Matte',
        'Non-Laminated Natural Texture',
      ],
    },
    {
      name: 'sides',
      label: { en: 'Printing Sides', mr: 'प्रिंटिंग बाजू', hi: 'प्रिंटिंग साइड्स' },
      type: 'select',
      required: true,
      options: [
        'Single Side Printing',
        'Both Sides Front & Back Printing',
      ],
    },
  ],

  'wedding-cards': [
    {
      name: 'invitationType',
      label: { en: 'Occasion / Event', mr: 'प्रसंग / कार्यक्रम', hi: 'अवसर / कार्यक्रम' },
      type: 'select',
      required: true,
      options: [
        'Wedding Ceremony (शुभ विवाह)',
        'Engagement Ceremony (साखरपुडा)',
        'Housewarming Ceremony (वास्तुशांती)',
        'Birthday / Anniversary (वाढदिवस)',
        'Religious Pooja / Katha (धार्मिक पूजा)',
        'Official / Corporate Opening (उद्घाटन)',
      ],
    },
    {
      name: 'cardStyle',
      label: { en: 'Invitation Card Style', mr: 'पत्रिका प्रकार / डिझाइन', hi: 'निमंत्रण पत्रिका शैली' },
      type: 'select',
      required: true,
      options: [
        'Traditional Marathi Folding Card with Envelope',
        'Single Premium Insert Sheet with Jacket',
        'Laser-Cut Royal Box Style',
        'Scroll / Farman Style Card (शाही फरमान)',
        'Budget Economic Handout Card',
      ],
    },
    {
      name: 'eventDate',
      label: { en: 'Wedding / Event Date (Approx)', mr: 'कार्यक्रमाची तारीख', hi: 'कार्यक्रम की तारीख' },
      type: 'text',
      required: false,
    },
  ],

  'government-forms': [
    {
      name: 'formCategory',
      label: { en: 'Form / Document Type', mr: 'अर्ज / दस्तऐवज प्रकार', hi: 'फॉर्म / दस्तावेज प्रकार' },
      type: 'select',
      required: true,
      options: [
        '7/12 Land Revenue Extract (७/१२ जमीन महसूल उतारा)',
        'Affidavit / Stamp Paper Format (प्रतिज्ञापत्र नमुना)',
        'Caste Certificate & Validity Form (जात प्रमाणपत्र)',
        'Income Certificate Application (उत्पन्न दाखला)',
        'RTO Driving License / Learner Form (आरटीओ अर्ज)',
        'MahaDBT / Scholarship Online Form (महाडीबीटी)',
        'Gazette / Name Change Affidavit (राजपत्र / नाव बदल)',
        'General Legal / Court Application (न्यायालयीन अर्ज)',
      ],
    },
    {
      name: 'assistanceType',
      label: { en: 'Assistance Needed', mr: 'आवश्यक मदत', hi: 'आवश्यक सहायता' },
      type: 'select',
      required: true,
      options: [
        'Ready-made Blank Official Form Printout',
        'Computer Marathi / English Typing & Printout',
        'Stamp Paper Affidavit Drafting & Notary guidance',
        'Online Portal Form Submission Assistance',
      ],
    },
  ],

  'bill-books-registers': [
    {
      name: 'bookSize',
      label: { en: 'Book / Register Size', mr: 'पुस्तक / रजिस्टर आकार', hi: 'बुक / रजिस्टर साइज' },
      type: 'select',
      required: true,
      options: [
        'A4 Size (8.27 × 11.69 inches - Full Page)',
        'A5 Size (5.83 × 8.27 inches - Half Page - Most Popular)',
        '1/4 Size (Medium Commercial Format)',
        '1/8 Pocket Size (Cash Memo / Delivery Receipt)',
      ],
    },
    {
      name: 'copyType',
      label: { en: 'Copies per Set', mr: 'प्रतींचे प्रकार', hi: 'प्रतियों का प्रकार' },
      type: 'select',
      required: true,
      options: [
        'Duplicate (1+1 NCR Carbonless - White + Pink)',
        'Triplicate (1+2 NCR Carbonless - White + Pink + Yellow)',
        'Single Copy Book (Regular Paper with Carbon Sheet)',
        'Hardbound Register (Ruled / Ledger Paper)',
      ],
    },
    {
      name: 'numbering',
      label: { en: 'Serial Numbering', mr: 'अनुक्रमांक / नंबरिंग', hi: 'क्रम संख्या / नंबरिंग' },
      type: 'select',
      required: false,
      options: [
        'Yes - Sequential Red Serial Numbering (001 to ...)',
        'No - Without Numbering',
      ],
    },
  ],

  'xerox': [
    {
      name: 'printType',
      label: { en: 'Print Quality & Color', mr: 'प्रिंट प्रकार', hi: 'प्रिंट प्रकार' },
      type: 'select',
      required: true,
      options: [
        'High-Speed Black & White Xerox',
        'Full HD Color Laser Printing',
        'Glossy Photo Paper Print',
      ],
    },
    {
      name: 'pageSize',
      label: { en: 'Page Size', mr: 'कागद आकार', hi: 'कागज का आकार' },
      type: 'select',
      required: true,
      options: [
        'A4 Standard (75 GSM)',
        'A4 Heavy (100 GSM Bond Paper)',
        'A3 Large Sheet',
        'Legal Size (Green / White)',
      ],
    },
    {
      name: 'sides',
      label: { en: 'Sides', mr: 'बाजू', hi: 'साइड्स' },
      type: 'select',
      required: true,
      options: [
        'Single Side (Front Only)',
        'Double Sided (Back to Back)',
      ],
    },
  ],

  'lamination': [
    {
      name: 'laminationType',
      label: { en: 'Lamination Type', mr: 'लॅमिनेशन प्रकार', hi: 'लेमिनेशन प्रकार' },
      type: 'select',
      required: true,
      options: [
        'Thermal Pouch Lamination (ID Cards, Certificates, A4/A3)',
        'Roll Film Matte Lamination',
        'Roll Film Gloss Lamination',
        'Heavy 250 Micron Waterproof Sealed Pouch',
      ],
    },
  ],

  'book-binding': [
    {
      name: 'bindingType',
      label: { en: 'Binding Style', mr: 'बाइंडिंग प्रकार', hi: 'बाइंडिंग प्रकार' },
      type: 'select',
      required: true,
      options: [
        'Spiral / Coil Binding (with Transparent Sheet Cover)',
        'Wiro Metal Binding (Professional Look)',
        'Soft Cover Perfect Glue Binding',
        'Hard Cover Project Book Binding (with Golden Foil Letters)',
      ],
    },
  ],
};

/**
 * Returns required enquiry fields for a given service.
 * Fallbacks to rich pre-configured defaults if Firestore lacks options or fields.
 */
function getServiceEnquiryFields(service) {
  if (!service) return [];
  const slug = (service.slug || service.id || '').toLowerCase();

  // Match exact slug or fuzzy match category
  let defaultFields = SERVICE_SPEC_DEFAULTS[slug];
  if (!defaultFields) {
    if (slug.includes('flex') || slug.includes('banner')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['flex-banner-printing'];
    } else if ((slug.includes('visiting') || slug.includes('business')) && !slug.includes('wedding')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['visiting-cards'];
    } else if (slug.includes('wedding') || slug.includes('invitation') || slug.includes('patrika')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['wedding-cards'];
    } else if (slug.includes('form') || slug.includes('govt') || slug.includes('legal')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['government-forms'];
    } else if (slug.includes('bill') || slug.includes('register') || slug.includes('challan')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['bill-books-registers'];
    } else if (slug.includes('xerox') || slug.includes('copy')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['xerox'];
    } else if (slug.includes('lamination')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['lamination'];
    } else if (slug.includes('bind')) {
      defaultFields = SERVICE_SPEC_DEFAULTS['book-binding'];
    }
  }
  defaultFields = defaultFields || [];

  const existingFields =
    Array.isArray(service.enquiryFields) && service.enquiryFields.length > 0
      ? service.enquiryFields
      : defaultFields;

  const enrichedExisting = existingFields.map((field) => {
    const matchDefault = defaultFields.find(
      (df) => df.name.toLowerCase() === field.name.toLowerCase()
    );
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      return {
        ...field,
        options: matchDefault?.options || [
          'Standard Quality',
          'Premium Quality',
          'Custom Requirement',
        ],
      };
    }
    return field;
  });

  // Also include any essential default spec fields missing from existing
  const existingNames = new Set(enrichedExisting.map((f) => f.name.toLowerCase()));
  const missingDefaults = defaultFields.filter(
    (df) => !existingNames.has(df.name.toLowerCase())
  );

  return [...enrichedExisting, ...missingDefaults];
}

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
  const { business, settings } = useBusiness();
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

        // Pre-select service and its specification defaults if query param provided
        if (preSelectedService) {
          const match = validServices.find(
            (s) => s.id === preSelectedService || s.slug === preSelectedService
          );
          if (match) {
            setItems((prev) => {
              if (prev.length > 0 && !prev[0].serviceId) {
                const next = [...prev];
                next[0] = { ...next[0], serviceId: match.id || match.slug };
                const fields = getServiceEnquiryFields(match);
                if (fields && fields.length > 0) {
                  const initialDyn = {};
                  fields.forEach((f) => { initialDyn[f.name] = ''; });
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
    const maxItems = Number(settings?.maxServicesPerQuote) || 10;
    if (items.length >= maxItems) return;
    setItems((prev) => [...prev, createNewItem()]);
  };

  // Handle removing a service item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
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
        const fields = getServiceEnquiryFields(svc);
        const initialDyn = {};
        if (fields && fields.length > 0) {
          fields.forEach((f) => { initialDyn[f.name] = ''; });
        }
        next[index].dynamicFields = initialDyn;
      }
      return next;
    });

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
      newErrors.phone = 'Mobile number is required to receive your quote';
    } else if (form.phone.replace(/\D/g, '').length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
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
        const svc = services.find((s) => s.id === item.serviceId || s.slug === item.serviceId);
        const fields = getServiceEnquiryFields(svc);
        const hasSpecFields = fields && fields.length > 0;

        if (!hasSpecFields && !item.requirement.trim()) {
          newErrors[`item_${index}_requirement`] = 'Please describe your requirement for this service';
        }

        if (hasSpecFields) {
          fields.forEach((field) => {
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

            {/* Phone (Required) */}
            <div className="form-group">
              <label className="form-label" htmlFor="customerPhone">
                {t('quote.mobile')} <span className="required">* (Required)</span>
              </label>
              <input
                id="customerPhone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel"
                required
                className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                value={form.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm((prev) => ({ ...prev, phone: cleaned }));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                }}
                placeholder="10-digit mobile number (e.g. 9876543210)"
              />
              <small className="form-hint" style={{ display: 'block', marginTop: '4px' }}>
                Required to receive quote & updates via Call / WhatsApp
              </small>
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
              const specFields = getServiceEnquiryFields(selectedSvc);

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
                  {specFields && specFields.length > 0 && (
                    <div className="quote-item-card__dynamic">
                      <span className="quote-item-card__dynamic-title">
                        {getLocalized(selectedSvc?.title, lang)} — Specifications
                      </span>
                      <div className="quote-form__grid">
                        {specFields.map((field) => (
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
                                <option value="">-- Select {getLocalized(field.label, lang)} --</option>
                                {field.options?.map((opt, optIdx) => {
                                  const optVal = typeof opt === 'object' ? (opt.value ?? opt.label) : opt;
                                  const optLabel = typeof opt === 'object' ? (getLocalized(opt.label, lang) || opt.value) : opt;
                                  return (
                                    <option key={optIdx} value={optVal}>
                                      {optLabel}
                                    </option>
                                  );
                                })}
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
                                placeholder={`Enter ${getLocalized(field.label, lang)}`}
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
                      {specFields && specFields.length > 0
                        ? 'Additional Instructions / Custom Notes'
                        : 'Requirement & Specifications'}{' '}
                      {specFields && specFields.length > 0 ? (
                        <span className="form-hint">({t('quote.optional')})</span>
                      ) : (
                        <span className="required">*</span>
                      )}
                    </label>
                    <textarea
                      className={`form-textarea ${errors[`item_${index}_requirement`] ? 'form-textarea--error' : ''}`}
                      value={item.requirement}
                      onChange={(e) => handleItemChange(index, 'requirement', e.target.value)}
                      placeholder={
                        specFields && specFields.length > 0
                          ? 'Any specific text, custom dimensions, delivery preferences, or design instructions...'
                          : 'Specify size, paper thickness (GSM), finish, or any other details...'
                      }
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
          {settings?.allowMultiServiceQuotes !== false && items.length < (Number(settings?.maxServicesPerQuote) || 10) && (
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
          )}

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
