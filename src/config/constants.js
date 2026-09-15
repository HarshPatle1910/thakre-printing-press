export const APP_NAME = 'Thakre Printing Press';

export const ENQUIRY_PREFIX = 'TP';

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
};

export const ENQUIRY_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  IN_DISCUSSION: 'IN_DISCUSSION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ENQUIRY_STATUS_LABELS = {
  NEW: { en: 'New', mr: 'नवीन', hi: 'नया' },
  CONTACTED: { en: 'Contacted', mr: 'संपर्क केला', hi: 'संपर्क किया' },
  IN_DISCUSSION: { en: 'In Discussion', mr: 'चर्चेत', hi: 'चर्चा में' },
  COMPLETED: { en: 'Completed', mr: 'पूर्ण', hi: 'पूर्ण' },
  CANCELLED: { en: 'Cancelled', mr: 'रद्द', hi: 'रद्द' },
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export const DEFAULT_LANGUAGE = 'en';

export const COLLECTIONS = {
  BUSINESS: 'business',
  SERVICES: 'services',
  GALLERY: 'gallery',
  GALLERY_CATEGORIES: 'galleryCategories',
  FORMS: 'forms',
  FAQS: 'faqs',
  ENQUIRIES: 'enquiries',
  USERS: 'users',
  PAGES: 'pages',
  ABOUT: 'about',
  ACTIVITY_LOGS: 'activityLogs',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const WHATSAPP_NUMBER = '919923113085';

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DEFAULT_OPENING_HOURS = {
  monday:    { open: '09:00', close: '20:00', closed: false },
  tuesday:   { open: '09:00', close: '20:00', closed: false },
  wednesday: { open: '09:00', close: '20:00', closed: false },
  thursday:  { open: '09:00', close: '20:00', closed: false },
  friday:    { open: '09:00', close: '20:00', closed: false },
  saturday:  { open: '09:00', close: '20:00', closed: false },
  sunday:    { open: '',      close: '',      closed: true },
};

export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'file', label: 'File Upload' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' },
];
