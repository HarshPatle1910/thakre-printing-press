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
   * Submit a new enquiry
   */
  async submitEnquiry(data) {
    const enquiryId = await this.generateEnquiryId();

    const enquiry = {
      enquiryId,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      serviceId: data.serviceId || '',
      serviceName: data.serviceName || '',
      quantity: data.quantity || null,
      requirement: data.requirement || '',
      additionalNotes: data.additionalNotes || '',
      dynamicFields: data.dynamicFields || {},
      files: data.files || [],
      status: 'NEW',
      assignedTo: null,
      internalNotes: '',
    };

    const result = await firestoreService.addDocument(COLLECTIONS.ENQUIRIES, enquiry);
    return { ...result, enquiryId };
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
