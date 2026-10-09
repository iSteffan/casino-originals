export type DoubleColor = 'RED' | 'BLACK' | 'GREEN';
export type DoubleBetType = DoubleColor | 'JOKER';
export type DoublePhase = 'BETTING' | 'LOCKED' | 'RESOLVING' | 'FINISHED';

/** One rolled tile (betstrike `double:result` -> `{ color, hasJoker }`). */
export interface DoubleOutcome {
  color: DoubleColor;
  hasJoker: boolean;
}

/** Tile slot on the 14-tile strip (betstrike `roulettTiles`). */
export interface DoubleTileDefinition extends DoubleOutcome {
  /** Stable slug, e.g. `red`, `red-joker`. */
  name: string;
}

/** Betstrike `last100` history counters. */
export interface DoubleLast100Stats {
  red: number;
  black: number;
  green: number;
  joker: number;
}

export interface DoubleHistoryItem extends DoubleOutcome {
  id: string;
}

/** One accepted pick for the current round; every pick uses the same stake. */
export interface DoublePlacedBet {
  type: DoubleBetType;
  /** Stake in selected-currency crypto units. */
  amount: string;
}

export interface DoubleResultAnnouncement {
  id: string;
  message: string;
}
