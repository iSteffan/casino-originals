'use client';

import type { BlackjackHandProps } from './blackjack-hand.types';
import { getBlackjackHandVisualState } from './blackjack-hand.types';

import { BlackjackCard } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card';
import { cn } from '#ui/lib/cn';

export function BlackjackHand({
  score,
  cards,
  active = false,
  result = 'playing',
  label,
  className,
}: BlackjackHandProps) {
  const visual = getBlackjackHandVisualState(result, active);
  const cardVisual = visual === 'blackjack' ? 'win' : visual;
  const accessibleName =
    label ??
    `Hand score ${score}${visual !== 'idle' && visual !== 'active' ? `, ${visual}` : ''}`;

  return (
    <div
      className={cn('blackjack-hand', className)}
      data-state={visual}
      aria-label={accessibleName}
    >
      <div className="blackjack-hand__cards">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn('blackjack-hand__card', `blackjack-hand__card--${cardVisual}`)}
          >
            <BlackjackCard src={card.src} label={card.label} />
          </div>
        ))}
      </div>
      <div
        className={cn('blackjack-hand__score', `blackjack-hand__score--${visual}`)}
        aria-hidden={true}
      >
        {score}
      </div>
    </div>
  );
}

export type {
  BlackjackHandProps,
  BlackjackHandVisual,
  BlackjackHandVisualState,
} from './blackjack-hand.types';
export { getBlackjackHandVisualState } from './blackjack-hand.types';
