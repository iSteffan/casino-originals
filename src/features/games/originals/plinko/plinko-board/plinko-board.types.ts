import type { ReactNode } from 'react';

import type { PlinkoLastResultItem } from '#ui/features/games/originals/plinko/plinko-last-results/plinko-last-results.types';

export interface PlinkoResultAnnouncement {
  id: string;
  message: string;
}

export interface PlinkoPinHit {
  pinId: string;
  eventId: string;
}

export interface PlinkoMultiplierLand {
  index: number;
  eventId: string;
}

export interface PlinkoBallDrop {
  id: string;
  bucketIndex: number;
}

export interface PlinkoBallLandEvent {
  id: string;
  bucketIndex: number;
  multiplier: number;
  color: string;
}

export interface PlinkoBoardProps {
  rows: number;
  multipliers: readonly number[];
  lastResults?: readonly PlinkoLastResultItem[];
  lastResultsAriaLabel: string;
  resultAnnouncement?: PlinkoResultAnnouncement;
  /** Unique pending/in-flight events. Remove each event after `onBallLand`. */
  drops?: readonly PlinkoBallDrop[];
  onBallLand?: (event: PlinkoBallLandEvent) => void;
  turboMode?: boolean;
  reducedMotion?: boolean;
  theatreMode?: boolean;
  /**
   * Overlay (e.g. shared GameWinModal) mounted over the full-width playfield so
   * the modal card can use the whole board width without wrapping.
   */
  overlay?: ReactNode;
  className?: string;
}
