'use client';

import type { ComponentProps } from 'react';
import { useId } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { indicatorVariants } from './tabs.styles';
import type { TabsColor, TabsOrientation, TabsVariant } from './tabs.types';
import { TabsStyleContext } from './tabs-context';
import { useTabsIndicator } from './use-tabs-indicator';

import {
  formControlFocusRing,
  formControlFocusRingInset,
  transitionColors,
} from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { useOverflowScrollbar } from '#ui/lib/hooks/use-overflow-scrollbar';

interface TabsListProps extends Omit<
  ComponentProps<typeof TabsPrimitive.List>,
  'color' | 'orientation'
> {
  color?: TabsColor | null;
  variant?: TabsVariant;
  orientation?: TabsOrientation;
  indicator?: boolean;
  containerClassName?: string;
  scrollbarLabel?: string;
}

function TabsList({
  className,
  containerClassName,
  color = 'default',
  variant = 'bordered',
  orientation = 'horizontal',
  indicator: showIndicator = true,
  scrollbarLabel = 'Scroll tabs',
  children,
  ...props
}: TabsListProps) {
  const scrollId = useId();
  const resolvedColor = color ?? 'default';
  const glowSegmented =
    resolvedColor === 'glow' && variant === 'bordered' && orientation === 'horizontal';
  const { indicator, indicatorRef, listRef } = useTabsIndicator(showIndicator);

  const scrollbarDisabled =
    orientation === 'vertical' ||
    variant === 'game' ||
    containerClassName?.includes('overflow-visible');
  const {
    scrollRef,
    hasMeasured,
    hasOverflow,
    thumbWidth,
    setThumbNode,
    onThumbPointerDown,
    onTrackClick,
    scrollbarProps,
  } = useOverflowScrollbar({ enabled: !scrollbarDisabled });

  const {
    'aria-valuenow': ariaValueNow,
    'aria-valuemin': ariaValueMin,
    'aria-valuemax': ariaValueMax,
    ...scrollbarRest
  } = scrollbarProps;

  return (
    <TabsStyleContext.Provider value={{ color: resolvedColor, orientation, variant }}>
      <div
        data-slot="tabs-list"
        data-indicator-ready={showIndicator ? indicator.visible : undefined}
        data-indicator-color={showIndicator ? resolvedColor : undefined}
        className={cn('group relative', glowSegmented && 'inline-flex max-w-full')}
      >
        <div
          ref={scrollRef}
          id={scrollId}
          data-slot="tabs-list-viewport"
          className={cn(
            'relative flex max-w-full border p-0.5 [-webkit-overflow-scrolling:touch]',
            orientation === 'vertical'
              ? 'rounded-ds-xs h-auto touch-pan-y flex-col items-stretch'
              : cn(
                  'touch-pan-x items-center',
                  glowSegmented ? 'ds-tabs-glow-list h-[38px]' : 'rounded-ds-xs h-10',
                ),
            variant === 'filled' && 'bg-ds-surface-tertiary border-transparent',
            variant === 'bordered' &&
              cn(
                'bg-ds-black',
                glowSegmented ? 'border-ds-border-subtle' : 'border-ds-border-primary',
              ),
            variant === 'game' && 'overflow-visible border-0 bg-transparent p-0',
            scrollbarDisabled
              ? 'overflow-visible'
              : !hasMeasured || hasOverflow
                ? 'overflow-x-auto overflow-y-hidden'
                : 'overflow-visible',
            containerClassName,
          )}
        >
          <TabsPrimitive.List
            aria-orientation={orientation}
            className={cn(
              orientation === 'vertical'
                ? 'relative flex w-full flex-col items-stretch'
                : 'relative flex h-full w-full items-stretch',
              formControlFocusRingInset,
              className,
            )}
            {...props}
            ref={listRef}
          >
            {showIndicator && (
              <span
                ref={indicatorRef}
                data-slot="tabs-indicator"
                aria-hidden
                className={cn(
                  indicatorVariants({ color: resolvedColor }),
                  orientation === 'vertical' ? 'inset-x-0' : 'inset-y-0',
                  !indicator.visible && 'opacity-0',
                )}
                style={
                  orientation === 'vertical'
                    ? { top: indicator.top, height: indicator.height }
                    : { left: indicator.left, width: indicator.width }
                }
              />
            )}
            {children}
          </TabsPrimitive.List>
        </div>
        {hasOverflow && (
          // Pointer-only click-to-scroll affordance; keyboard control lives on the thumb scrollbar below.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            data-slot="tabs-scrollbar-track"
            className="absolute inset-x-px bottom-0.5 z-50 flex h-1.5 cursor-pointer items-center"
            onClick={onTrackClick}
          >
            <div className="rounded-ds-full relative h-1 w-full">
              <div
                ref={setThumbNode}
                role="scrollbar"
                aria-controls={scrollId}
                aria-label={scrollbarLabel}
                aria-valuenow={ariaValueNow}
                aria-valuemin={ariaValueMin}
                aria-valuemax={ariaValueMax}
                data-slot="tabs-scrollbar-thumb"
                className={cn(
                  'bg-ds-border-primary/50 hover:bg-ds-border-primary/80 rounded-ds-full absolute left-0 top-0 h-full cursor-grab touch-none select-none active:cursor-grabbing',
                  formControlFocusRing,
                  transitionColors,
                )}
                style={{ width: thumbWidth }}
                onPointerDown={onThumbPointerDown}
                {...scrollbarRest}
              />
            </div>
          </div>
        )}
      </div>
    </TabsStyleContext.Provider>
  );
}

export { TabsList };
export type { TabsListProps };
