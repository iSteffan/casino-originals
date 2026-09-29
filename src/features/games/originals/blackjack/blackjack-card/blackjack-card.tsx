'use client';

/* eslint-disable @next/next/no-img-element --
 * Plain <img> required for backfaceVisibility flip layers. next/image and DS
 * Image wrappers create extra DOM that causes flip artifacts (betstrike used
 * next/image bare; Storybook/DS Image wrapper is the failure mode).
 */

import { motion } from 'framer-motion';

import type { Card } from '#ui/features/games/originals/blackjack/blackjack-session-context';
import { useBlackjackGame } from '#ui/features/games/originals/blackjack/blackjack-session-context';
import { cn } from '#ui/lib/cn';

import '#ui/features/games/originals/blackjack/blackjack.css';

type Props = {
  card: Card;
  flipped: boolean;
  isDealer: boolean;
  isActiveHand?: boolean;
  handIndex: 0 | 1;
  className?: string;
};

/**
 * Faithful port of betstrike BlackjaskCard (125c36de / pre-6052c4f52).
 * Plain <img> layers + backfaceVisibility — DS Image wrappers cause flip artifacts.
 */
export function BlackjackCard({
  card,
  flipped,
  isDealer,
  isActiveHand,
  handIndex,
  className,
}: Props) {
  const { handResults, isSplitDone } = useBlackjackGame();
  const { suit, rank } = card;

  const getBorderClassByResult = (result?: string, active?: boolean) => {
    switch (result) {
      case 'blackjack':
      case 'win':
        return 'border-ds-gray-100 win-shadow';
      case 'lose':
      case 'busted':
        return 'border-ds-gray-100 loss-shadow';
      case 'push':
        return 'border-ds-gray-100 push-shadow';
      case 'stand':
      case 'pending':
        return active ? 'border-ds-gray-100 split-active-shadow' : 'border-transparent';
      default:
        return 'border-transparent';
    }
  };

  let borderClass = 'border-transparent';

  if (isDealer) {
    borderClass = 'border-transparent';
  } else if (isSplitDone) {
    borderClass = getBorderClassByResult(handResults[handIndex], isActiveHand);
  } else {
    borderClass = getBorderClassByResult(handResults[0], isActiveHand);
  }

  return (
    <motion.div
      className={cn(
        'preserve-3d relative h-[78px] w-[60px] sm:h-[104px] sm:w-[80px] lg:h-[132px] lg:w-[102px]',
        className,
      )}
      initial={{ rotateY: flipped ? 0 : 180 }}
      animate={{ rotateY: flipped ? 0 : 180 }}
      transition={{ duration: 0.5 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="absolute inset-0 h-full w-full"
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      >
        <img
          src={`/img/games/blackjack/cards/${rank}-of-${suit}.png`}
          alt={`${rank} of ${suit}`}
          width={102}
          height={132}
          draggable={false}
          className={cn(
            'border-1 h-full w-full rounded-[4px] object-cover sm:rounded-[6px]',
            borderClass,
          )}
        />
      </div>
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <img
          src="/img/games/blackjack/cards/back.png"
          alt=""
          width={102}
          height={132}
          draggable={false}
          className="h-full w-full rounded-[4px] object-cover sm:rounded-[6px]"
        />
      </div>
    </motion.div>
  );
}

/** Static face (no flip) for isolated stories that are outside BlackjackProvider. */
export function BlackjackCardStatic({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={label}
      width={102}
      height={132}
      draggable={false}
      className={cn(
        'h-[78px] w-[60px] rounded-[4px] object-cover sm:h-[104px] sm:w-[80px] sm:rounded-[6px] lg:h-[132px] lg:w-[102px]',
        className,
      )}
    />
  );
}

export type {
  BlackjackCardProps,
  BlackjackCardStaticProps,
  BlackjackCardVisual,
} from './blackjack-card.types';
