const {
  stripHtml,
  sanitizeText,
  sanitizeEmail,
  validateEnum,
  sanitizeInt,
} = require('../../src/middleware/sanitize');

describe('sanitize middleware', () => {
  // ── stripHtml ──
  describe('stripHtml', () => {
    it('should remove HTML tags from a string', () => {
      expect(stripHtml('<b>Hello</b>')).toBe('Hello');
      expect(stripHtml('<script>alert("xss")</script>Safe')).toBe('alert("xss")Safe');
    });

    it('should trim whitespace', () => {
      expect(stripHtml('  hello  ')).toBe('hello');
    });

    it('should return non-string values as-is', () => {
      expect(stripHtml(null)).toBeNull();
      expect(stripHtml(undefined)).toBeUndefined();
      expect(stripHtml(42)).toBe(42);
    });
  });

  // ── sanitizeText ──
  describe('sanitizeText', () => {
    it('should strip HTML and enforce max length', () => {
      expect(sanitizeText('<b>Hello World</b>', 5)).toBe('Hello');
    });

    it('should return null for empty strings', () => {
      expect(sanitizeText('')).toBeNull();
      expect(sanitizeText('   ')).toBeNull();
    });

    it('should return null for non-string values', () => {
      expect(sanitizeText(null)).toBeNull();
      expect(sanitizeText(undefined)).toBeNull();
      expect(sanitizeText(123)).toBeNull();
    });

    it('should keep valid text within length limit', () => {
      expect(sanitizeText('Valid text', 500)).toBe('Valid text');
    });

    it('should use default max length of 500', () => {
      const longText = 'a'.repeat(600);
      expect(sanitizeText(longText)).toHaveLength(500);
    });
  });

  // ── sanitizeEmail ──
  describe('sanitizeEmail', () => {
    it('should lowercase and trim a valid email', () => {
      expect(sanitizeEmail('  Test@Email.COM  ')).toBe('test@email.com');
    });

    it('should return null for invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBeNull();
      expect(sanitizeEmail('')).toBeNull();
      expect(sanitizeEmail('missing@')).toBeNull();
      expect(sanitizeEmail('@no-local.com')).toBeNull();
    });

    it('should return null for non-string values', () => {
      expect(sanitizeEmail(null)).toBeNull();
      expect(sanitizeEmail(42)).toBeNull();
    });
  });

  // ── validateEnum ──
  describe('validateEnum', () => {
    const allowed = ['beginner', 'intermediate', 'advanced', 'all'];

    it('should return the value if it is in the allowed list', () => {
      expect(validateEnum('beginner', allowed, 'all')).toBe('beginner');
      expect(validateEnum('advanced', allowed, 'all')).toBe('advanced');
    });

    it('should return the default if value is not in the allowed list', () => {
      expect(validateEnum('pro', allowed, 'all')).toBe('all');
      expect(validateEnum(null, allowed, 'all')).toBe('all');
      expect(validateEnum(undefined, allowed, 'all')).toBe('all');
    });
  });

  // ── sanitizeInt ──
  describe('sanitizeInt', () => {
    it('should parse and clamp integers within range', () => {
      expect(sanitizeInt('10', 2, 100, 12)).toBe(10);
      expect(sanitizeInt('1', 2, 100, 12)).toBe(2);   // clamped to min
      expect(sanitizeInt('200', 2, 100, 12)).toBe(100); // clamped to max
    });

    it('should return default for non-numeric values', () => {
      expect(sanitizeInt('abc', 2, 100, 12)).toBe(12);
      expect(sanitizeInt(null, 2, 100, 12)).toBe(12);
      expect(sanitizeInt(undefined, 2, 100, 12)).toBe(12);
    });

    it('should handle numeric values directly', () => {
      expect(sanitizeInt(50, 2, 100, 12)).toBe(50);
    });
  });
});
