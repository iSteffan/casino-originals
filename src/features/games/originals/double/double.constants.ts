import type { DoubleBetType, DoubleOutcome, DoublePhase, DoubleTileDefinition } from './double.types';

/**
 * Strip order, verbatim from betstrike legacy `double-context.tsx` (`roulettTiles`).
 * 14 slots: 2 green, 6 red, 6 black; 3 of them carry a Joker.
 */
export const DOUBLE_TILES: readonly DoubleTileDefinition[] = [
  { name: 'green', color: 'GREEN', hasJoker: false },
  { name: 'red', color: 'RED', hasJoker: false },
  { name: 'black-joker', color: 'BLACK', hasJoker: true },
  { name: 'red', color: 'RED', hasJoker: false },
  { name: 'black', color: 'BLACK', hasJoker: false },
  { name: 'red', color: 'RED', hasJoker: false },
  { name: 'black', color: 'BLACK', hasJoker: false },
  { name: 'green-joker', color: 'GREEN', hasJoker: true },
  { name: 'black', color: 'BLACK', hasJoker: false },
  { name: 'red', color: 'RED', hasJoker: false },
  { name: 'black', color: 'BLACK', hasJoker: false },
  { name: 'red-joker', color: 'RED', hasJoker: true },
  { name: 'black', color: 'BLACK', hasJoker: false },
  { name: 'red', color: 'RED', hasJoker: false },
];

export const DOUBLE_BET_TYPES: readonly DoubleBetType[] = ['RED', 'BLACK', 'GREEN', 'JOKER'];

/** Betstrike rule: at most two colors per round; Joker can always be added on top. */
export const DOUBLE_MAX_COLOR_PICKS = 2;

/**
 * Payout multipliers (stake x multiplier is returned for each winning pick).
 * Betstrike settles payouts server-side and the client never received them, so these
 * are local demo values: RED/BLACK x2, GREEN x14 (classic double table).
 * JOKER x7 is a PLACEHOLDER (3 of 14 strip slots carry a Joker); replace it with the
 * real server multiplier when the live game is wired.
 */
export const DOUBLE_PAYOUT_MULTIPLIERS: Readonly<Record<DoubleBetType, number>> = {
  RED: 2,
  BLACK: 2,
  GREEN: 14,
  JOKER: 7,
};

/**
 * Offline round timings. Betstrike drives phases from the server (`double:game-phase`);
 * these mirror the legacy client: ~10 s betting countdown, ~1 s lock (legacy rolls for
 * `betsLockedAt + 11 s`), a 10 s strip roll and a 3 s win highlight.
 */
export const DOUBLE_PHASE_DURATION_MS: Readonly<Record<DoublePhase, number>> = {
  BETTING: 10_000,
  LOCKED: 1_000,
  RESOLVING: 10_000,
  FINISHED: 3_000,
};

/** Legacy roll easing (`[transition-timing-function:cubic-bezier(0.4,0.0,0.2,1)]`). */
export const DOUBLE_ROLL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** Legacy strip repeats the 14 tiles 15 times; it rests on repeat 1 and lands on repeat 13. */
export const DOUBLE_STRIP_REPEATS = 15;
export const DOUBLE_STRIP_REST_REPEAT = 1;
export const DOUBLE_STRIP_LAND_REPEAT = 13;
export const DOUBLE_TILE_SIZE_PX = 64;
export const DOUBLE_TILE_GAP_PX = 4;

/** Legacy scroll ticks end a little before the strip stops (`totalDuration = 9700`). */
export const DOUBLE_SCROLL_SOUND_LEAD_OUT_MS = 300;

export const DOUBLE_LAST_RESULTS_LIMIT = 10;
export const DOUBLE_STATS_WINDOW = 100;

const DOUBLE_IMG = '/img/games/double';

export const DOUBLE_ROLLING_MARKER_SRC = `${DOUBLE_IMG}/rolling-icon.svg`;

export function getDoubleTileImage(tile: DoubleOutcome, win = false): string {
  const color = tile.color.toLowerCase();
  const base = tile.hasJoker ? `joker-${color}` : color;
  return `${DOUBLE_IMG}/${base}-${win ? 'win' : 'tile'}.svg`;
}

export function getDoubleSmallTileImage(tile: DoubleOutcome): string {
  if (tile.hasJoker) return `${DOUBLE_IMG}/joker-tile-small.png`;
  return `${DOUBLE_IMG}/${tile.color.toLowerCase()}-tile-small.png`;
}

export function getDoubleBetTypeImage(type: DoubleBetType): string {
  return `${DOUBLE_IMG}/config-${type.toLowerCase()}-tile.svg`;
}

export const DOUBLE_LAST_100_IMAGES = {
  red: `${DOUBLE_IMG}/last-red.png`,
  black: `${DOUBLE_IMG}/last-black.png`,
  green: `${DOUBLE_IMG}/last-green.png`,
  joker: `${DOUBLE_IMG}/last-joker.png`,
} as const;
