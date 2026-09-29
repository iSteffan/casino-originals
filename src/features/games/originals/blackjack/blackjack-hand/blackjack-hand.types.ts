import type { BlackjackResult } from '#ui/features/games/originals/blackjack/blackjack-engine';
import type { BlackjackCardVisual } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card.types';

/** Visual state for score badge + card glow (maps to betstrike legacy styles). */
export type BlackjackHandVisualState =
  | 'idle'
  | 'active'
  | 'bust'
  | 'lose'
  | 'push'
  | 'win'
  | 'blackjack';

export interface BlackjackHandVisual {
  id: string;
  cards: readonly BlackjackCardVisual[];
  /** Score shown in the colored badge under the cards. */
  score: number | string;
  active: boolean;
  result?: BlackjackResult;
  /** Optional accessible name for the hand. */
  label?: string;
}

export interface BlackjackHandProps {
  score: number | string;
  cards: readonly BlackjackCardVisual[];
  active?: boolean;
  result?: BlackjackResult;
  label?: string;
  className?: string;
  /**
   * Hand index for split initialCardCounts keys and layoutId scope
   * (betstrike hand 0 / hand 1).
   */
  handIndex?: number;
  /** When false, skip deal fly/flip (part stories). Default true. */
  animate?: boolean;
}

export function getBlackjackHandVisualState(
  result: BlackjackResult = 'playing',
  active = false,
): BlackjackHandVisualState {
  switch (result) {
    case 'win':
    case 'blackjack':
    case 'push':
    case 'lose':
      return result;
    case 'busted':
      return 'bust';
    case 'stand':
    case 'playing':
    default:
      return active ? 'active' : 'idle';
  }
}
