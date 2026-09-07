const STOP_CONDITIONS_PERCENTAGE_MAX = 999;

export const DEFAULT_STOP_CONDITIONS_PERCENTAGE = 50;

function clampStopConditionsPercentage(value: number) {
  return Math.min(STOP_CONDITIONS_PERCENTAGE_MAX, Math.max(0, value));
}

export function parseStopConditionsPercentageInput(input: string) {
  if (input === '') return null;

  const parsed = Number(input);
  if (Number.isNaN(parsed)) return null;

  return clampStopConditionsPercentage(parsed);
}
