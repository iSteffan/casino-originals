import BigNumber from 'bignumber.js';

import {
  PLINKO_CONFIGURATIONS,
  PLINKO_DEFAULT_RISK,
  PLINKO_DEFAULT_ROWS,
  type PlinkoRiskConfiguration,
} from './plinko.constants';

export interface PlinkoSettings {
  risk: string;
  rows: number;
}

export interface PlinkoTable {
  configuration: PlinkoRiskConfiguration | undefined;
  rowsOptions: number[];
  rows: number | undefined;
  multipliers: readonly number[];
}

export interface PlinkoDropSettlement {
  bucketIndex: number;
  multiplier: number;
  /** Betstrike `settlePlinkoDrop`: a ball counts as a win when multiplier >= 1. */
  win: boolean;
  /** Gross return in stake units (stake x multiplier). */
  payoutAmount: string;
}

/**
 * Port of betstrike `resolvePlinkoTable`: unknown risk falls back to medium (or the
 * first configuration), unknown rows fall back to the largest available row count.
 */
export function resolvePlinkoTable(
  settings: PlinkoSettings,
  configurations: readonly PlinkoRiskConfiguration[] = PLINKO_CONFIGURATIONS,
): PlinkoTable {
  const configuration =
    configurations.find((config) => config.internalId === settings.risk) ??
    configurations.find((config) => config.internalId === PLINKO_DEFAULT_RISK) ??
    configurations[0];
  const rowsOptions = Object.keys(configuration?.paytables ?? {})
    .map(Number)
    .sort((a, b) => a - b);
  const rows = rowsOptions.includes(settings.rows) ? settings.rows : rowsOptions.at(-1);

  return {
    configuration,
    rowsOptions,
    rows,
    multipliers: rows ? (configuration?.paytables[String(rows)]?.multipliers ?? []) : [],
  };
}

export function getPlinkoMultipliers(
  risk: string,
  rows: number = PLINKO_DEFAULT_ROWS,
): readonly number[] {
  return resolvePlinkoTable({ risk, rows }).multipliers;
}

function randomUnit(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! / 0x1_0000_0000;
  }
  return Math.random();
}

/**
 * Demo RNG standing in for the betstrike server `plinko:drop` result: one fair
 * left/right bounce per row, so bucket = number of right bounces (binomial).
 */
export function rollPlinkoBucket(rows: number, random: () => number = randomUnit): number {
  let bucket = 0;
  for (let row = 0; row < rows; row += 1) {
    if (random() < 0.5) bucket += 1;
  }
  return bucket;
}

/** Binomial landing probability per bucket (matches betstrike paytable `probabilities`). */
export function getPlinkoBucketProbabilities(rows: number): number[] {
  const probabilities: number[] = [];
  let combinations = 1;
  for (let bucket = 0; bucket <= rows; bucket += 1) {
    probabilities.push(combinations / 2 ** rows);
    combinations = (combinations * (rows - bucket)) / (bucket + 1);
  }
  return probabilities;
}

/** Expected return (0–1) for a paytable under fair bounces. */
export function getPlinkoReturnToPlayer(multipliers: readonly number[]): number {
  const probabilities = getPlinkoBucketProbabilities(multipliers.length - 1);
  return multipliers.reduce(
    (sum, multiplier, index) => sum + multiplier * (probabilities[index] ?? 0),
    0,
  );
}

/** Port of betstrike `settlePlinkoDrop` against a snapshotted paytable. */
export function settlePlinkoDrop(
  bucketIndex: number,
  multipliers: readonly number[],
  betAmount: string,
): PlinkoDropSettlement {
  const multiplier = multipliers[bucketIndex] ?? 0;
  return {
    bucketIndex,
    multiplier,
    win: multiplier >= 1,
    payoutAmount: new BigNumber(betAmount).times(multiplier).toFixed(),
  };
}

export function formatPlinkoMultiplier(multiplier: number): string {
  return `x${multiplier}`;
}
