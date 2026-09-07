'use client';

import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { formControlFocusRing, transitionColors } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const sliderTrackClassName = cn(
  'rounded-ds-xxl relative grow overflow-hidden',
  'data-[orientation=horizontal]:h-ds-2 data-[orientation=horizontal]:w-full',
  'data-[orientation=vertical]:w-ds-1-5 data-[orientation=vertical]:h-full',
);

function getSliderSegmentPercent(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function formatSliderValue(value: number, step: number) {
  return step < 1 ? value.toFixed(2) : String(value);
}

function useSliderValues({
  value,
  defaultValue,
  min,
  onValueChange,
}: {
  value?: number[];
  defaultValue?: number[];
  min: number;
  onValueChange?: (values: number[]) => void;
}) {
  const isControlled = value !== undefined;

  const [uncontrolledValues, setUncontrolledValues] = useState<number[]>(() =>
    Array.isArray(defaultValue) ? defaultValue : [min],
  );

  const values = useMemo(() => {
    if (isControlled) return Array.isArray(value) ? value : [min];
    return uncontrolledValues;
  }, [isControlled, min, uncontrolledValues, value]);

  const handleValueChange = useCallback(
    (nextValues: number[]) => {
      if (!isControlled) setUncontrolledValues(nextValues);
      onValueChange?.(nextValues);
    },
    [isControlled, onValueChange],
  );

  return { values, handleValueChange, isControlled };
}

function markSliderPointerDown(root: HTMLElement) {
  root.dataset.sliderPointerDown = '';
  root.querySelectorAll<HTMLElement>('[data-slot="slider-thumb"]').forEach((thumb) => {
    thumb.dataset.pointerFocus = '';
  });

  const markFocusedThumb = () => {
    const activeElement = root.ownerDocument.activeElement;
    root.querySelectorAll<HTMLElement>('[data-slot="slider-thumb"]').forEach((thumb) => {
      if (thumb === activeElement) thumb.dataset.pointerFocus = '';
      else delete thumb.dataset.pointerFocus;
    });
    delete root.dataset.sliderPointerDown;
  };

  const view = root.ownerDocument.defaultView;
  if (view) view.requestAnimationFrame(markFocusedThumb);
  else queueMicrotask(markFocusedThumb);
}

function SliderRoot({
  className,
  onPointerDownCapture,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      {...props}
      className={cn(
        'relative flex w-full touch-none select-none items-center data-[disabled]:opacity-60',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-[11.25rem] data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      onPointerDownCapture={(event) => {
        // Capture pointer modality before Radix chooses a thumb, then resolve
        // the actual focused thumb before the browser paints.
        markSliderPointerDown(event.currentTarget);
        onPointerDownCapture?.(event);
      }}
    />
  );
}

function SliderTrack({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Track>) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn(sliderTrackClassName, className)}
      {...props}
    />
  );
}

function SliderRange({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Range>) {
  return (
    <SliderPrimitive.Range
      data-slot="slider-range"
      className={cn('absolute h-full data-[orientation=vertical]:w-full', className)}
      {...props}
    />
  );
}

function SliderThumb({
  className,
  onKeyDown,
  onBlur,
  onFocus,
  ...props
}: ComponentProps<typeof SliderPrimitive.Thumb>) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      {...props}
      className={cn(
        'relative block',
        formControlFocusRing,
        // Higher specificity than focus-visible:ds-focus-ring. Use a direct
        // outline reset — Tailwind `outline-none` may not clear `@utility ds-focus-ring`.
        'data-[pointer-focus]:focus-visible:[outline:none]',
        className,
      )}
      onFocus={(event) => {
        const root = event.currentTarget.closest<HTMLElement>('[data-slot="slider"]');
        if (root?.dataset.sliderPointerDown !== undefined) {
          event.currentTarget.dataset.pointerFocus = '';
        } else delete event.currentTarget.dataset.pointerFocus;
        onFocus?.(event);
      }}
      onKeyDown={(event) => {
        delete event.currentTarget.dataset.pointerFocus;
        onKeyDown?.(event);
      }}
      onBlur={(event) => {
        delete event.currentTarget.dataset.pointerFocus;
        onBlur?.(event);
      }}
    />
  );
}

function SliderThumbValueTooltip({
  value,
  step,
  valueLabelClassName,
}: {
  value: number;
  step: number;
  valueLabelClassName?: string;
}) {
  return (
    <div
      className={cn(
        '-top-ds-10 absolute left-1/2 flex -translate-x-1/2 flex-col items-center',
        valueLabelClassName,
      )}
    >
      <div className="text-ds-text-tertiary rounded-ds-xxs bg-ds-brand-white px-ds-2 py-ds-0-5 text-ds-sm shadow">
        {formatSliderValue(value, step)}
      </div>
      <div className="border-t-ds-brand-white h-0 w-0 border-x-8 border-t-8 border-x-transparent" />
    </div>
  );
}

interface SliderProps extends ComponentProps<typeof SliderPrimitive.Root> {
  showMinMaxLabels?: boolean;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  thumbAriaLabel?: string;
  showValueLabel?: boolean;
  valueLabelClassName?: string;
}

function Slider({
  className,
  defaultValue,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showMinMaxLabels = false,
  trackClassName,
  rangeClassName,
  thumbClassName,
  thumbAriaLabel,
  showValueLabel,
  valueLabelClassName,
  ...props
}: SliderProps) {
  const { values, handleValueChange, isControlled } = useSliderValues({
    value,
    defaultValue,
    min,
    onValueChange,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="gap-ds-1 flex w-full items-center">
      {showMinMaxLabels && (
        <Typography kind="secondary-14-400" as="span" className="min-w-ds-6 text-left">
          {min}
        </Typography>
      )}

      <SliderRoot
        defaultValue={isControlled ? undefined : (defaultValue ?? [min])}
        value={isControlled ? value : undefined}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        className={className}
        {...props}
      >
        <SliderTrack className={cn('bg-ds-surface-tertiary', trackClassName)}>
          <SliderRange className={cn('bg-ds-brand-primary', rangeClassName)} />
        </SliderTrack>

        {values.map((val, index) => (
          <SliderThumb
            key={index}
            aria-label={thumbAriaLabel}
            onPointerDown={() => setActiveIndex(index)}
            onPointerUp={() => setActiveIndex(null)}
            onBlur={() => setActiveIndex(null)}
            className={cn(
              'bg-ds-brand-primary size-ds-4 rounded-ds-xxl border-ds-brand-white shadow-ds-sm shrink-0 border-[3px]',
              transitionColors,
              'hover:ds-focus-ring disabled:pointer-events-none disabled:opacity-60',
              thumbClassName,
            )}
          >
            {showValueLabel && activeIndex === index && (
              <SliderThumbValueTooltip
                value={val}
                step={step}
                valueLabelClassName={valueLabelClassName}
              />
            )}
          </SliderThumb>
        ))}
      </SliderRoot>

      {showMinMaxLabels && (
        <Typography kind="secondary-14-400" as="span" className="min-w-ds-6 text-right">
          {max}
        </Typography>
      )}
    </div>
  );
}

export {
  formatSliderValue,
  getSliderSegmentPercent,
  Slider,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useSliderValues,
};
export type { SliderProps };
