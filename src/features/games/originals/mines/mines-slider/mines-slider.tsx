'use client';

import type { CSSProperties, ReactNode } from 'react';

import { cn } from '#ui/lib/cn';
import {
  getSliderSegmentPercent,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useSliderValues,
} from '#ui/primitives/controls/slider/slider';

interface MinesSliderAssets {
  thumb: string;
  safe: string;
  mine: string;
}

interface MinesSliderBaseProps {
  /** Semantic mine count (`min`…`max`); the track is natively inverted toward the mine indicator. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (values: number[]) => void;
  assets: MinesSliderAssets;
  min: number;
  max: number;
  step?: number;
  totalCells: number;
  showIndicators?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

type MinesSliderProps = MinesSliderBaseProps;

function MinesSliderIndicator({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} data-slot="mines-slider-indicator">
      {children}
    </div>
  );
}

export function MinesSlider({
  value,
  defaultValue,
  onValueChange,
  assets,
  min,
  max,
  step = 1,
  totalCells,
  showIndicators = true,
  disabled = false,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: MinesSliderProps) {
  const { values, handleValueChange, isControlled } = useSliderValues({
    value,
    defaultValue,
    min,
    onValueChange,
  });

  const sliderValue = values[0] ?? min;
  const displayedSafe = totalCells - sliderValue;

  const minesPercent = getSliderSegmentPercent(sliderValue, min, max);
  const segmentPercentStyle = {
    '--slider-segment-percent': `${100 - minesPercent}%`,
  } as CSSProperties;

  return (
    <div
      className={cn(
        'gap-ds-1 flex w-full items-center',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      {showIndicators ? (
        <MinesSliderIndicator className="ds-mines-slider-indicator">
          <img src={assets.safe} width={16} height={16} alt="" aria-hidden />
          <span className="ds-mines-slider-value">{displayedSafe}</span>
        </MinesSliderIndicator>
      ) : null}

      <SliderRoot
        defaultValue={isControlled ? undefined : (defaultValue ?? [min])}
        value={isControlled ? value : undefined}
        min={min}
        max={max}
        step={step}
        inverted
        onValueChange={handleValueChange}
        disabled={disabled}
        className={cn('min-w-0 flex-1 data-[disabled]:opacity-100', className)}
        style={style}
      >
        <SliderTrack className="ds-mines-slider-track">
          <div
            aria-hidden
            className="ds-mines-slider-unfilled"
            style={segmentPercentStyle}
          />
          <SliderRange className="ds-mines-slider-range" />
        </SliderTrack>

        {values.map((value, index) => (
          <SliderThumb
            key={index}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-valuenow={value}
            className="rounded-ds-full relative flex h-4 w-5 cursor-pointer items-center justify-center"
          >
            <img src={assets.thumb} width={20} height={16} alt="" aria-hidden />
          </SliderThumb>
        ))}
      </SliderRoot>

      {showIndicators ? (
        <MinesSliderIndicator className="ds-mines-slider-indicator">
          <span className="ds-mines-slider-value">{sliderValue}</span>
          <img src={assets.mine} width={16} height={16} alt="" aria-hidden />
        </MinesSliderIndicator>
      ) : null}
    </div>
  );
}

export type { MinesSliderAssets, MinesSliderProps };
