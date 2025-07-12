// src/utils/userProfileUtils.js

// Utility functions to handle user profile management, including avatar uploads,
// settings and preferences.

/**
 * Validate user profile fields.
 * @param {Object} profile - User profile object
 * @returns {Object} - Validation results with boolean success and error messages
 */
export function validateUserProfile(profile) {
  let errors = {};
  if (!profile.username || profile.username.trim() === '') {
    errors.username = 'Username is required';
  }
  if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) {
    errors.email = 'Invalid email format';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Sanitize user input for profile fields.
 * @param {string} value - Input value
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>"'`%;()&+]/g, '');
}

// Simulated upload avatar utility.
// In real implementation, this would integrate with backend or cloud storage
/**
 * Upload user avatar file.
 * @param {File} file - Avatar file to be uploaded
 * @returns {Promise<string>} - Resolves with URL of the uploaded avatar
 */
export function uploadAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Invalid file type'));
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB limit
    if (file.size > maxSize) {
      reject(new Error('File size exceeds limit'));
      return;
    }

    // Simulate an upload delay
    setTimeout(() => {
      // Return a fake URL for testing
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
}

/**
 * Save user preferences.
 * @param {Object} preferences - User preference data
 * @returns {Promise<void>}
 */
export function savePreferences(preferences) {
  return new Promise((resolve, reject) => {
    if (!preferences || typeof preferences !== 'object') {
      reject(new Error('Invalid preferences'));
      return;
    }

    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Load user preferences.
 * @returns {Object|null} loaded preferences or null if none found
 */
export function loadPreferences() {
  try {
    const data = localStorage.getItem('userPreferences');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load preferences:', err);
    return null;
  }
}

