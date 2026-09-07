import type { OptionGroupOption } from './option-group/option-group';

function splitOptionLabels(input: string): string[] {
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseStringOptionLabels(input: string): OptionGroupOption<string>[] {
  return splitOptionLabels(input).map((label, index) => ({
    value: String(index),
    label,
  }));
}

export function parseNumericOptionLabels(input: string): OptionGroupOption<number>[] {
  return splitOptionLabels(input).flatMap((label) => {
    const value = Number(label);
    if (!Number.isFinite(value)) return [];

    return [{ value, label }];
  });
}

/** Cell count labels (e.g. `16, 25, 36`) mapped to grid dimension values. */
export function parseMinesGridOptionLabels(input: string): OptionGroupOption<number>[] {
  return splitOptionLabels(input).flatMap((label) => {
    const cells = Number(label);
    if (!Number.isFinite(cells)) return [];

    const dimension = Math.sqrt(cells);
    if (!Number.isInteger(dimension)) return [];

    return [{ value: dimension, label }];
  });
}
