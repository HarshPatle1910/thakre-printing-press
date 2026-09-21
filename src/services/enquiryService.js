import firestoreService from './firestoreService';
import { COLLECTIONS, ENQUIRY_PREFIX } from '../config/constants';

const enquiryService = {
  /**
   * Generate next enquiry ID (TP-000001, TP-000002, etc.)
   */
  async generateEnquiryId() {
    try {
      // Get current counter
      const settings = await firestoreService.getDocument(COLLECTIONS.SETTINGS, 'general');
      const currentCounter = settings?.enquiryCounter || 0;
      const newCounter = currentCounter + 1;

      // Update counter
      await firestoreService.setDocument(COLLECTIONS.SETTINGS, 'general', {
        enquiryCounter: newCounter,
      });

      // Format: TP-000001
      return `${ENQUIRY_PREFIX}-${String(newCounter).padStart(6, '0')}`;
    } catch (error) {
      // Fallback: use timestamp-based ID
      const ts = Date.now().toString().slice(-6);
      return `${ENQUIRY_PREFIX}-${ts}`;
    }
  },

  /**
   * Submit a new enquiry (supports single or multiple services/requirements)
   */
  async submitEnquiry(data) {
    const enquiryId = await this.generateEnquiryId();

    const items = Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : [{
          serviceId: data.serviceId || '',
          serviceName: data.serviceName || '',
          quantity: data.quantity || null,
          requirement: data.requirement || '',
          dynamicFields: data.dynamicFields || {},
        }];

    // Generate combined service names
    const serviceNames = items
      .map((it) => it.serviceName)
      .filter(Boolean);
    const combinedServiceName = serviceNames.length > 0
      ? serviceNames.join(', ')
      : (data.serviceName || 'General Enquiry');

    // Generate combined requirement summary including specifications
    const formatItemDetails = (it, idx) => {
      const header = items.length > 1 ? `[Item ${idx + 1}: ${it.serviceName || 'Service'}] (Qty: ${it.quantity || 'N/A'})` : '';
      const specs = it.dynamicFields && Object.keys(it.dynamicFields).length > 0
        ? Object.entries(it.dynamicFields)
            .map(([k, v]) => `• ${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}: ${v}`)
            .join('\n')
        : '';
      const notes = it.requirement ? `Notes: ${it.requirement}` : '';
      return [header, specs, notes].filter(Boolean).join('\n');
    };

    const combinedRequirement = items.map(formatItemDetails).filter(Boolean).join('\n\n') || data.requirement || '';

    const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0) || data.quantity || null;

    const enquiry = {
      enquiryId,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      serviceId: items[0]?.serviceId || data.serviceId || '',
      serviceName: combinedServiceName,
      quantity: totalQuantity,
      requirement: combinedRequirement,
      additionalNotes: data.additionalNotes || '',
      dynamicFields: items[0]?.dynamicFields || data.dynamicFields || {},
      items,
      files: data.files || [],
      status: 'NEW',
      assignedTo: null,
      internalNotes: '',
    };

    const result = await firestoreService.addDocument(COLLECTIONS.ENQUIRIES, enquiry);
    return { ...result, enquiryId, items, serviceName: combinedServiceName };
  },

  /**
   * Get all enquiries with optional filters
   */
  async getEnquiries(filters = {}) {
    const constraints = [];

    if (filters.status) {
      constraints.push(firestoreService.where('status', '==', filters.status));
    }

    if (filters.assignedTo) {
      constraints.push(firestoreService.where('assignedTo', '==', filters.assignedTo));
    }

    constraints.push(firestoreService.orderBy('createdAt', 'desc'));

    if (filters.limit) {
      constraints.push(firestoreService.limit(filters.limit));
    }

    return firestoreService.getCollection(COLLECTIONS.ENQUIRIES, constraints);
  },

  /**
   * Get single enquiry
   */
  async getEnquiry(id) {
    return firestoreService.getDocument(COLLECTIONS.ENQUIRIES, id);
  },

  /**
   * Update enquiry status
   */
  async updateStatus(id, status, userId) {
    return firestoreService.updateDocument(COLLECTIONS.ENQUIRIES, id, {
      status,
      updatedBy: userId,
    });
  },

  /**
   * Add internal note
   */
  async addInternalNote(id, note) {
    return firestoreService.updateDocument(COLLECTIONS.ENQUIRIES, id, {
      internalNotes: note,
    });
  },

  /**
   * Assign enquiry to staff
   */
  async assignEnquiry(id, staffId) {
    return firestoreService.updateDocument(COLLECTIONS.ENQUIRIES, id, {
      assignedTo: staffId,
    });
  },
};

export default enquiryService;
