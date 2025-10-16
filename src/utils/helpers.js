/**
 * Helper functions for the CRM application
 */

/**
 * Generates a unique ID using timestamp and random number
 * @returns {string} A unique ID string
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 