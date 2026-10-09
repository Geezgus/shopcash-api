import * as z from 'zod';
import { ValidationException } from './domain/exceptions/app.exceptions.js';
import { InvalidArgumentException } from './domain/exceptions/invalid-argument.exception.js';

export function validateId(id: string) {
  if (!z.uuidv7().safeParse(id).success) {
    throw new InvalidArgumentException(`Invalid UUID v7 format (${id})`);
  }
}

export function validateDate(date: Date, fieldName: string) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new InvalidArgumentException(`Invalid ${fieldName} date`);
  }
}

export function validateCreatedAt(createdAt: Date) {
  validateDate(createdAt, 'createdAt');
  if (createdAt > new Date()) {
    throw new InvalidArgumentException('createdAt cannot be in the future');
  }
}

export function validateUpdatedAt(updatedAt: Date) {
  validateDate(updatedAt, 'updatedAt');
}

export function validateDeletedAt(deletedAt: Date | null) {
  if (deletedAt === null) return;
  validateDate(deletedAt, 'deletedAt');
}

export function validateEmail(email: string) {
  if (typeof email !== 'string') {
    throw new InvalidArgumentException('Email must be a string');
  }
  if (!z.email().safeParse(email).success) {
    throw new ValidationException('Invalid email format', { email });
  }
}

export function validateNonNegativeNumber(value: number, fieldName: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new InvalidArgumentException(`${fieldName} must be a valid number`);
  }
  if (value < 0) {
    throw new ValidationException(`${fieldName} must be a non-negative number`);
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
