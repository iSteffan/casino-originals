'use client';

import { useEffect, useState, type RefObject } from 'react';

import {
  ROULETTE_DESKTOP_FIELD_HEIGHT,
  ROULETTE_DESKTOP_FIELD_WIDTH,
} from '../roulette.constants';

/**
 * Scales the fixed desktop roulette grid to the container width.
 * Betstrike used viewport + chat-open CSS scales (`md:scale-85`, `xl:scale-75`
 * when chat open). With OriginalsGameShell (config beside board) those viewport
 * breakpoints alone still overflow; fitting to the board column matches the
 * intent and keeps lg/xl sidebar-open layouts from clipping.
 */
export function useRouletteFieldFitScale(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      return;
    }

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const width = container.clientWidth;
      if (width <= 0) return;
      setScale(Math.min(1, width / ROULETTE_DESKTOP_FIELD_WIDTH));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, enabled]);

  return scale;
}

export { ROULETTE_DESKTOP_FIELD_HEIGHT, ROULETTE_DESKTOP_FIELD_WIDTH };
