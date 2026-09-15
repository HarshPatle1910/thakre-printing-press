import firestoreService from './firestoreService';
import { COLLECTIONS } from '../config/constants';

/**
 * Analytics service — tracks events to Firestore.
 * Uses daily aggregation documents.
 */
const analyticsService = {
  /**
   * Get today's date key (YYYY-MM-DD)
   */
  _getDateKey() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Track a page view
   */
  async trackPageView(path) {
    try {
      const dateKey = this._getDateKey();
      const fieldPath = `pageViews.${path.replace(/\//g, '_') || '_home'}`;
      await firestoreService.incrementCounter(COLLECTIONS.ANALYTICS, dateKey, fieldPath);
    } catch (e) {
      console.warn('Analytics trackPageView failed:', e);
    }
  },

  /**
   * Track a custom event
   */
  async trackEvent(eventName, metadata = {}) {
    try {
      const dateKey = this._getDateKey();
      const fieldPath = `events.${eventName}`;
      await firestoreService.incrementCounter(COLLECTIONS.ANALYTICS, dateKey, fieldPath);
    } catch (e) {
      console.warn('Analytics trackEvent failed:', e);
    }
  },

  /**
   * Track phone call click
   */
  trackPhoneClick() {
    return this.trackEvent('phoneClick');
  },

  /**
   * Track WhatsApp click
   */
  trackWhatsAppClick() {
    return this.trackEvent('whatsappClick');
  },

  /**
   * Track quote form opened
   */
  trackQuoteFormOpened() {
    return this.trackEvent('quoteFormOpened');
  },

  /**
   * Track quote form submitted
   */
  trackQuoteFormSubmitted() {
    return this.trackEvent('quoteFormSubmitted');
  },

  /**
   * Track file upload
   */
  trackFileUpload() {
    return this.trackEvent('fileUpload');
  },

  /**
   * Track map/directions click
   */
  trackMapClick() {
    return this.trackEvent('mapClick');
  },

  /**
   * Track service view
   */
  trackServiceView(serviceSlug) {
    return this.trackEvent(`serviceView_${serviceSlug}`);
  },

  /**
   * Get analytics for a date range
   */
  async getAnalytics(startDate, endDate) {
    const constraints = [
      firestoreService.orderBy('__name__'),
    ];
    return firestoreService.getCollection(COLLECTIONS.ANALYTICS, constraints);
  },
};

export default analyticsService;
