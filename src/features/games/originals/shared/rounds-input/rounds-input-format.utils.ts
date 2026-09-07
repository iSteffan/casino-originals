import { formatNumberEditable, formatNumberGrouped } from '#ui/lib/grouped-number-format';

const MAX_INPUT_LENGTH = 30;

export function stripRoundsGrouping(input: string) {
  return input.replace(/,/g, '');
}

export function isValidRoundsInput(input: string) {
  if (input === '') return true;
  if (input.length > MAX_INPUT_LENGTH) return false;
  return /^\d*$/.test(stripRoundsGrouping(input));
}

export function normalizeRoundsValue(value: string, max?: number) {
  const normalized = stripRoundsGrouping(value.trim());
  if (!normalized || !/^\d+$/.test(normalized)) return '';

  if (max === undefined) return normalized;

  const normalizedMax = Math.max(0, Math.trunc(max));
  if (!Number.isFinite(normalizedMax)) return normalized;

  return BigInt(normalized) > BigInt(normalizedMax) ? String(normalizedMax) : normalized;
}

export function formatRoundsGrouped(value: string) {
  return formatNumberGrouped(value, 0);
}

export function formatRoundsEditable(value: string) {
  return formatNumberEditable(value, 0);
}
