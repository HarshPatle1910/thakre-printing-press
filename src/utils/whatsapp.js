import { WHATSAPP_NUMBER } from '../config/constants';

/**
 * Format raw number to international format (defaulting to 91 for India)
 */
function cleanPhoneNumber(num, defaultNum = WHATSAPP_NUMBER) {
  if (!num) return defaultNum;
  const digits = String(num).replace(/\D/g, '');
  if (!digits) return defaultNum;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Generate WhatsApp URL with pre-filled message
 * @param {string} message - Pre-filled message
 * @param {string} number - Phone number (with or without country code)
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppUrl(message = '', number = null) {
  const targetNumber = cleanPhoneNumber(number, WHATSAPP_NUMBER);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${targetNumber}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp URL for a service enquiry
 */
export function getServiceWhatsAppUrl(serviceName, number = null) {
  const message = `Hi, I'm interested in your ${serviceName} service. Can you share more details?`;
  return getWhatsAppUrl(message, number);
}

/**
 * Generate WhatsApp URL for quote follow-up
 */
export function getQuoteWhatsAppUrl(enquiryId, number = null) {
  const message = `Hi, I submitted an enquiry (ID: ${enquiryId}). I'd like to follow up.`;
  return getWhatsAppUrl(message, number);
}

/**
 * Generate WhatsApp URL for general greeting
 */
export function getGreetingWhatsAppUrl(number = null) {
  const message = `Hello! I'm interested in your printing services.`;
  return getWhatsAppUrl(message, number);
}

/**
 * Get phone call URL
 */
export function getPhoneUrl(number = '9923113085') {
  if (!number) return 'tel:+919923113085';
  const digits = String(number).replace(/\D/g, '');
  const tenDigit = digits.length >= 10 ? digits.slice(-10) : digits;
  return `tel:+91${tenDigit}`;
}
