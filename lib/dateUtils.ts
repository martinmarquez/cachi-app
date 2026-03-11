import { format, parseISO } from 'date-fns';

/**
 * Safely convert a date value (Date object, ISO string, or YYYY-MM-DD string)
 * into a JavaScript Date object.
 *
 * The neon serverless driver returns DATE columns as Date objects,
 * but sometimes they arrive as ISO strings through serialization.
 */
export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return parseISO(value);
  // Fallback: try constructing
  return new Date(value as any);
}

/**
 * Safely convert a date value into a "YYYY-MM-DD" string,
 * regardless of whether the input is a Date object or a string.
 */
export function toDateStr(value: string | Date): string {
  if (value instanceof Date) return format(value, 'yyyy-MM-dd');
  if (typeof value === 'string') {
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // Otherwise parse the ISO string and format
    return format(parseISO(value), 'yyyy-MM-dd');
  }
  return format(new Date(value as any), 'yyyy-MM-dd');
}

/**
 * Safely convert a time value (string like "21:00:00" or "21:00")
 * into a "HH:MM" string.
 */
export function toTimeStr(value: unknown): string {
  if (typeof value === 'string') {
    // Already a time string — take first 5 chars "HH:MM"
    return value.slice(0, 5);
  }
  if (value instanceof Date) {
    return format(value, 'HH:mm');
  }
  return '00:00';
}
