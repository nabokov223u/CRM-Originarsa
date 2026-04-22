import type { Lead } from './types';

const ECUADOR_TIME_ZONE = 'America/Guayaquil';
const ECUADOR_OFFSET = '-05:00';
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type TimestampLike = {
  toDate: () => Date;
};

function isTimestampLike(value: unknown): value is TimestampLike {
  return typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function';
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function formatInEcuador(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: ECUADOR_TIME_ZONE,
    ...options,
  }).format(date);
}

export function parseStoredDateTime(value?: string | null): Date | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY_REGEX.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00${ECUADOR_OFFSET}`);
    return isValidDate(date) ? date : null;
  }

  const date = new Date(trimmed);
  return isValidDate(date) ? date : null;
}

export function parseEcuadorDateInput(value?: string | null, endOfDay = false): Date | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY_REGEX.test(trimmed)) {
    const time = endOfDay ? '23:59:59.999' : '00:00:00.000';
    const date = new Date(`${trimmed}T${time}${ECUADOR_OFFSET}`);
    return isValidDate(date) ? date : null;
  }

  return parseStoredDateTime(trimmed);
}

export function getDateFromTimestampLike(value: unknown): Date | null {
  if (isTimestampLike(value)) {
    const date = value.toDate();
    return isValidDate(date) ? date : null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  return null;
}

export function getLeadEntryDate(lead: Pick<Lead, 'createdAt' | 'fechaCreacion'>): Date | null {
  return getDateFromTimestampLike(lead.createdAt) ?? parseStoredDateTime(lead.fechaCreacion);
}

export function getLeadEntryTimestamp(lead: Pick<Lead, 'createdAt' | 'fechaCreacion'>): number {
  return getLeadEntryDate(lead)?.getTime() || 0;
}

export function getDateKeyInEcuador(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getLeadEntryDateKey(lead: Pick<Lead, 'createdAt' | 'fechaCreacion'>): string | null {
  const date = getLeadEntryDate(lead);
  return date ? getDateKeyInEcuador(date) : null;
}

export function formatLeadEntryDate(lead: Pick<Lead, 'createdAt' | 'fechaCreacion'>): string {
  const date = getLeadEntryDate(lead);
  if (!date) return '-';

  return formatInEcuador(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLeadEntryDateTime(lead: Pick<Lead, 'createdAt' | 'fechaCreacion'>): string {
  const date = getLeadEntryDate(lead);
  if (!date) return '-';

  return formatInEcuador(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatCalendarDayInEcuador(date: Date): string {
  return formatInEcuador(date, {
    day: '2-digit',
    month: '2-digit',
  });
}