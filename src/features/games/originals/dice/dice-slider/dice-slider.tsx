'use client';

import type { DiceSliderProps } from './dice-slider.types';

import { cn } from '#ui/lib/cn';
import {
  formatSliderValue,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useSliderValues,
} from '#ui/primitives/controls/slider/slider';
import { Image } from '#ui/primitives/data-display/image/image';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const DICE_THUMB_SRC = '/img/games/dice/dice-thumb.svg';

export function DiceSlider({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 3,
  max = 97,
  step = 0.01,
  direction = 'UNDER',
  showValueLabel = false,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  style,
  className,
}: DiceSliderProps) {
  const { values, handleValueChange, isControlled } = useSliderValues({
    value,
    defaultValue,
    min,
    onValueChange,
  });

  return (
    <SliderRoot
      data-direction={direction}
      defaultValue={isControlled ? undefined : (defaultValue ?? [min])}
      value={isControlled ? value : undefined}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={handleValueChange}
      onValueCommit={onValueCommit}
      style={style}
      className={cn(
        'ds-dice-slider min-w-0 flex-1 data-[disabled]:opacity-100',
        className,
      )}
    >
      <SliderTrack className="ds-dice-slider-track data-[orientation=horizontal]:h-1">
        <SliderRange className="ds-dice-slider-range" />
      </SliderTrack>

      {values.map((val, index) => (
        <SliderThumb
          key={index}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className="rounded-ds-full relative flex h-4 w-9 cursor-pointer items-center justify-center"
        >
          <Image
            src={DICE_THUMB_SRC}
            alt=""
            width={36}
            height={15}
            wrapperClassName="pointer-events-none h-[15px] w-9 shrink-0"
            className="size-full object-contain"
            showSkeleton={false}
            aria-hidden
          />
          {showValueLabel ? (
            <Typography
              kind="white-10-700"
              as="span"
              className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 tabular-nums"
            >
              {formatSliderValue(val, step)}
            </Typography>
          ) : null}
        </SliderThumb>
      ))}
    </SliderRoot>
  );
}

export type { DiceSliderProps } from './dice-slider.types';
