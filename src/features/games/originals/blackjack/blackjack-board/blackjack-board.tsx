'use client';

import type { BlackjackBoardProps } from './blackjack-board.types';

import { BlackjackCard } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card';
import { BlackjackHand } from '#ui/features/games/originals/blackjack/blackjack-hand/blackjack-hand';
import { cn } from '#ui/lib/cn';

export function BlackjackBoard({
  dealer,
  dealerLabel,
  hands,
  announcement,
  announcementId,
  emptyLabel,
  demoNotice,
  tableLabel = 'Blackjack table',
  backgroundSrc,
  theatreMode = false,
  className,
  overlay,
}: BlackjackBoardProps) {
  return (
    <section
      aria-label={tableLabel}
      style={
        backgroundSrc
          ? {
              backgroundImage: `url(${backgroundSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
      className={cn(
        'bg-ds-surface-secondary text-ds-text-primary rounded-ds-lg relative flex min-h-96 flex-col gap-8 p-6',
        theatreMode && 'lg:min-h-0 lg:flex-1',
        className,
      )}
    >
      <p className="text-ds-text-secondary text-ds-sm">{demoNotice}</p>

      <div className="flex flex-col items-center gap-3">
        <h2 className="text-ds-sm font-ds-bold">{dealerLabel}</h2>
        <div className="flex min-h-28 flex-wrap justify-center gap-2">
          {dealer.map((card) => (
            <BlackjackCard key={card.id} src={card.src} label={card.label} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-6 pb-8">
        {hands.map((hand) => (
          <BlackjackHand
            key={hand.id}
            score={hand.score}
            cards={hand.cards}
            active={hand.active}
            result={hand.result}
            label={hand.label}
          />
        ))}
        {hands.length === 0 ? <p>{emptyLabel}</p> : null}
      </div>

      <p role="status" aria-live="polite" className="font-ds-bold mt-auto text-center">
        <span key={announcementId}>{announcement}</span>
      </p>

      {overlay}
    </section>
  );
}

export type {
  BlackjackBoardProps,
  BlackjackResultAnnouncement,
} from './blackjack-board.types';
