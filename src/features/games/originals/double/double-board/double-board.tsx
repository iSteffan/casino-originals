'use client';

import type { DoubleBoardProps } from './double-board.types';

import { getDoubleTile, toDoubleOutcome } from '#ui/features/games/originals/double/double-engine';
import { DoubleLastResults } from '#ui/features/games/originals/double/double-last-results/double-last-results';
import {
  DoubleRoundProgress,
  DoubleRoundStatus,
} from '#ui/features/games/originals/double/double-round-status/double-round-status';
import { DoubleStrip } from '#ui/features/games/originals/double/double-strip/double-strip';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

/**
 * Double board (betstrike legacy `double-board`): title, round status, rolling strip
 * with marker, betting progress and the last-results row.
 */
export function DoubleBoard({
  phase,
  phaseEndsAt,
  bettingDurationMs,
  rollDurationMs,
  tileIndex,
  lastResults,
  stats,
  title = 'Game result',
  statusLabels,
  lastResultsLabels,
  lastResultsAriaLabel,
  resultAnnouncement,
  reducedMotion = false,
  theatreMode = false,
  className,
}: DoubleBoardProps) {
  const outcome = toDoubleOutcome(getDoubleTile(tileIndex));

  return (
    <div
      data-slot="double-board"
      data-phase={phase}
      className={cn(
        'ds-double-board relative flex w-full min-w-0 flex-col overflow-hidden rounded-ds-md py-6',
        theatreMode ? 'min-h-[424px] lg:h-full lg:min-h-0' : 'min-h-[424px] lg:min-h-[564px]',
        className,
      )}
    >
      <Typography as="p" kind="tertiary-16-500" className="m-0 text-center">
        {title}
      </Typography>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
        <DoubleRoundStatus
          phase={phase}
          phaseEndsAt={phaseEndsAt}
          bettingDurationMs={bettingDurationMs}
          outcome={outcome}
          labels={statusLabels}
        />
        <DoubleStrip
          phase={phase}
          tileIndex={tileIndex}
          rollDurationMs={rollDurationMs}
          reducedMotion={reducedMotion}
        />
        <DoubleRoundProgress
          phase={phase}
          phaseEndsAt={phaseEndsAt}
          bettingDurationMs={bettingDurationMs}
          className="mt-1"
        />
      </div>

      <DoubleLastResults
        items={lastResults}
        stats={stats}
        labels={lastResultsLabels}
        aria-label={lastResultsAriaLabel}
        className="px-6"
      />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </div>
    </div>
  );
}

export type { DoubleBoardProps } from './double-board.types';
