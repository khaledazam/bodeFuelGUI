/**
 * Global Data Safety Layer for Production Ready ERP
 * ------------------------------------------------
 * This utility prevents "Objects are not valid as React child" 
 * and "Cannot read property of undefined" crashes.
 */

/**
 * Safe Value: Converts any input (object, array, null) into a renderable string or number.
 * @param {any} value - The raw data to render.
 * @returns {string|number} - Safe renderable value.
 */
export const safeValue = (value) => {
  if (value === null || value === undefined) return '—';

  // If it's a React child or simple type, return it
  if (typeof value === 'string' || typeof value === 'number') return value;

  // Handle Arrays (Avoid crashing on list render)
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.map(v => typeof v === 'object' ? (v?.name || v?.title || JSON.stringify(v)) : v).join(', ');
  }

  // Handle Populated Objects (The primary source of React crashes)
  if (typeof value === 'object') {
    // If it's a Mongoose populated object, try to find a human-readable property
    return value?.name || value?.title || value?.label || value?.text || value?.username || '—';
  }

  return String(value);
};

/**
 * Safe Array: Ensures we ALWAYS have an array to .map() over.
 * @param {any} arr 
 * @returns {Array}
 */
export const safeArray = (arr) => {
  return Array.isArray(arr) ? arr : [];
};

/**
 * Safe Object: Ensures we ALWAYS have an object to destructure.
 * @param {any} obj 
 * @returns {Object}
 */
export const safeObject = (obj) => {
  return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
};

/**
 * Safe Nested Access (Optional Chaining Fallback)
 * Useful for deep paths like record.client.name
 */
export const safePath = (obj, path, fallback = '—') => {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
  return value !== undefined && value !== null ? value : fallback;
};
