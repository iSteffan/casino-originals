/** European roulette red numbers (1–36). Zero is green. */
export const ROULETTE_RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
] as const;

const ALL_NUMBERS = Array.from({ length: 37 }, (_, index) => index);

export const ROULETTE_BLACK_NUMBERS = ALL_NUMBERS.filter(
  (n) => n !== 0 && !(ROULETTE_RED_NUMBERS as readonly number[]).includes(n),
);

export const ROULETTE_EVEN_NUMBERS = ALL_NUMBERS.filter((n) => n !== 0 && n % 2 === 0);
export const ROULETTE_ODD_NUMBERS = ALL_NUMBERS.filter((n) => n % 2 === 1);

/** Desktop top–bottom columns (European table layout). */
export const ROULETTE_ROW_1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36] as const;
export const ROULETTE_ROW_2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35] as const;
export const ROULETTE_ROW_3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34] as const;

export const ROULETTE_WHEEL_NUMBERS = [
  '0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36',
  '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9',
  '22', '18', '29', '7', '28', '12', '35', '3', '26',
] as const;

export type RouletteWheelNumber = (typeof ROULETTE_WHEEL_NUMBERS)[number];

export type RouletteCellColor = 'red' | 'black' | 'green';

export function getRouletteNumberColor(n: number): RouletteCellColor {
  if (n === 0) return 'green';
  return (ROULETTE_RED_NUMBERS as readonly number[]).includes(n) ? 'red' : 'black';
}

export const ROULETTE_RANGE_MAP: Record<string, readonly number[]> = {
  '1-12': Array.from({ length: 12 }, (_, i) => i + 1),
  '13-24': Array.from({ length: 12 }, (_, i) => i + 13),
  '25-36': Array.from({ length: 12 }, (_, i) => i + 25),
  '1-18': Array.from({ length: 18 }, (_, i) => i + 1),
  '19-36': Array.from({ length: 18 }, (_, i) => i + 19),
  Even: ROULETTE_EVEN_NUMBERS,
  Odd: ROULETTE_ODD_NUMBERS,
  Red: ROULETTE_RED_NUMBERS,
  Black: ROULETTE_BLACK_NUMBERS,
  Row1: ROULETTE_ROW_1,
  Row2: ROULETTE_ROW_2,
  Row3: ROULETTE_ROW_3,
};

export type RouletteChipDef = {
  value: number;
  type: string;
  src: string;
};

export const ROULETTE_CHIPS: readonly RouletteChipDef[] = [
  { value: 0.1, type: '01', src: '/img/games/roulette/chip_sm.svg' },
  { value: 0.5, type: '05', src: '/img/games/roulette/chip_sm.svg' },
  { value: 1, type: '1', src: '/img/games/roulette/chip_md.svg' },
  { value: 5, type: '5', src: '/img/games/roulette/chip_md.svg' },
  { value: 10, type: '10', src: '/img/games/roulette/chip_lg.svg' },
  { value: 25, type: '25', src: '/img/games/roulette/chip_lg.svg' },
  { value: 100, type: '100', src: '/img/games/roulette/chip_xl.svg' },
];

export function calculateRouletteDefaultRotation(index: number): number {
  return +((360 / ROULETTE_WHEEL_NUMBERS.length) * index).toFixed(3);
}

export function calculateRouletteSpinToRotation(
  winningBet: RouletteWheelNumber,
  spins = 8,
): number {
  const anglePerTile = 360 / ROULETTE_WHEEL_NUMBERS.length;
  const tileIndex = ROULETTE_WHEEL_NUMBERS.indexOf(winningBet);
  const correctedIndex = (tileIndex + 5.4) % ROULETTE_WHEEL_NUMBERS.length;
  return -(correctedIndex * anglePerTile) + spins * 360;
}

/** Desktop table grid: 14 cols x 54px + 13 gaps x 4px. */
export const ROULETTE_DESKTOP_FIELD_WIDTH = 14 * 54 + 13 * 4;
/** Desktop: 3x54+gaps number grid + mt + outside + mt + outside. */
export const ROULETTE_DESKTOP_FIELD_HEIGHT = 3 * 54 + 2 * 4 + 4 + 54 + 4 + 54;

/**
 * Mobile stacked table natural width:
 * numbers (3×60 + 2×4) + dozens (60 + mr 4) + even-money (60 + mr 4) = 316.
 */
export const ROULETTE_MOBILE_FIELD_WIDTH = 3 * 60 + 2 * 4 + 60 + 4 + 60 + 4;

/**
 * Mobile stacked table natural height (numbers column drives it):
 * zero row + gap + 12 numbers + 2:1 (13×29 + 12×4) = 458.
 */
export const ROULETTE_MOBILE_FIELD_HEIGHT = 29 + 4 + 13 * 29 + 12 * 4;

/**
 * Extra room above/below the scaled field so stacked chips, rings, and win glows
 * are not clipped. Betstrike avoided a tight overflow-clip size-box for this reason.
 */
export const ROULETTE_FIELD_OVERFLOW_PAD = 40;
