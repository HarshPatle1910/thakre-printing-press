import { WHATSAPP_NUMBER } from '../config/constants';

/**
 * Generate WhatsApp URL with pre-filled message
 * @param {string} message - Pre-filled message
 * @param {string} number - Phone number (with country code, no +)
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppUrl(message = '', number = WHATSAPP_NUMBER) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp URL for a service enquiry
 */
export function getServiceWhatsAppUrl(serviceName) {
  const message = `Hi, I'm interested in your ${serviceName} service. Can you share more details?`;
  return getWhatsAppUrl(message);
}

/**
 * Generate WhatsApp URL for quote follow-up
 */
export function getQuoteWhatsAppUrl(enquiryId) {
  const message = `Hi, I submitted an enquiry (ID: ${enquiryId}). I'd like to follow up.`;
  return getWhatsAppUrl(message);
}

/**
 * Generate WhatsApp URL for general greeting
 */
export function getGreetingWhatsAppUrl() {
  const message = `Hello! I'm interested in your printing services.`;
  return getWhatsAppUrl(message);
}

/**
 * Get phone call URL
 */
export function getPhoneUrl(number = '9923113085') {
  return `tel:+91${number}`;
}
