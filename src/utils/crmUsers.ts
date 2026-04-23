const EXCLUDED_CRM_USER_NAMES = new Set([
  'soporte ventas',
  'soporte de ventas',
]);

export function normalizeCrmUserName(value?: string | null): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isExcludedCrmUserName(value?: string | null): boolean {
  const normalizedValue = normalizeCrmUserName(value);
  return Boolean(normalizedValue) && EXCLUDED_CRM_USER_NAMES.has(normalizedValue);
}