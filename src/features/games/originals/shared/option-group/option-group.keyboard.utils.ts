import type { OptionGroupOption } from './option-group.types';

function isOptionGroupItemEnabled<T extends string | number>(
  option: OptionGroupOption<T>,
  groupDisabled: boolean,
): boolean {
  return !groupDisabled && !option.disabled;
}

export function getEnabledOptionIndices<T extends string | number>(
  options: OptionGroupOption<T>[],
  groupDisabled: boolean,
): number[] {
  return options.flatMap((option, index) =>
    isOptionGroupItemEnabled(option, groupDisabled) ? [index] : [],
  );
}

export function getRovingTabIndex<T extends string | number>(
  options: OptionGroupOption<T>[],
  value: T,
  groupDisabled: boolean,
): number {
  const enabledIndices = getEnabledOptionIndices(options, groupDisabled);
  if (enabledIndices.length === 0) return -1;

  const selectedIndex = options.findIndex((option) => option.value === value);
  if (
    selectedIndex >= 0 &&
    isOptionGroupItemEnabled(options[selectedIndex], groupDisabled)
  ) {
    return selectedIndex;
  }

  return enabledIndices[0];
}

export function findNextEnabledOptionIndex(
  enabledIndices: number[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (enabledIndices.length === 0) return currentIndex;
  if (enabledIndices.length === 1) return enabledIndices[0];

  const currentPosition = enabledIndices.indexOf(currentIndex);
  const startPosition = currentPosition >= 0 ? currentPosition : 0;
  const nextPosition =
    (startPosition + direction + enabledIndices.length) % enabledIndices.length;

  return enabledIndices[nextPosition];
}

function getGridAdjacentIndex(
  index: number,
  optionCount: number,
  columns: number,
  direction: 'left' | 'right' | 'up' | 'down',
): number | null {
  const row = Math.floor(index / columns);
  const column = index % columns;

  switch (direction) {
    case 'left':
      if (column === 0) return null;
      return index - 1;
    case 'right':
      if (column === columns - 1 || index + 1 >= optionCount) return null;
      return index + 1;
    case 'up':
      if (row === 0) return null;
      return index - columns;
    case 'down': {
      const nextIndex = index + columns;
      if (nextIndex >= optionCount) return null;
      return nextIndex;
    }
    default:
      return null;
  }
}

export function findGridEnabledOptionIndex<T extends string | number>(
  options: OptionGroupOption<T>[],
  groupDisabled: boolean,
  startIndex: number,
  columns: number,
  direction: 'left' | 'right' | 'up' | 'down',
): number | null {
  let index = startIndex;

  for (let step = 0; step < options.length; step += 1) {
    const nextIndex = getGridAdjacentIndex(index, options.length, columns, direction);
    if (nextIndex === null) return null;
    if (isOptionGroupItemEnabled(options[nextIndex], groupDisabled)) {
      return nextIndex;
    }
    index = nextIndex;
  }

  return null;
}
