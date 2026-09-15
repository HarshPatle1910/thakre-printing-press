/**
 * Storage Service — Abstraction layer for file storage.
 * Currently implements Google Drive via Firebase Cloud Functions proxy.
 * Can be swapped to Firebase Storage, S3, etc.
 */

import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Storage provider interface:
 *   upload(file, path, metadata) → { url, storagePath, name, size, type }
 *   getUrl(storagePath) → url
 *   delete(storagePath) → void
 */

// --- Firebase Storage Provider (fallback/default) ---
const firebaseStorageProvider = {
  async upload(file, path, metadata = {}) {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata: metadata,
    });
    const url = await getDownloadURL(snapshot.ref);
    return {
      url,
      storagePath: path,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  },

  async getUrl(storagePath) {
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
  },

  async delete(storagePath) {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  },
};

// --- Google Drive Provider (via Cloud Functions) ---
const googleDriveProvider = {
  async upload(file, path, metadata = {}) {
    // In production, this would call a Cloud Function that handles
    // Google Drive API uploads with a service account.
    // For now, we fall back to Firebase Storage and tag files for Drive sync.

    // Upload to Firebase Storage first
    const result = await firebaseStorageProvider.upload(file, path, {
      ...metadata,
      driveSync: 'pending',
    });

    // TODO: Call Cloud Function to sync to Google Drive
    // const driveResult = await fetch('/api/drive/upload', {
    //   method: 'POST',
    //   body: JSON.stringify({ storagePath: path, ...metadata }),
    // });

    return {
      ...result,
      driveStatus: 'pending',
    };
  },

  async getUrl(storagePath) {
    return firebaseStorageProvider.getUrl(storagePath);
  },

  async delete(storagePath) {
    await firebaseStorageProvider.delete(storagePath);
    // TODO: Also delete from Google Drive via Cloud Function
  },
};

// --- Storage Service (public API) ---
// Switch providers by changing this assignment
const activeProvider = googleDriveProvider;

const storageService = {
  /**
   * Upload a file to storage
   * @param {File} file - The file to upload
   * @param {string} directory - Storage directory (e.g., 'enquiries/TP-000001')
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Upload result with url, storagePath, name, size, type
   */
  async uploadFile(file, directory, metadata = {}) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const path = `${directory}/${timestamp}_${sanitizedName}`;

    return activeProvider.upload(file, path, metadata);
  },

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files
   * @param {string} directory - Storage directory
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object[]>} Array of upload results
   */
  async uploadFiles(files, directory, metadata = {}) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file, directory, metadata);
      results.push(result);
    }
    return results;
  },

  /**
   * Get download URL for a file
   * @param {string} storagePath - Path in storage
   * @returns {Promise<string>} Download URL
   */
  async getFileUrl(storagePath) {
    return activeProvider.getUrl(storagePath);
  },

  /**
   * Delete a file
   * @param {string} storagePath - Path in storage
   */
  async deleteFile(storagePath) {
    return activeProvider.delete(storagePath);
  },

  /**
   * Validate a file before upload
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {{ valid: boolean, error?: string }}
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    } = options;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload PDF, JPG, PNG, DOC, or DOCX files.',
      };
    }

    return { valid: true };
  },
};

export default storageService;
