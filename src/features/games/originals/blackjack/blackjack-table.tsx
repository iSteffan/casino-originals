'use client';

/* eslint-disable @next/next/no-img-element -- shoe uses plain img like card faces */

/* eslint-disable react-hooks/refs -- deal initial reads handRef like betstrike blackjack-table */
/* eslint-disable react-hooks/set-state-in-effect -- shoe measure + split snapshot mirror betstrike */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import { LayoutGroup, motion } from 'framer-motion';

import { BlackjackCard } from '#ui/features/games/originals/blackjack/blackjack-card/blackjack-card';
import { useBlackjackGame } from '#ui/features/games/originals/blackjack/blackjack-session-context';
import { cn } from '#ui/lib/cn';

import '#ui/features/games/originals/blackjack/blackjack.css';

/**
 * Faithful port of betstrike BlackjackTable (125c36de parent of 6052c4f52).
 * Shoe origin, fly, flip-on-complete, layoutId split, dealer hole reveal.
 */
export function BlackjackTable({
  theatreMode = false,
  overlay,
  className,
  demoNotice,
}: {
  theatreMode?: boolean;
  overlay?: ReactNode;
  className?: string;
  demoNotice?: string;
}) {
  const {
    playerHands,
    dealerHand,
    revealDealerSecondCard,
    flippedPlayerCards,
    setFlippedPlayerCards,
    flippedDealerCards,
    setFlippedDealerCards,
    updateDealerScore,
    playerScore,
    dealerScore,
    checkInitialBlackjack,
    isFirstRoundEnded,
    isSplitDone,
    playerHandsScores,
    activeHandIndex,
    localFlippedFirstHand,
    setLocalFlippedFirstHand,
    localFlippedSecondHand,
    setLocalFlippedSecondHand,
    handResults,
    isWin,
    isLose,
    isPush,
  } = useBlackjackGame();

  const entryRef = useRef<HTMLDivElement | null>(null);
  const playerHandRef = useRef<HTMLUListElement | null>(null);
  const secondHandRef = useRef<HTMLUListElement | null>(null);
  const dealerHandRef = useRef<HTMLUListElement | null>(null);

  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [initialCardCounts, setInitialCardCounts] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (entryRef.current) {
      const rect = entryRef.current.getBoundingClientRect();
      setOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (isSplitDone && Object.keys(initialCardCounts).length === 0) {
      const counts: Record<string, boolean> = {};
      playerHands.forEach((hand, handIdx) => {
        hand.forEach((card) => {
          const key = `${handIdx}-${card.rank}-${card.suit}`;
          counts[key] = true;
        });
      });
      setInitialCardCounts(counts);
    }
    if (!isSplitDone && Object.keys(initialCardCounts).length > 0) {
      setInitialCardCounts({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- match betstrike table effect
  }, [isSplitDone, playerHands]);

  const getInitialPosition = (
    handRef: RefObject<HTMLUListElement | null> | HTMLUListElement | null,
  ) => {
    if (!handRef || !origin.x || !origin.y) return { x: 0, y: 0 };

    const handRect =
      handRef instanceof HTMLElement
        ? handRef.getBoundingClientRect()
        : handRef?.current?.getBoundingClientRect();

    if (!handRect) return { x: 0, y: 0 };

    const targetX = handRect.left + handRect.width / 2;
    const targetY = handRect.top + handRect.height / 2;

    return {
      x: origin.x - targetX,
      y: origin.y - targetY,
      opacity: 0,
    };
  };

  const getDealerAnimatePosition = (idx: number) => {
    let xOffset = 40;
    const base = -30;

    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width > 640) {
        xOffset = 40;
      } else if (width < 640) {
        xOffset = 30;
      }
    }

    return {
      x: base + idx * xOffset,
      y: 0,
      opacity: 1,
      zIndex: idx + 1,
    };
  };

  const getPlayerAnimatePosition = (idx: number, length: number) => {
    const isLast = idx === length - 1;
    let xOffset = 40;
    const yOffset = 8;

    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width > 640) {
        xOffset = 40;
      } else if (width < 640) {
        xOffset = 18;
      }
    }

    if (isLast) {
      return {
        x: 0,
        y: 0,
        opacity: 1,
        zIndex: idx + 1,
      };
    }

    return {
      x: -((length - 1 - idx) * xOffset),
      y: (length - 1 - idx) * yOffset,
      opacity: 1,
      zIndex: idx + 1,
    };
  };

  const getPlayerScoreColorClass = (handIndex = 0) => {
    if (isSplitDone) {
      const result = handResults[handIndex];
      const isActive = activeHandIndex === handIndex;

      switch (result) {
        case 'win':
        case 'blackjack':
          return 'blackjack-score--win';
        case 'lose':
        case 'busted':
          return 'blackjack-score--lose';
        case 'push':
          return 'blackjack-score--push';
        case 'stand':
        case 'pending':
          return isActive ? 'blackjack-score--active' : 'blackjack-score--idle';
        default:
          return 'blackjack-score--idle';
      }
    }

    if (isWin) return 'blackjack-score--win';
    if (isLose) return 'blackjack-score--lose';
    if (isPush) return 'blackjack-score--push';
    return 'blackjack-score--idle';
  };

  return (
    <section
      aria-label="Blackjack table"
      className={cn(
        'blackjack-table-bg relative w-full overflow-hidden rounded-ds-lg p-6 text-ds-text-primary',
        theatreMode && 'lg:min-h-0 lg:flex-1',
        className,
      )}
    >
      <div
        ref={entryRef}
        className="pointer-events-none absolute top-[-42px] right-[44px] z-[150] sm:top-[-78px] sm:right-[64px]"
        aria-hidden={true}
      >
        <img
          src="/img/games/blackjack/cards/back.png"
          alt=""
          width={102}
          height={132}
          draggable={false}
          className="active-shadow h-[78px] w-[60px] sm:h-[104px] sm:w-[80px] lg:h-[132px] lg:w-[102px]"
        />
      </div>

      {demoNotice ? (
        <p className="text-ds-text-secondary text-ds-sm relative z-10 mb-2">{demoNotice}</p>
      ) : null}

      {/* Dealer hand */}
      <div className="relative mx-auto mt-[42px] mb-[70px] w-[102px] sm:mb-[126px]">
        <motion.ul
          ref={dealerHandRef}
          className="relative mt-[30px] flex h-[78px] list-none justify-center sm:mt-0 sm:h-[104px] lg:h-[132px]"
        >
          {ready &&
            dealerHand.map((card, idx) => (
              <motion.li
                key={`dealer-${idx}-${card.rank}-${card.suit}`}
                initial={getInitialPosition(dealerHandRef)}
                animate={getDealerAnimatePosition(idx)}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                onAnimationComplete={() => {
                  setFlippedDealerCards((prev) => {
                    const updated = [...prev];
                    updated[idx] = true;
                    const visibleCards = revealDealerSecondCard
                      ? dealerHand.filter((_, i) => updated[i])
                      : dealerHand.slice(0, 1);
                    updateDealerScore(visibleCards);
                    if (idx === 1 && !isFirstRoundEnded) checkInitialBlackjack();
                    return updated;
                  });
                }}
                className="absolute"
              >
                <BlackjackCard
                  card={card}
                  flipped={
                    Boolean(flippedDealerCards[idx]) &&
                    (idx !== 1 || revealDealerSecondCard)
                  }
                  isDealer={true}
                  handIndex={0}
                />
              </motion.li>
            ))}
        </motion.ul>
        {dealerScore > 0 && (
          <div className="blackjack-score blackjack-score--idle absolute top-1/2 left-[-56px] flex w-8 -translate-y-1/2 items-center justify-center sm:left-[-80px]">
            <p className="text-ds-sm">{dealerScore}</p>
          </div>
        )}
      </div>

      {/* Player hands */}
      <LayoutGroup>
        <div className="mb-[84px] flex justify-center gap-[80px] sm:gap-[160px]">
          <motion.ul
            ref={playerHandRef}
            className="relative ml-[60px] flex h-[78px] w-[60px] list-none justify-center sm:h-[104px] sm:w-[80px] lg:h-[132px] lg:w-[102px]"
          >
            {ready &&
              (playerHands[0] || []).map((card, idx) => {
                const cardKey = `0-${card.rank}-${card.suit}`;
                const isInitialCard = initialCardCounts[cardKey];
                const shouldAnimateFromDeck = !isSplitDone || !isInitialCard;

                return (
                  <motion.li
                    key={`hand-0-${idx}-${card.rank}-${card.suit}`}
                    layoutId={`player-card-${card.rank}-${card.suit}`}
                    initial={
                      shouldAnimateFromDeck
                        ? getInitialPosition(playerHandRef)
                        : undefined
                    }
                    animate={getPlayerAnimatePosition(idx, playerHands[0]?.length ?? 0)}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    layout
                    onAnimationComplete={() => {
                      setLocalFlippedFirstHand((prev) => {
                        const updated = [...prev];
                        updated[idx] = true;
                        return updated;
                      });
                      setFlippedPlayerCards((prev) => {
                        const updated = [...prev];
                        updated[idx] = true;
                        return updated;
                      });
                    }}
                    className="absolute"
                  >
                    <BlackjackCard
                      card={card}
                      flipped={
                        isSplitDone
                          ? Boolean(localFlippedFirstHand[idx])
                          : Boolean(flippedPlayerCards[idx])
                      }
                      isDealer={false}
                      isActiveHand={isSplitDone && activeHandIndex === 0}
                      handIndex={0}
                    />
                  </motion.li>
                );
              })}
            {(playerHandsScores[0] > 0 || playerScore > 0) && (
              <div
                className={cn(
                  'blackjack-score absolute bottom-[-40px] left-1/2 flex w-8 -translate-x-1/2 items-center justify-center',
                  getPlayerScoreColorClass(0),
                )}
              >
                <p className="text-ds-sm">
                  {isSplitDone ? playerHandsScores[0] : playerScore}
                </p>
              </div>
            )}
          </motion.ul>

          {isSplitDone && playerHands[1] && (
            <motion.ul
              ref={secondHandRef}
              className="relative flex h-[78px] w-[60px] list-none justify-center sm:h-[104px] sm:w-[80px] lg:h-[132px] lg:w-[102px]"
            >
              {playerHands[1].map((card, idx) => {
                const cardKey = `1-${card.rank}-${card.suit}`;
                const isInitialCard = initialCardCounts[cardKey];
                const shouldAnimateFromDeck = !isInitialCard;

                return (
                  <motion.li
                    key={`hand-1-${idx}-${card.rank}-${card.suit}`}
                    layoutId={`player-card-${card.rank}-${card.suit}`}
                    initial={
                      shouldAnimateFromDeck
                        ? getInitialPosition(secondHandRef)
                        : undefined
                    }
                    animate={getPlayerAnimatePosition(idx, playerHands[1].length)}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    layout
                    onAnimationComplete={() => {
                      setLocalFlippedSecondHand((prev) => {
                        const updated = [...prev];
                        if (!updated[idx]) updated[idx] = true;
                        return updated;
                      });
                    }}
                    className="absolute"
                  >
                    <BlackjackCard
                      card={card}
                      flipped={Boolean(localFlippedSecondHand[idx])}
                      isDealer={false}
                      isActiveHand={activeHandIndex === 1}
                      handIndex={1}
                    />
                  </motion.li>
                );
              })}
              {playerHandsScores[1] > 0 && (
                <div
                  className={cn(
                    'blackjack-score absolute bottom-[-40px] left-1/2 flex w-8 -translate-x-1/2 items-center justify-center',
                    getPlayerScoreColorClass(1),
                  )}
                >
                  <p className="text-ds-sm">{playerHandsScores[1]}</p>
                </div>
              )}
            </motion.ul>
          )}
        </div>
      </LayoutGroup>

      {overlay}
    </section>
  );
}
