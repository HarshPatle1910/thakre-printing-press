/**
 * Generate a URL-safe slug from text
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Format a phone number for display
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format timestamp to readable date and time
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get localized content from a multilingual field
 */
export function getLocalized(field, lang = 'en') {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || field.mr || field.hi || '';
}

/**
 * Time formatting (24h to 12h)
 */
export function formatTime(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

/**
 * Check if currently open based on opening hours
 */
export function isCurrentlyOpen(openingHours) {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];
  const todayHours = openingHours?.[today];

  if (!todayHours || todayHours.closed) return false;

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

/**
 * Get map embed URL from location object
 */
export function getMapEmbedUrl(location) {
  if (!location) return null;
  if (location.googleMapsUrl && location.googleMapsUrl.includes('output=embed')) {
    return location.googleMapsUrl;
  }
  const lat = location.lat || 21.2437;
  const lng = location.lng || 80.2084;
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
}

/**
 * Truncate text to a max length
 */
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format image URL: converts Google Drive sharing links and Dropbox links to direct image CDN links
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a direct Google User Content link
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }

  // Google Drive sharing links or paths (e.g., https://drive.google.com/file/d/ID/... or /file/d/ID/...)
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com') || trimmed.includes('/file/d/')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }
  }

  // Dropbox links (ensure raw=1 so it serves image bytes)
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.match(/[?&]dl=0/)) {
      return trimmed.replace(/([?&])dl=0/, '$1raw=1');
    }
    return trimmed.includes('?') ? `${trimmed}&raw=1` : `${trimmed}?raw=1`;
  }

  return trimmed;
}

