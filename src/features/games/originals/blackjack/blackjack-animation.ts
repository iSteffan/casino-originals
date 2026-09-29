/** Shared deal/layout math ported from betstrike blackjack-table.tsx — do not invent new behavior. */

export type BlackjackDeckOrigin = { x: number; y: number };

export function getBlackjackCardInitialPosition(
  origin: BlackjackDeckOrigin,
  handEl: HTMLElement | null,
): { x: number; y: number; opacity?: number } {
  if (!handEl || !origin.x || !origin.y) return { x: 0, y: 0 };

  const handRect = handEl.getBoundingClientRect();
  const targetX = handRect.left + handRect.width / 2;
  const targetY = handRect.top + handRect.height / 2;

  return {
    x: origin.x - targetX,
    y: origin.y - targetY,
    opacity: 0,
  };
}

/** Dealer fan end-state — mirrors betstrike getDealerAnimatePosition. */
export function getBlackjackDealerAnimatePosition(idx: number) {
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
}

/** Player stack end-state — mirrors betstrike getPlayerAnimatePosition. */
export function getBlackjackPlayerAnimatePosition(idx: number, length: number) {
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
}

/** Fly-from-shoe duration — betstrike motion.li transition duration: 0.6. */
export const BLACKJACK_CARD_DEAL_TRANSITION = { duration: 0.6, ease: 'easeOut' as const };

/** Face flip after fly locks — betstrike BlackjaskCard transition duration: 0.5. */
export const BLACKJACK_CARD_FLIP_TRANSITION = { duration: 0.5 };

/**
 * Delay between each initial-deal card append.
 * Ported from betstrike blackjack-context.tsx startGame nested setTimeout(..., 1000).
 * Next card starts after prior fly (0.6s) without waiting for the 0.5s flip.
 */
export const BLACKJACK_DEAL_STEP_MS = 1000;

/** ms equivalent of BLACKJACK_CARD_DEAL_TRANSITION — D2 fly complete before naturals/insurance. */
export const BLACKJACK_DEAL_FLY_MS = BLACKJACK_CARD_DEAL_TRANSITION.duration * 1000;
