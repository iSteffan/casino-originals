'use client';

import { useState } from 'react';

import {
  getPlinkoContentBounds,
  getPlinkoMultiplierRects,
  getPlinkoPins,
  PLINKO_LAYOUT,
  PLINKO_WORLD,
} from './plinko-board.layout';
import { PLINKO_BALL_RADIUS } from './plinko-board.path';
import type { PlinkoBoardProps, PlinkoPinHit } from './plinko-board.types';
import { getPlinkoMultiplierColors } from './plinko-board.utils';
import { usePlinkoBallDrops } from './use-plinko-ball-drops';
import { usePlinkoBoardFit } from './use-plinko-board-fit';

import { PlinkoBall } from '#ui/features/games/originals/plinko/plinko-ball/plinko-ball';
import { PlinkoLastResults } from '#ui/features/games/originals/plinko/plinko-last-results/plinko-last-results';
import { PlinkoMultiplier } from '#ui/features/games/originals/plinko/plinko-multiplier/plinko-multiplier';
import { PlinkoPin } from '#ui/features/games/originals/plinko/plinko-pin/plinko-pin';
import { cn } from '#ui/lib/cn';

function PlinkoBoardPlayfield({
  rows,
  multipliers,
  drops,
  onBallLand,
  turboMode,
  reducedMotion,
  theatreMode,
}: Pick<
  PlinkoBoardProps,
  | 'rows'
  | 'multipliers'
  | 'drops'
  | 'onBallLand'
  | 'turboMode'
  | 'reducedMotion'
  | 'theatreMode'
>) {
  const { containerRef, fitScale } = usePlinkoBoardFit(rows);
  const [dropPinHits, setDropPinHits] = useState<Record<string, string>>({});
  const [dropLands, setDropLands] = useState<Record<number, string>>({});
  const { effectiveReducedMotion, flightBalls, setBallRef } = usePlinkoBallDrops({
    drops,
    rows,
    multipliers,
    turboMode: turboMode ?? false,
    reducedMotion: reducedMotion ?? false,
    onBallLand,
    onPinHit: (hit: PlinkoPinHit) => {
      setDropPinHits((current) => ({ ...current, [hit.pinId]: hit.eventId }));
    },
    onMultiplierLand: ({ index, eventId }) => {
      setDropLands((current) => ({ ...current, [index]: eventId }));
    },
    onFeedbackReset: () => {
      setDropPinHits({});
      setDropLands({});
    },
  });
  const pins = getPlinkoPins(rows);
  const multiplierRects = getPlinkoMultiplierRects(multipliers);
  const multiplierColors = getPlinkoMultiplierColors(multipliers.length);
  const contentBounds = getPlinkoContentBounds(rows);
  const pinSize = PLINKO_LAYOUT.pinSize;
  const multiplierSize = PLINKO_LAYOUT.multiplierSize;

  return (
    <div
      ref={containerRef}
      data-slot="plinko-playfield"
      className={cn(
        'relative flex w-full flex-1 items-center justify-center overflow-hidden',
        theatreMode
          ? 'min-h-[300px] lg:h-full lg:max-h-none lg:min-h-0'
          : 'max-h-[350px] min-h-[300px] sm:max-h-none sm:min-h-[500px]',
      )}
    >
      <div
        data-slot="plinko-world"
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: PLINKO_WORLD.width,
          height: PLINKO_WORLD.height,
          transform: `translate(calc(-50% + ${(PLINKO_WORLD.width / 2 - contentBounds.centerX) * fitScale}px), calc(-50% + ${(PLINKO_WORLD.height / 2 - contentBounds.centerY) * fitScale}px)) scale(${fitScale})`,
        }}
      >
        {flightBalls.map((ball) => (
          <div
            key={ball.id}
            ref={(element) => setBallRef(ball.id, element)}
            className="pointer-events-none absolute left-0 top-0"
            style={{
              transform: `translate(${ball.startX - PLINKO_BALL_RADIUS}px, ${ball.startY - PLINKO_BALL_RADIUS}px)`,
            }}
            aria-hidden="true"
          >
            <PlinkoBall />
          </div>
        ))}

        {pins.map((pin) => (
          <div
            key={pin.id}
            className="absolute z-10"
            style={{
              left: pin.x - pinSize,
              top: pin.y - pinSize,
              width: pinSize * 2,
              height: pinSize * 2,
            }}
          >
            <PlinkoPin
              hitEventId={dropPinHits[pin.id]}
              reducedMotion={effectiveReducedMotion}
            />
          </div>
        ))}

        {multiplierRects.map((rect) => (
          <div
            key={`multiplier-${rect.index}`}
            className="absolute z-20"
            style={{
              left: rect.x - multiplierSize / 2,
              top: rect.y - 15,
              width: multiplierSize,
              height: multiplierSize,
            }}
          >
            <PlinkoMultiplier
              value={rect.value}
              color={multiplierColors[rect.index] ?? multiplierColors[0] ?? ''}
              landEventId={dropLands[rect.index]}
              reducedMotion={effectiveReducedMotion}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlinkoBoard({
  rows,
  multipliers,
  lastResults = [],
  lastResultsAriaLabel,
  resultAnnouncement,
  drops,
  onBallLand,
  turboMode = false,
  reducedMotion = false,
  theatreMode = false,
  overlay,
  className,
}: PlinkoBoardProps) {
  return (
    <div
      data-slot="plinko-board"
      className={cn(
        'bg-ds-black rounded-ds-sm relative flex w-full flex-col gap-2 pt-4 lg:flex-1',
        theatreMode && 'lg:h-full lg:min-h-0',
        className,
      )}
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </span>

      <PlinkoLastResults items={lastResults} aria-label={lastResultsAriaLabel} />

      {/* w-full wrapper: GameWinModal positions itself with absolute inset-x; a
          narrow parent would force the amount to wrap under the multiplier. */}
      <div
        className={cn(
          'relative flex w-full min-w-0 flex-1 flex-col',
          theatreMode && 'lg:min-h-0',
        )}
      >
        <PlinkoBoardPlayfield
          rows={rows}
          multipliers={multipliers}
          drops={drops}
          onBallLand={onBallLand}
          turboMode={turboMode}
          reducedMotion={reducedMotion}
          theatreMode={theatreMode}
        />
        {overlay ? (
          <div className="pointer-events-none absolute inset-0 z-30">{overlay}</div>
        ) : null}
      </div>
    </div>
  );
}

export type {
  PlinkoBallDrop,
  PlinkoBallLandEvent,
  PlinkoBoardProps,
  PlinkoResultAnnouncement,
} from './plinko-board.types';
export {
  getPlinkoMultiplierColor,
  getPlinkoMultiplierColors,
} from './plinko-board.utils';
