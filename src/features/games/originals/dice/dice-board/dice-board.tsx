'use client';

import type { DiceBoardProps } from './dice-board.types';
import { DiceBoardRolledNumber } from './dice-board-rolled-number';

import { DiceCube } from '#ui/features/games/originals/dice/dice-cube/dice-cube';
import { DiceLastResults } from '#ui/features/games/originals/dice/dice-last-results/dice-last-results';
import { DiceSlider } from '#ui/features/games/originals/dice/dice-slider/dice-slider';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const DICE_SLIDER_MIN = 3;
const DICE_SLIDER_MAX = 97;

export function DiceBoard({
  displayValue,
  rolledNumber,
  markerValue,
  markerState = 'play',
  isAnimating = false,
  animationDirection = 'right',
  reducedMotion = false,
  labels,
  lastResults = [],
  lastResultsAssets,
  lastResultsLabels,
  lastResultsAriaLabel,
  resultAnnouncement,
  sliderValue,
  onSliderValueChange,
  sliderDisabled = false,
  direction = 'UNDER',
  showSliderValueLabel = true,
  locale = 'en-US',
  theatreMode = false,
  overlay,
  className,
}: DiceBoardProps) {
  return (
    <div
      className={cn(
        'dice-board-shell rounded-ds-sm relative flex w-full min-w-0 flex-col pt-3',
        theatreMode && 'lg:h-full lg:min-h-0 lg:pt-4',
        className,
      )}
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </span>

      <DiceLastResults
        items={lastResults}
        assets={lastResultsAssets}
        labels={lastResultsLabels}
        aria-label={lastResultsAriaLabel}
      />

      <div
        className={cn(
          'dice-board-play-area relative mx-auto w-full overflow-visible pb-4',
          theatreMode
            ? 'h-[258px] max-w-[400px] sm:h-[320px] sm:max-w-[500px] lg:h-full lg:max-h-[600px] lg:max-w-[min(90vw,900px)]'
            : 'h-[258px] max-w-[400px] sm:h-[320px] sm:max-w-[500px] lg:h-[400px] lg:max-w-[600px]',
        )}
      >
        {markerValue !== null ? (
          <DiceCube
            markerValue={markerValue}
            markerState={markerState}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
            reducedMotion={reducedMotion}
          />
        ) : null}

        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 justify-center gap-[28px] sm:gap-[70px]">
          <div className="relative h-[50px] w-[110px] sm:h-[58px] sm:w-[170px]">
            <p className="dice-board-value-size dice-board-value-text absolute left-1/2 top-[-10px] -translate-x-1/2 sm:top-[-14px]">
              {displayValue.toFixed(2)}
            </p>
            <Typography
              kind="tertiary-12-400"
              as="p"
              align="center"
              className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              {labels.yourNumber}
            </Typography>
          </div>

          <div className="relative h-[50px] w-[110px] sm:h-[58px] sm:w-[170px]">
            <DiceBoardRolledNumber
              value={rolledNumber}
              markerState={markerState}
              locale={locale}
              reducedMotion={reducedMotion}
            />
            <Typography
              kind="tertiary-12-400"
              as="p"
              align="center"
              className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              {labels.rolledNumber}
            </Typography>
          </div>
        </div>
      </div>

      <div className="relative pb-4 pt-3">
        <div
          className={cn(
            'bg-ds-black relative mx-auto overflow-visible',
            theatreMode
              ? 'lg:max-w-[min(90vw,900px)]'
              : 'max-w-[400px] sm:max-w-[500px] lg:max-w-[600px]',
          )}
        >
          <DiceSlider
            direction={direction}
            className="w-full"
            showValueLabel={showSliderValueLabel}
            min={DICE_SLIDER_MIN}
            max={DICE_SLIDER_MAX}
            step={0.01}
            value={[sliderValue]}
            onValueChange={(values) => onSliderValueChange?.(values[0])}
            disabled={sliderDisabled}
            aria-label={labels.sliderAriaLabel}
          />
        </div>
        {overlay}
      </div>
    </div>
  );
}

export type {
  DiceBoardDirection,
  DiceBoardLabels,
  DiceBoardProps,
  DiceDirection,
  DiceResultAnnouncement,
} from './dice-board.types';
