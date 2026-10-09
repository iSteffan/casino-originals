'use client';

import { useEffect, useState } from 'react';

/**
 * Remaining milliseconds until `endsAt`, refreshed every animation frame while active
 * (legacy board used react-countdown with `intervalDelay={0}`).
 */
export function useDoubleCountdown(endsAt: number, durationMs: number, active: boolean): number {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!active || endsAt <= 0) return undefined;
    let frame = 0;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current < endsAt) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, endsAt]);

  if (!active || endsAt <= 0 || now === null) return durationMs;
  return Math.min(durationMs, Math.max(0, endsAt - now));
}
