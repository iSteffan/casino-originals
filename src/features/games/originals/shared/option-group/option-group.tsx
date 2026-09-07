'use client';

import { type KeyboardEvent, useId, useRef } from 'react';

import {
  findGridEnabledOptionIndex,
  findNextEnabledOptionIndex,
  getEnabledOptionIndices,
  getRovingTabIndex,
} from './option-group.keyboard.utils';
import type { OptionGroupProps } from './option-group.types';
import { OPTION_GROUP_ROW_MAX, resolveOptionGroupLayout } from './option-group.utils';
import { OptionGroupItem } from './option-group-item';

import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function OptionGroup<T extends string | number = string>({
  label,
  value,
  onChange,
  options,
  disabled = false,
  layout = 'auto',
  autoRowMax = 4,
  rowMax,
  columns = 3,
  truncateLabel = false,
  emphasizeActive = false,
  className,
  'aria-label': ariaLabel,
}: OptionGroupProps<T>) {
  const labelId = useId();
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const resolvedLayout = resolveOptionGroupLayout(
    layout,
    options.length,
    autoRowMax,
    rowMax ?? OPTION_GROUP_ROW_MAX,
  );
  const focusableIndex = getRovingTabIndex(options, value, disabled);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option || disabled || option.disabled || option.value === value) return;

    onChange(option.value);
  };

  const focusOption = (index: number) => {
    itemRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabledIndices = getEnabledOptionIndices(options, disabled);
    if (enabledIndices.length === 0) return;

    let currentIndex = itemRefs.current.findIndex(
      (element) => element === document.activeElement,
    );
    if (currentIndex < 0) {
      currentIndex = focusableIndex;
    }

    let nextIndex: number | null = null;

    switch (event.key) {
      case 'Home':
        nextIndex = enabledIndices[0];
        break;
      case 'End':
        nextIndex = enabledIndices[enabledIndices.length - 1];
        break;
      case 'ArrowRight':
        if (resolvedLayout === 'grid') {
          nextIndex = findGridEnabledOptionIndex(
            options,
            disabled,
            currentIndex,
            columns,
            'right',
          );
        } else {
          nextIndex = findNextEnabledOptionIndex(enabledIndices, currentIndex, 1);
        }
        break;
      case 'ArrowLeft':
        if (resolvedLayout === 'grid') {
          nextIndex = findGridEnabledOptionIndex(
            options,
            disabled,
            currentIndex,
            columns,
            'left',
          );
        } else {
          nextIndex = findNextEnabledOptionIndex(enabledIndices, currentIndex, -1);
        }
        break;
      case 'ArrowDown':
        if (resolvedLayout === 'grid') {
          nextIndex = findGridEnabledOptionIndex(
            options,
            disabled,
            currentIndex,
            columns,
            'down',
          );
        } else {
          nextIndex = findNextEnabledOptionIndex(enabledIndices, currentIndex, 1);
        }
        break;
      case 'ArrowUp':
        if (resolvedLayout === 'grid') {
          nextIndex = findGridEnabledOptionIndex(
            options,
            disabled,
            currentIndex,
            columns,
            'up',
          );
        } else {
          nextIndex = findNextEnabledOptionIndex(enabledIndices, currentIndex, -1);
        }
        break;
      default:
        return;
    }

    if (nextIndex === null || nextIndex < 0 || nextIndex === currentIndex) return;

    event.preventDefault();
    onChange(options[nextIndex].value);
    focusOption(nextIndex);
  };

  return (
    <div className={cn('flex w-full flex-col items-start justify-start', className)}>
      <Typography kind="white-12-700" as="span" id={labelId} className="mb-ds-1 block">
        {label}
      </Typography>

      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelId}
        className={cn(
          'gap-ds-1 w-full',
          resolvedLayout === 'grid' && 'grid',
          resolvedLayout === 'row' && 'flex flex-row items-center',
          resolvedLayout === 'column' && 'flex flex-col',
        )}
        style={
          resolvedLayout === 'grid'
            ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const isStacked = Boolean(option.adornment);
          const isOptionDisabled = disabled || option.disabled;

          const itemClassName = cn(
            resolvedLayout === 'grid' && 'w-full min-w-0',
            resolvedLayout === 'column' && (isStacked ? 'w-full' : 'w-full min-w-0'),
            resolvedLayout === 'row' &&
              (emphasizeActive
                ? isSelected
                  ? 'min-w-0 flex-[2]'
                  : 'min-w-0 flex-1'
                : 'min-w-0 flex-1'),
          );

          return (
            <OptionGroupItem
              key={String(option.value)}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              selected={isSelected}
              disabled={isOptionDisabled}
              stacked={isStacked}
              className={itemClassName}
              label={option.label}
              ariaLabel={option.ariaLabel}
              adornment={option.adornment?.(isSelected)}
              truncateLabel={truncateLabel}
              tabIndex={index === focusableIndex ? 0 : -1}
              onKeyDown={handleKeyDown}
              onClick={() => {
                selectOption(index);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export type {
  OptionGroupLayout,
  OptionGroupOption,
  OptionGroupProps,
} from './option-group.types';
