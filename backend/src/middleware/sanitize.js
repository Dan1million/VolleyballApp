/**
 * Input sanitization utilities to prevent XSS and enforce field constraints.
 *
 * Note: SQL injection is already handled by mysql2 parameterized queries.
 * These utilities add defense-in-depth by sanitizing user-facing text.
 */

/**
 * Strip HTML tags and trim whitespace from a string.
 */
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize a text field: strip HTML, trim, and enforce max length.
 * Returns null if the result is empty.
 */
function sanitizeText(value, maxLength = 500) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return null;
  const cleaned = stripHtml(value).slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Sanitize an email: trim, lowercase, and basic format check.
 * Returns null if invalid.
 */
function sanitizeEmail(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * Validate that a value is one of the allowed options (whitelist).
 * Returns the default if the value is not in the allowed list.
 */
function validateEnum(value, allowed, defaultValue) {
  if (allowed.includes(value)) return value;
  return defaultValue;
}

/**
 * Validate and clamp an integer within a range.
 */
function sanitizeInt(value, min, max, defaultValue) {
  const num = parseInt(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

module.exports = {
  stripHtml,
  sanitizeText,
  sanitizeEmail,
  validateEnum,
  sanitizeInt,
};
