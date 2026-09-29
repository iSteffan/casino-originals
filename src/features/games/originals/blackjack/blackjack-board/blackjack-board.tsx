/* eslint-disable react-hooks/refs -- deal initial reads handRef like betstrike blackjack-table */
'use client';

import { useRef, useState } from 'react';

import type { BlackjackBoardProps } from './blackjack-board.types';
import { BlackjackDeckOriginProvider, useBlackjackDeckOrigin } from './blackjack-deck-origin';

import { LayoutGroup, motion } from 'framer-motion';

import {
  BLACKJACK_CARD_DEAL_TRANSITION,
  getBlackjackCardInitialPosition,
  getBlackjackDealerAnimatePosition,
} from '#ui/features/games/originals/blackjack/blackjack-animation';
import { BlackjackCardStatic } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card';
import { BlackjackHand } from '#ui/features/games/originals/blackjack/blackjack-hand/blackjack-hand';
import { cn } from '#ui/lib/cn';
import { Image } from '#ui/primitives/data-display/image/image';

function BlackjackShoe() {
  const { shoeRef } = useBlackjackDeckOrigin();
  return (
    <div
      ref={shoeRef}
      className="blackjack-shoe pointer-events-none absolute top-[-42px] right-[44px] z-[150] sm:top-[-78px] sm:right-[64px]"
      aria-hidden={true}
    >
      <Image
        src="/img/games/blackjack/cards/back.png"
        alt=""
        width={102}
        height={132}
        showSkeleton={false}
        className="blackjack-shoe__card h-[78px] w-[60px] object-cover sm:h-[104px] sm:w-[80px] lg:h-[132px] lg:w-[102px]"
        wrapperClassName="rounded-[4px] bg-ds-white sm:rounded-[6px]"
      />
    </div>
  );
}

function BlackjackDealerHand({
  dealer,
  dealerLabel,
  animate = true,
}: {
  dealer: BlackjackBoardProps['dealer'];
  dealerLabel: string;
  animate?: boolean;
}) {
  const handRef = useRef<HTMLUListElement | null>(null);
  const { origin, ready } = useBlackjackDeckOrigin();
  const [flippedCards, setFlippedCards] = useState<boolean[]>([]);

  if (!animate) {
    return (
      <div className="blackjack-dealer relative mx-auto mt-[42px] mb-[70px] w-[102px] sm:mb-[126px]">
        <h2 className="text-ds-sm font-ds-bold mb-3 text-center">{dealerLabel}</h2>
        <ul className="blackjack-dealer__cards relative mt-[30px] flex h-[78px] list-none justify-center sm:mt-0 sm:h-[104px] lg:h-[132px]">
          {dealer.map((card, idx) => {
            const pos = getBlackjackDealerAnimatePosition(idx);
            return (
              <li
                key={card.layoutKey ?? card.id}
                className="blackjack-dealer__card absolute"
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
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="blackjack-dealer relative mx-auto mt-[42px] mb-[70px] w-[102px] sm:mb-[126px]">
      <h2 className="text-ds-sm font-ds-bold mb-3 text-center">{dealerLabel}</h2>
      <motion.ul
        ref={handRef}
        className="blackjack-dealer__cards relative mt-[30px] flex h-[78px] list-none justify-center sm:mt-0 sm:h-[104px] lg:h-[132px]"
      >
        {ready &&
          dealer.map((card, idx) => {
            const flipped = card.concealed ? false : (flippedCards[idx] ?? false);
            return (
              <motion.li
                key={card.layoutKey ?? card.id}
                initial={getBlackjackCardInitialPosition(origin, handRef.current)}
                animate={getBlackjackDealerAnimatePosition(idx)}
                transition={BLACKJACK_CARD_DEAL_TRANSITION}
                onAnimationComplete={() => {
                  setFlippedCards((prev) => {
                    const updated = [...prev];
                    updated[idx] = true;
                    return updated;
                  });
                }}
                className="blackjack-dealer__card absolute"
              >
                <BlackjackCardStatic
                  src={card.concealed || !flipped ? '/img/games/blackjack/cards/back.png' : card.src}
                  label={card.label}
                />
              </motion.li>
            );
          })}
      </motion.ul>
    </div>
  );
}

function BlackjackBoardInner({
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
  animate = true,
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
        'blackjack-board bg-ds-surface-secondary text-ds-text-primary rounded-ds-lg relative flex min-h-96 flex-col overflow-hidden p-6',
        theatreMode && 'lg:min-h-0 lg:flex-1',
        className,
      )}
    >
      <BlackjackShoe />

      <p className="text-ds-text-secondary text-ds-sm relative z-10">{demoNotice}</p>

      <BlackjackDealerHand
        key={dealer[0]?.id ?? 'empty-dealer'}
        dealer={dealer}
        dealerLabel={dealerLabel}
        animate={animate}
      />

      <LayoutGroup>
        <div className="mb-[84px] flex flex-wrap items-end justify-center gap-[80px] pb-8 sm:gap-[160px]">
          {hands.map((hand, index) => (
            <BlackjackHand
              key={hand.id}
              score={hand.score}
              cards={hand.cards}
              active={hand.active}
              result={hand.result}
              label={hand.label}
              handIndex={index}
              animate={animate}
            />
          ))}
          {hands.length === 0 ? <p>{emptyLabel}</p> : null}
        </div>
      </LayoutGroup>

      <p
        role="status"
        aria-live="polite"
        className="font-ds-bold relative z-10 mt-auto text-center"
      >
        <span key={announcementId}>{announcement}</span>
      </p>

      {overlay}
    </section>
  );
}

export function BlackjackBoard(props: BlackjackBoardProps) {
  return (
    <BlackjackDeckOriginProvider hands={props.hands}>
      <BlackjackBoardInner {...props} />
    </BlackjackDeckOriginProvider>
  );
}

export type {
  BlackjackBoardProps,
  BlackjackResultAnnouncement,
} from './blackjack-board.types';
