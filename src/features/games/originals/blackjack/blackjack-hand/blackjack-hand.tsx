/* eslint-disable react-hooks/refs -- deal initial reads handRef like betstrike blackjack-table */
'use client';

import { useRef, useState } from 'react';

import type { BlackjackHandProps } from './blackjack-hand.types';
import { getBlackjackHandVisualState } from './blackjack-hand.types';

import { motion } from 'framer-motion';

import {
  BLACKJACK_CARD_DEAL_TRANSITION,
  getBlackjackCardInitialPosition,
  getBlackjackPlayerAnimatePosition,
} from '#ui/features/games/originals/blackjack/blackjack-animation';
import { BlackjackCardStatic } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card';
import { useBlackjackDeckOrigin } from '#ui/features/games/originals/blackjack/blackjack-board/blackjack-deck-origin';
import { cn } from '#ui/lib/cn';

/**
 * Player hand with betstrike deal/layout animation:
 * new cards fly from shoe; existing cards shift via animate + layout;
 * split uses layoutId and skips re-fly for cards already on the table.
 * Static (animate=false) still uses the same fan/overlap end-state.
 */
export function BlackjackHand({
  score,
  cards,
  active = false,
  result = 'playing',
  label,
  className,
  handIndex = 0,
  animate = true,
}: BlackjackHandProps) {
  const visual = getBlackjackHandVisualState(result, active);
  const cardVisual = visual === 'blackjack' ? 'win' : visual;
  const accessibleName =
    label ??
    `Hand score ${score}${visual !== 'idle' && visual !== 'active' ? `, ${visual}` : ''}`;

  const handRef = useRef<HTMLUListElement | null>(null);
  const { origin, ready, isSplit, initialCardCounts } = useBlackjackDeckOrigin();
  const [flippedCards, setFlippedCards] = useState<boolean[]>([]);

  const showAnimated = animate && ready;

  return (
    <div
      className={cn('blackjack-hand', className)}
      data-state={visual}
      aria-label={accessibleName}
    >
      <motion.ul ref={handRef} className="blackjack-hand__cards">
        {showAnimated
          ? cards.map((card, idx) => {
              const layoutKey = card.layoutKey ?? card.id;
              const cardKey = `${handIndex}-${layoutKey}`;
              const isInitialCard = initialCardCounts[cardKey];
              const shouldAnimateFromDeck = !isSplit || !isInitialCard;
              const flipped = card.concealed ? false : (flippedCards[idx] ?? false);

              return (
                <motion.li
                  key={`hand-${handIndex}-${layoutKey}`}
                  layoutId={`player-card-${layoutKey}`}
                  initial={
                    shouldAnimateFromDeck
                      ? getBlackjackCardInitialPosition(origin, handRef.current)
                      : undefined
                  }
                  animate={getBlackjackPlayerAnimatePosition(idx, cards.length)}
                  transition={BLACKJACK_CARD_DEAL_TRANSITION}
                  layout
                  onAnimationComplete={() => {
                    setFlippedCards((prev) => {
                      const updated = [...prev];
                      updated[idx] = true;
                      return updated;
                    });
                  }}
                  className={cn(
                    'blackjack-hand__card',
                    `blackjack-hand__card--${cardVisual}`,
                  )}
                >
                  <BlackjackCardStatic
                    src={card.concealed || !flipped ? '/img/games/blackjack/cards/back.png' : card.src}
                    label={card.label}
                  />
                </motion.li>
              );
            })
          : !animate
            ? cards.map((card, idx) => {
                const pos = getBlackjackPlayerAnimatePosition(idx, cards.length);
                return (
                  <li
                    key={card.id}
                    className={cn(
                      'blackjack-hand__card',
                      `blackjack-hand__card--${cardVisual}`,
                    )}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px)`,
                      zIndex: pos.zIndex,
                    }}
                  >
                    <BlackjackCardStatic
                      src={card.concealed ? '/img/games/blackjack/cards/back.png' : card.src}
                      label={card.label}
                    />
                  </li>
                );
              })
            : null}
      </motion.ul>
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
