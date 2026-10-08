'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import {
  getPlinkoContentBounds,
  PLINKO_DEFAULT_FIT_SCALE,
  PLINKO_WORLD_FIT_MARGIN,
} from './plinko-board.layout';

export function usePlinkoBoardFit(rowCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(PLINKO_DEFAULT_FIT_SCALE);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width < 1 || height < 1) return;

      const bounds = getPlinkoContentBounds(rowCount);
      const nextScale = Math.min(
        (width - PLINKO_WORLD_FIT_MARGIN) / bounds.contentWidth,
        (height - PLINKO_WORLD_FIT_MARGIN) / bounds.contentHeight,
      );

      setFitScale((previous) =>
        Math.abs(previous - nextScale) < 0.001 ? previous : nextScale,
      );
    };

    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();

    return () => observer.disconnect();
  }, [rowCount]);

  return { containerRef, fitScale };
}
