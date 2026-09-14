'use client';

import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { TowersCellState } from './towers-cell.types';
import { isTowersCellRevealed } from './towers-cell.utils';

import { getMotionOptions, shouldReduceMotion } from '#ui/lib/motion';

function getTowersCellFlipMs(element: HTMLElement | null): number {
  if (!element) return 0;

  const duration = Number(getMotionOptions(element, '--ds-duration-fast').duration);
  return Number.isFinite(duration) && duration > 0 ? duration : 0;
}

export function useTowersCellFlip({
  state,
  reducedMotion = false,
  flipperRef,
}: {
  state: TowersCellState;
  reducedMotion?: boolean;
  flipperRef: RefObject<HTMLDivElement | null>;
}) {
  const [displayState, setDisplayState] = useState(state);
  const [flipPhase, setFlipPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [flipKey, setFlipKey] = useState(0);
  const [flipDurationMs, setFlipDurationMs] = useState(0);
  const displayStateRef = useRef(displayState);
  const targetStateRef = useRef(state);
  const flipPhaseRef = useRef(flipPhase);
  const flipKeyRef = useRef(flipKey);

  useLayoutEffect(() => {
    displayStateRef.current = displayState;
  }, [displayState]);

  useLayoutEffect(() => {
    targetStateRef.current = state;
  }, [state]);

  useLayoutEffect(() => {
    flipPhaseRef.current = flipPhase;
  }, [flipPhase]);

  const skipMotion = reducedMotion || shouldReduceMotion();

  useLayoutEffect(() => {
    const fromState = displayStateRef.current;

    if (state === fromState) {
      setFlipPhase('idle');
      return;
    }

    const tokenDurationMs = getTowersCellFlipMs(flipperRef.current);

    if (
      skipMotion ||
      tokenDurationMs <= 0 ||
      isTowersCellRevealed(fromState) === isTowersCellRevealed(state)
    ) {
      setDisplayState(state);
      setFlipPhase('idle');
      return;
    }

    setFlipDurationMs(tokenDurationMs);
    setFlipPhase('out');
    flipKeyRef.current += 1;
    setFlipKey(flipKeyRef.current);
  }, [flipperRef, skipMotion, state]);

  const onFlipPhaseEnd = useCallback((generation: number) => {
    if (generation !== flipKeyRef.current) return;

    if (flipPhaseRef.current === 'out') {
      setDisplayState(targetStateRef.current);
      setFlipPhase('in');
      return;
    }

    if (flipPhaseRef.current !== 'in') return;

    setDisplayState(targetStateRef.current);
    setFlipPhase('idle');
  }, []);

  useEffect(() => {
    if (flipPhase === 'idle') return undefined;

    const timeout = window.setTimeout(
      () => onFlipPhaseEnd(flipKey),
      Math.max(1, flipDurationMs / 2) + 32,
    );

    return () => window.clearTimeout(timeout);
  }, [flipDurationMs, flipKey, flipPhase, onFlipPhaseEnd]);

  return {
    displayState,
    flipping: flipPhase !== 'idle',
    flipPhase,
    flipKey,
    onFlipPhaseEnd,
    targetState: state,
    flipDurationMs,
  };
}
