import { uuidv7 } from 'uuidv7';
import {
  normalizeEmail,
  validateCreatedAt,
  validateDeletedAt,
  validateEmail,
  validateId,
  validateNonNegativeNumber,
  validateUpdatedAt,
} from '@shared/validation.js';

describe('shared/validation', () => {
  it('validates UUID v7 ids', () => {
    expect(() => validateId(uuidv7())).not.toThrow();
    expect(() => validateId('invalid')).toThrow('Invalid UUID v7 format');
  });

  it('validates dates', () => {
    expect(() => validateCreatedAt(new Date())).not.toThrow();
    expect(() => validateUpdatedAt(new Date('invalid'))).toThrow('Invalid updatedAt date');
    expect(() => validateCreatedAt(new Date(Date.now() + 60_000))).toThrow('createdAt cannot be in the future');
    expect(() => validateDeletedAt(null)).not.toThrow();
  });

  it('validates and normalizes e-mails', () => {
    expect(() => validateEmail('john@example.com')).not.toThrow();
    expect(() => validateEmail('invalid-email')).toThrow('Invalid email format');
    expect(normalizeEmail('  John@Example.COM ')).toBe('john@example.com');
  });

  it('validates non-negative numbers', () => {
    expect(() => validateNonNegativeNumber(0, 'field')).not.toThrow();
    expect(() => validateNonNegativeNumber(-1, 'field')).toThrow('must be a non-negative number');
    expect(() => validateNonNegativeNumber(Number.NaN, 'field')).toThrow('must be a valid number');
  });
});
