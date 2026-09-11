'use client';

import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

import type { KenoCellState } from './keno-cell.types';

import { getMotionOptions, shouldReduceMotion } from '#ui/lib/motion';

const KENO_CELL_FLIP_FALLBACK_MS = 150;

function getKenoCellVisualState(state: KenoCellState): string {
  switch (state) {
    case 'selected':
    case 'lose':
      return 'selected';
    default:
      return state;
  }
}

function getKenoCellFlipMs(element: HTMLElement | null): number {
  if (!element) return KENO_CELL_FLIP_FALLBACK_MS;

  const duration = Number(getMotionOptions(element, '--ds-duration-fast').duration);
  return Number.isFinite(duration) && duration > 0
    ? duration
    : KENO_CELL_FLIP_FALLBACK_MS;
}

export function useKenoCellFlip({
  state,
  reducedMotion = false,
  flipperRef,
}: {
  state: KenoCellState;
  reducedMotion?: boolean;
  flipperRef: RefObject<HTMLDivElement | null>;
}) {
  const [displayState, setDisplayState] = useState(state);
  const [incomingState, setIncomingState] = useState<KenoCellState | null>(null);
  const [flipKey, setFlipKey] = useState(0);
  const displayStateRef = useRef(displayState);
  const incomingStateRef = useRef(incomingState);

  useLayoutEffect(() => {
    displayStateRef.current = displayState;
  }, [displayState]);

  useLayoutEffect(() => {
    incomingStateRef.current = incomingState;
  }, [incomingState]);

  const skipMotion = reducedMotion || shouldReduceMotion();

  useLayoutEffect(() => {
    const fromState = displayStateRef.current;

    if (state === fromState) {
      setIncomingState(null);
      return;
    }

    if (
      skipMotion ||
      getKenoCellVisualState(fromState) === getKenoCellVisualState(state)
    ) {
      setDisplayState(state);
      setIncomingState(null);
      return;
    }

    setIncomingState(state);
    setFlipKey((key) => key + 1);
  }, [state, skipMotion]);

  useLayoutEffect(() => {
    if (incomingState === null) return;

    const timeout = window.setTimeout(
      () => {
        const nextState = incomingStateRef.current;
        if (nextState === null) return;
        setDisplayState(nextState);
        setIncomingState(null);
      },
      getKenoCellFlipMs(flipperRef.current) + 32,
    );

    return () => window.clearTimeout(timeout);
  }, [flipperRef, incomingState, flipKey]);

  const onFlipEnd = () => {
    const nextState = incomingStateRef.current;
    if (nextState === null) return;
    setDisplayState(nextState);
    setIncomingState(null);
  };

  return {
    displayState,
    incomingState,
    flipping: incomingState !== null,
    flipKey,
    onFlipEnd,
  };
}
