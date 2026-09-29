/* eslint-disable react-hooks/set-state-in-effect -- shoe measure + split card snapshot mirror betstrike table */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { BlackjackDeckOrigin } from '#ui/features/games/originals/blackjack/blackjack-animation';
import type { BlackjackHandVisual } from '#ui/features/games/originals/blackjack/blackjack-hand/blackjack-hand.types';

export interface BlackjackDeckOriginValue {
  origin: BlackjackDeckOrigin;
  ready: boolean;
  isSplit: boolean;
  /** Cards present when split first became true — skip deck re-fly (betstrike initialCardCounts). */
  initialCardCounts: Record<string, boolean>;
  shoeRef: (node: HTMLDivElement | null) => void;
}

const BlackjackDeckOriginContext = createContext<BlackjackDeckOriginValue>({
  origin: { x: 0, y: 0 },
  ready: true,
  isSplit: false,
  initialCardCounts: {},
  shoeRef: () => undefined,
});

export function useBlackjackDeckOrigin() {
  return useContext(BlackjackDeckOriginContext);
}

interface BlackjackDeckOriginProviderProps {
  hands: readonly BlackjackHandVisual[];
  children: ReactNode;
}

/**
 * Measures the shoe and tracks split-time card keys — mirrors betstrike BlackjackTable
 * entryRef / initialCardCounts / ready gating.
 */
export function BlackjackDeckOriginProvider({
  hands,
  children,
}: BlackjackDeckOriginProviderProps) {
  const [origin, setOrigin] = useState<BlackjackDeckOrigin>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [initialCardCounts, setInitialCardCounts] = useState<Record<string, boolean>>(
    {},
  );

  const isSplit = hands.length > 1;

  const shoeRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setReady(true);
  }, []);

  // Mirrors betstrike: deps are isSplitDone + playerHands only (not the counts map).
  useEffect(() => {
    if (isSplit && Object.keys(initialCardCounts).length === 0) {
      const counts: Record<string, boolean> = {};
      hands.forEach((hand, handIdx) => {
        hand.cards.forEach((card) => {
          const key = `${handIdx}-${card.layoutKey ?? card.id}`;
          counts[key] = true;
        });
      });
      setInitialCardCounts(counts);
    }
    if (!isSplit && Object.keys(initialCardCounts).length > 0) {
      setInitialCardCounts({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- match betstrike table effect
  }, [isSplit, hands]);

  const value = useMemo<BlackjackDeckOriginValue>(
    () => ({
      origin,
      ready,
      isSplit,
      initialCardCounts,
      shoeRef,
    }),
    [origin, ready, isSplit, initialCardCounts, shoeRef],
  );

  return (
    <BlackjackDeckOriginContext.Provider value={value}>
      {children}
    </BlackjackDeckOriginContext.Provider>
  );
}
