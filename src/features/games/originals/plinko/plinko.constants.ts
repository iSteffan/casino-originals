/**
 * Plinko demo configuration.
 *
 * Betstrike serves risk/rows paytables from the CMS (`getPublicPlinkoConfigurations`,
 * schema in `plinko-api.ts`). This frontend-only demo has no backend, so the tables
 * below are the last client-side copy from betstrike history
 * (`multipliers-data.json`, removed in 047d296fd "feat(plinko): update config").
 * Values are kept verbatim, including the asymmetric 14-row medium table.
 */

export type PlinkoRiskId = 'low' | 'medium' | 'high';

export interface PlinkoRiskConfiguration {
  /** Matches betstrike `PlinkoConfiguration.internalId`. */
  internalId: PlinkoRiskId;
  /** Matches betstrike `PlinkoConfiguration.label` (controller shows the first word). */
  label: string;
  /** Keyed by row count (8–16); each table has `rows + 1` buckets. */
  paytables: Record<string, { multipliers: readonly number[] }>;
}

export const PLINKO_MIN_ROWS = 8;
export const PLINKO_MAX_ROWS = 16;
export const PLINKO_ROW_COUNTS = [8, 9, 10, 11, 12, 13, 14, 15, 16] as const;

/** Betstrike session defaults (`initialSettings` + `resolvePlinkoTable` medium fallback). */
export const PLINKO_DEFAULT_RISK: PlinkoRiskId = 'medium';
export const PLINKO_DEFAULT_ROWS = 16;

const PLINKO_MULTIPLIERS: Record<string, Record<PlinkoRiskId, readonly number[]>> = {
  '8': {
    low: [5.2, 2.1, 1.0, 1.0, 0.5, 1.0, 1.0, 2.1, 5.2],
    medium: [13.0, 2.8, 1.3, 0.7, 0.4, 0.7, 1.3, 2.8, 13.0],
    high: [30.0, 3.7, 1.3, 0.4, 0.2, 0.4, 1.3, 3.7, 30.0],
  },
  '9': {
    low: [6.0, 2.0, 1.5, 1.1, 0.6, 0.6, 1.1, 1.5, 2.0, 6.0],
    medium: [20.0, 5.0, 1.5, 0.8, 0.5, 0.5, 0.8, 1.5, 5.0, 20.0],
    high: [40.0, 7.0, 2.0, 0.6, 0.2, 0.2, 0.6, 2.0, 7.0, 40.0],
  },
  '10': {
    low: [8.9, 3.0, 1.6, 1.1, 0.9, 0.5, 0.9, 1.1, 1.6, 3.0, 8.9],
    medium: [22.0, 5.3, 2.0, 1.4, 0.6, 0.3, 0.6, 1.4, 2.0, 5.3, 22.0],
    high: [75.0, 9.9, 3.2, 0.8, 0.3, 0.2, 0.3, 0.8, 3.2, 9.9, 75.0],
  },
  '11': {
    low: [10.0, 3.0, 2.3, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 2.3, 3.0, 10.0],
    medium: [28.0, 5.8, 2.6, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 2.6, 5.8, 28.0],
    high: [125.0, 13.0, 5.4, 1.5, 0.3, 0.2, 0.2, 0.3, 1.5, 5.4, 13.0, 125.0],
  },
  '12': {
    low: [10.0, 4.0, 2.8, 1.3, 1.0, 0.9, 0.5, 0.9, 1.0, 1.3, 2.8, 4.0, 10.0],
    medium: [33.0, 10.0, 4.0, 2.0, 1.2, 0.5, 0.3, 0.5, 1.2, 2.0, 4.0, 10.0, 33.0],
    high: [180.0, 20.0, 7.6, 2.0, 0.8, 0.2, 0.2, 0.2, 0.8, 2.0, 7.6, 20.0, 180.0],
  },
  '13': {
    low: [11.0, 4.5, 3.3, 2.0, 1.2, 0.9, 0.6, 0.6, 0.9, 1.2, 2.0, 3.3, 4.5, 11.0],
    medium: [40.0, 14.0, 5.0, 2.9, 1.5, 0.6, 0.4, 0.4, 0.6, 1.5, 2.9, 5.0, 14.0, 40.0],
    high: [260.0, 39.0, 11.0, 4.0, 0.9, 0.2, 0.2, 0.2, 0.2, 0.9, 4.0, 11.0, 39.0, 260.0],
  },
  '14': {
    low: [12.0, 5.0, 2.4, 1.8, 1.2, 1.0, 0.9, 0.6, 0.9, 1.0, 1.2, 1.8, 2.4, 5.0, 12.0],
    medium: [60.0, 17.0, 7.0, 4.1, 1.2, 0.7, 0.3, 0.3, 0.7, 1.2, 2.0, 4.1, 7.0, 17.0, 60.0],
    high: [420.0, 52.0, 20.0, 4.0, 2.0, 0.3, 0.2, 0.2, 0.2, 0.3, 2.0, 4.0, 20.0, 52.0, 420.0],
  },
  '15': {
    low: [14.0, 10.0, 3.0, 2.0, 1.5, 1.1, 0.9, 0.7, 0.7, 0.9, 1.1, 1.5, 2.0, 3.0, 10.0, 14.0],
    medium: [
      90.0, 17.0, 10.0, 4.1, 3.1, 1.1, 0.5, 0.4, 0.4, 0.5, 1.1, 3.1, 4.1, 10.0, 17.0, 90.0,
    ],
    high: [
      620.0, 85.0, 25.0, 8.0, 3.0, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3.0, 8.0, 25.0, 85.0, 620.0,
    ],
  },
  '16': {
    low: [
      20.0, 12.0, 6.5, 2.0, 1.3, 1.1, 1.1, 0.9, 0.5, 0.9, 1.1, 1.1, 1.3, 2.0, 6.5, 12.0, 20.0,
    ],
    medium: [
      120.0, 41.0, 9.5, 4.9, 2.7, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 2.7, 4.9, 9.5, 41.0, 120.0,
    ],
    high: [
      1000.0, 140.0, 27.0, 8.0, 4.0, 2.0, 0.2, 0.2, 0.2, 0.2, 0.2, 2.0, 4.0, 8.0, 27.0, 140.0,
      1000.0,
    ],
  },
};

function buildPaytables(risk: PlinkoRiskId): PlinkoRiskConfiguration['paytables'] {
  return Object.fromEntries(
    Object.entries(PLINKO_MULTIPLIERS).map(([rows, tables]) => [
      rows,
      { multipliers: tables[risk] },
    ]),
  );
}

/** Same shape as betstrike `PlinkoConfiguration[]` so a live API can replace it later. */
export const PLINKO_CONFIGURATIONS: readonly PlinkoRiskConfiguration[] = [
  { internalId: 'low', label: 'Low Risk', paytables: buildPaytables('low') },
  { internalId: 'medium', label: 'Medium Risk', paytables: buildPaytables('medium') },
  { internalId: 'high', label: 'High Risk', paytables: buildPaytables('high') },
];

/** Betstrike `nextRoundDelay`: time between autobet drops (balls overlap). */
export const PLINKO_AUTOBET_DELAY_MS = {
  normal: 400,
  turbo: 300,
} as const;

/** Betstrike session keeps the last 20 landed balls in history. */
export const PLINKO_HISTORY_LIMIT = 20;

/** How long the shared win modal stays up after the latest winning landing. */
export const PLINKO_WIN_MODAL_HOLD_MS = {
  normal: 1600,
  turbo: 1000,
  reducedMotion: 1200,
} as const;

export const PLINKO_PIN_SRC = '/img/games/plinko/pin-circle.svg';
