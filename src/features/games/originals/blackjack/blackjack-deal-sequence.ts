/**
 * Initial-deal sequencer ported from betstrike legacy blackjack-context.tsx `startGame`
 * (deleted in 6052c4f52; last at apps/web/src/legacy-originals/engine/games/blackjack/).
 *
 * Timing model:
 * - Nested setTimeout 1000ms between card appends: P1 → D1 → P2 → D2
 * - Outer 1000ms before P1 (same as betstrike)
 * - After D2 append, wait fly duration (0.6s) then finalize — mirrors
 *   blackjack-table.tsx dealer onAnimationComplete(idx===1) → checkInitialBlackjack
 * - Flip is independent: board/hand set flipped on fly onAnimationComplete (do not gate next deal)
 */

import {
  BLACKJACK_DEAL_FLY_MS,
  BLACKJACK_DEAL_STEP_MS,
} from '#ui/features/games/originals/blackjack/blackjack-animation';

export { BLACKJACK_DEAL_FLY_MS, BLACKJACK_DEAL_STEP_MS };

/** Order of the four initial cards — betstrike dealCard(true/false) cascade. */
export const BLACKJACK_INITIAL_DEAL_SEATS = [
  'player',
  'dealer',
  'player',
  'dealer',
] as const;

export type BlackjackInitialDealSeat = (typeof BLACKJACK_INITIAL_DEAL_SEATS)[number];

/**
 * Schedule P1→D1→P2→D2 then onComplete.
 * Returns a cancel function (clear all pending timeouts).
 */
export function scheduleBlackjackInitialDeal(
  onDealStep: () => void,
  onComplete: () => void,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, fn: () => void) => {
    timers.push(setTimeout(fn, ms));
  };

  // Exact nest from betstrike startGame; then fly-wait for checkInitialBlackjack.
  later(BLACKJACK_DEAL_STEP_MS, () => {
    onDealStep(); // P1
    later(BLACKJACK_DEAL_STEP_MS, () => {
      onDealStep(); // D1
      later(BLACKJACK_DEAL_STEP_MS, () => {
        onDealStep(); // P2
        later(BLACKJACK_DEAL_STEP_MS, () => {
          onDealStep(); // D2
          later(BLACKJACK_DEAL_FLY_MS, () => {
            onComplete();
          });
        });
      });
    });
  });

  return () => {
    for (const id of timers) clearTimeout(id);
  };
}
