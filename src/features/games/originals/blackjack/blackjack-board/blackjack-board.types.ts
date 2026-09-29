import type { ReactNode } from 'react';

import type { BlackjackCardVisual } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card.types';
import type { BlackjackHandVisual } from '#ui/features/games/originals/blackjack/blackjack-hand/blackjack-hand.types';

export interface BlackjackResultAnnouncement {
  id: string;
  message: string;
}

export interface BlackjackBoardProps {
  dealer: readonly BlackjackCardVisual[];
  dealerLabel: string;
  hands: readonly BlackjackHandVisual[];
  announcement: string;
  announcementId?: string;
  emptyLabel: string;
  demoNotice: string;
  tableLabel?: string;
  backgroundSrc?: string;
  theatreMode?: boolean;
  className?: string;
  overlay?: ReactNode;
  /** When false, skip deal fly/flip (part stories). Default true. */
  animate?: boolean;
}
