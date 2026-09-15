import firestoreService from './firestoreService';
import { COLLECTIONS } from '../config/constants';

/**
 * Activity Log service — records admin actions for audit trail.
 */
const activityLogService = {
  /**
   * Log an admin action
   */
  async log(userId, userName, action, resource, resourceId = '', metadata = {}) {
    try {
      return await firestoreService.addDocument(COLLECTIONS.ACTIVITY_LOGS, {
        userId,
        userName,
        action,
        resource,
        resourceId,
        metadata,
      });
    } catch (err) {
      console.warn('Activity log write error (non-blocking):', err);
      return null;
    }
  },

  async logAction(userId, userName, action, resource, resourceId = '', metadata = {}) {
    return this.log(userId, userName, action, resource, resourceId, metadata);
  },

  // --- Convenience methods ---
  async logLogin(userId, userName) {
    return this.log(userId, userName, 'LOGIN', 'auth');
  },

  async logServiceCreated(userId, userName, serviceId, serviceName) {
    return this.log(userId, userName, 'SERVICE_CREATED', 'services', serviceId, { serviceName });
  },

  async logServiceUpdated(userId, userName, serviceId, serviceName) {
    return this.log(userId, userName, 'SERVICE_UPDATED', 'services', serviceId, { serviceName });
  },

  async logServiceDeleted(userId, userName, serviceId, serviceName) {
    return this.log(userId, userName, 'SERVICE_DELETED', 'services', serviceId, { serviceName });
  },

  async logGalleryUploaded(userId, userName, galleryId, title) {
    return this.log(userId, userName, 'GALLERY_UPLOADED', 'gallery', galleryId, { title });
  },

  async logEnquiryUpdated(userId, userName, enquiryId, status) {
    return this.log(userId, userName, 'ENQUIRY_UPDATED', 'enquiries', enquiryId, { status });
  },

  async logBusinessUpdated(userId, userName, field) {
    return this.log(userId, userName, 'BUSINESS_UPDATED', 'business', 'main', { field });
  },

  async logUserCreated(userId, userName, newUserId, newUserName) {
    return this.log(userId, userName, 'USER_CREATED', 'users', newUserId, { newUserName });
  },

  async logSettingsChanged(userId, userName, setting) {
    return this.log(userId, userName, 'SETTINGS_CHANGED', 'settings', 'general', { setting });
  },

  /**
   * Get recent activity logs
   */
  async getRecentLogs(limitCount = 50) {
    return firestoreService.getCollection(COLLECTIONS.ACTIVITY_LOGS, [
      firestoreService.orderBy('createdAt', 'desc'),
      firestoreService.limit(limitCount),
    ]);
  },
};

export default activityLogService;
