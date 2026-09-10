'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { shouldReduceMotion } from '#ui/lib/motion';

const MINES_CELL_FLIP_FALLBACK_MS = 150;

/** Resolve `--ds-duration-fast` so the JS fallback stays aligned with CSS. */
function getMinesCellFlipMs(): number {
  if (typeof window === 'undefined') return MINES_CELL_FLIP_FALLBACK_MS;

  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-duration-fast')
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MINES_CELL_FLIP_FALLBACK_MS;
}

export function useMinesCellReveal({
  revealed,
  reducedMotion = false,
}: {
  revealed: boolean;
  reducedMotion?: boolean;
}) {
  // Settled face orientation: false = tile up, true = revealed up.
  // Double-sided card uses rotateX(0|180) — browser culls faces at the true midpoint.
  const [showFace, setShowFace] = useState(revealed);
  const [flipping, setFlipping] = useState(false);
  const previousRevealedRef = useRef(revealed);
  const flipGenerationRef = useRef(0);
  const skipMotion = reducedMotion || shouldReduceMotion();

  useLayoutEffect(() => {
    if (skipMotion) {
      flipGenerationRef.current += 1;
      previousRevealedRef.current = revealed;
      setShowFace(revealed);
      setFlipping(false);
      return;
    }

    if (revealed === previousRevealedRef.current) {
      return;
    }

    previousRevealedRef.current = revealed;

    const generation = flipGenerationRef.current + 1;
    flipGenerationRef.current = generation;
    const flipMs = getMinesCellFlipMs();

    // Phase 1: arm the transition while keeping the current transform.
    setFlipping(true);

    // Phase 2: change orientation on the next frame so the transition actually runs
    // (same-frame transition+transform often snaps with no animation).
    const rafId = window.requestAnimationFrame(() => {
      if (flipGenerationRef.current !== generation) return;
      setShowFace(revealed);
    });

    // Fallback if `transitionend` is skipped (tab background, display:none, etc.).
    const flipTimer = window.setTimeout(() => {
      if (flipGenerationRef.current !== generation) return;
      setFlipping(false);
    }, flipMs + 32);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(flipTimer);
    };
  }, [revealed, skipMotion]);

  return {
    showFace,
    flipping,
    onFlipTransitionEnd: () => {
      setFlipping(false);
    },
  };
}
