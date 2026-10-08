const PLINKO_MULTIPLIER_COLOR_VARS = [
  'var(--ds-purple-500)',
  'var(--ds-purple-600)',
  'var(--ds-purple-700)',
  'var(--ds-purple-800)',
  'var(--ds-purple-800)',
  'var(--ds-purple-800)',
  'var(--ds-purple-950)',
  'var(--ds-purple-950)',
  'var(--ds-purple-950)',
] as const;

export function getPlinkoMultiplierColor(index: number, count: number): string {
  const maxIndex = PLINKO_MULTIPLIER_COLOR_VARS.length - 1;
  const centerLeft = Math.floor((count - 1) / 2);
  const centerRight = count % 2 === 0 ? centerLeft + 1 : centerLeft;
  const distanceFromCenter = Math.max(
    Math.abs(index - centerLeft),
    Math.abs(index - centerRight),
  );
  const colorIndex = Math.min(maxIndex, distanceFromCenter);

  return (
    PLINKO_MULTIPLIER_COLOR_VARS[maxIndex - colorIndex] ?? PLINKO_MULTIPLIER_COLOR_VARS[0]
  );
}

export function getPlinkoMultiplierColors(count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    getPlinkoMultiplierColor(index, count),
  );
}
