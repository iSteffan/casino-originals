'use client';

import type { ReactNode } from 'react';

import type {
  DoubleRoundProgressProps,
  DoubleRoundStatusLabels,
  DoubleRoundStatusProps,
} from './double-round-status.types';
import { useDoubleCountdown } from './use-double-countdown';

import { formatDoubleOutcome } from '#ui/features/games/originals/double/double-engine';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const DEFAULT_LABELS: DoubleRoundStatusLabels = {
  rollingIn: 'Rolling in',
  now: 'Now',
  rolling: 'Rolling',
  rolled: 'Rolled',
};

/** Legacy countdown format: `9.53 s`. */
function formatCountdown(remainingMs: number) {
  const seconds = Math.floor(remainingMs / 1000);
  const hundredths = Math.floor((remainingMs % 1000) / 10);
  return { seconds: String(seconds), hundredths: String(hundredths).padStart(2, '0') };
}

/**
 * Center text of the legacy board: betting countdown, "Now Rolling." while the strip
 * moves, "Rolled Red Joker" once the result is in.
 */
export function DoubleRoundStatus({
  phase,
  phaseEndsAt,
  bettingDurationMs,
  outcome,
  labels,
  className,
}: DoubleRoundStatusProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const remaining = useDoubleCountdown(phaseEndsAt, bettingDurationMs, phase === 'BETTING');

  let caption = text.rollingIn;
  let value: ReactNode;
  if (phase === 'BETTING') {
    const { seconds, hundredths } = formatCountdown(remaining);
    value = (
      <span className="inline-flex items-end justify-center tabular-nums">
        <span className="min-w-[2.5ch] text-end">{seconds}.</span>
        <span>{hundredths}</span>
        <span className="ml-2">s</span>
      </span>
    );
  } else if (phase === 'FINISHED' && outcome) {
    caption = text.rolled;
    value = formatDoubleOutcome(outcome);
  } else {
    caption = text.now;
    value = <span className="animate-pulse">{text.rolling}.</span>;
  }

  return (
    <div
      data-slot="double-round-status"
      data-phase={phase}
      className={cn('pointer-events-none flex h-16 flex-col items-center text-center', className)}
    >
      <Typography as="p" kind="tertiary-14-400" className="m-0 mb-1">
        {caption}
      </Typography>
      <Typography as="p" kind="white-32-700" className="m-0 leading-none">
        {value}
      </Typography>
    </div>
  );
}

/** Legacy betting progress bar under the strip (fills while bets are open). */
export function DoubleRoundProgress({
  phase,
  phaseEndsAt,
  bettingDurationMs,
  className,
}: DoubleRoundProgressProps) {
  const active = phase === 'BETTING';
  const remaining = useDoubleCountdown(phaseEndsAt, bettingDurationMs, active);
  const progress =
    bettingDurationMs > 0 ? ((bettingDurationMs - remaining) / bettingDurationMs) * 100 : 0;

  return (
    <div
      data-slot="double-round-progress"
      className={cn('flex h-1 w-full justify-center', className)}
      aria-hidden
    >
      <div
        className={cn(
          'bg-ds-gray-800 relative h-1 w-full max-w-[400px] overflow-hidden transition-opacity duration-300',
          active ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div
          className="from-ds-brand-primary to-ds-white h-full bg-gradient-to-r"
          style={{ width: `${active ? progress : 0}%` }}
        />
      </div>
    </div>
  );
}

export type {
  DoubleRoundProgressProps,
  DoubleRoundStatusLabels,
  DoubleRoundStatusProps,
} from './double-round-status.types';
