'use client';

import { useCallback, useRef } from 'react';

import { RouletteCell } from '../roulette-cell/roulette-cell';
import {
  ROULETTE_DESKTOP_FIELD_HEIGHT,
  ROULETTE_DESKTOP_FIELD_WIDTH,
  ROULETTE_RANGE_MAP,
  ROULETTE_ROW_1,
  ROULETTE_ROW_2,
  ROULETTE_ROW_3,
  getRouletteNumberColor,
} from '../roulette.constants';
import type { RouletteFieldProps } from './roulette-field.types';
import { getRouletteFieldStraightId } from './roulette-field.utils';
import { useRouletteFieldFitScale } from './use-roulette-field-fit-scale';

import { cn } from '#ui/lib/cn';

export function RouletteField({
  assets,
  bets = {},
  highlightedNumbers = [],
  winningNumber = null,
  disabled = false,
  compact = false,
  onCellClick,
  onHoverNumbersChange,
  className,
  'aria-label': ariaLabel = 'Roulette betting field',
}: RouletteFieldProps) {
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const fitScale = useRouletteFieldFitScale(desktopContainerRef, true);
  // Betstrike also dropped scale further when chat/sidebar was open; keep a little
  // breathing room once the grid already fits, without causing overflow.
  const desktopScale = compact ? Math.min(fitScale, 0.95) : fitScale;
  const highlighted = new Set(highlightedNumbers);

  const chipsFor = useCallback(
    (cellId: string) => bets[cellId]?.chips ?? [],
    [bets],
  );

  const hoverGroup = useCallback(
    (groupId: string | null) => {
      if (!onHoverNumbersChange) return;
      if (!groupId) {
        onHoverNumbersChange([]);
        return;
      }
      onHoverNumbersChange(ROULETTE_RANGE_MAP[groupId] ?? []);
    },
    [onHoverNumbersChange],
  );

  const hoverStraight = useCallback(
    (n: number | null) => {
      if (!onHoverNumbersChange) return;
      onHoverNumbersChange(n === null ? [] : [n]);
    },
    [onHoverNumbersChange],
  );

  const renderStraight = (n: number) => {
    const cellId = getRouletteFieldStraightId(n);
    return (
      <RouletteCell
        key={cellId}
        label={String(n)}
        color={getRouletteNumberColor(n)}
        size="sm"
        assets={assets}
        highlighted={highlighted.has(n)}
        winning={winningNumber === n}
        disabled={disabled}
        chips={chipsFor(cellId)}
        aria-label={`Number ${n}`}
        onClick={onCellClick ? () => onCellClick(cellId) : undefined}
        onHoverChange={(hovered) => hoverStraight(hovered ? n : null)}
      />
    );
  };

  const renderTwoToOne = (rowId: 'Row1' | 'Row2' | 'Row3') => (
    <RouletteCell
      label="2:1"
      color="black"
      size="sm"
      assets={assets}
      disabled={disabled}
      chips={chipsFor(rowId)}
      aria-label={`Column ${rowId} pays 2 to 1`}
      onClick={onCellClick ? () => onCellClick(rowId) : undefined}
      onHoverChange={(hovered) => hoverGroup(hovered ? rowId : null)}
    />
  );

  const renderOutside = (
    cellId: string,
    label: string,
    size: 'sm' | 'md' | 'lg',
    options?: { rotateLabel?: boolean; color?: 'red' | 'black' },
  ) => (
    <RouletteCell
      key={cellId}
      label={label}
      color={options?.color ?? (cellId === 'Red' ? 'red' : 'black')}
      size={size}
      assets={assets}
      disabled={disabled}
      rotateLabel={options?.rotateLabel}
      chips={chipsFor(cellId)}
      aria-label={label}
      onClick={onCellClick ? () => onCellClick(cellId) : undefined}
      onHoverChange={(hovered) => hoverGroup(hovered ? cellId : null)}
    />
  );

  const desktopGrid = (
    <div className="text-[20px] leading-[1.4] text-ds-white">
      <div className="grid grid-cols-[repeat(14,54px)] grid-rows-[repeat(3,54px)] gap-[4px]">
        <div className="row-span-3">{renderStraight(0)}</div>
        {ROULETTE_ROW_1.map(renderStraight)}
        {renderTwoToOne('Row1')}
        {ROULETTE_ROW_2.map(renderStraight)}
        {renderTwoToOne('Row2')}
        {ROULETTE_ROW_3.map(renderStraight)}
        {renderTwoToOne('Row3')}
      </div>

      <div className="mt-[4px] grid grid-cols-[54px_1fr_54px] gap-[4px]">
        <div className="bg-transparent" />
        <div className="grid grid-cols-3 gap-[4px]">
          {(['1-12', '13-24', '25-36'] as const).map((key) => (
            <div key={key} className="h-[54px] w-full">
              {renderOutside(key, key, 'lg')}
            </div>
          ))}
        </div>
        <div className="bg-transparent" />
      </div>

      <div className="mt-[4px] grid grid-cols-[54px_1fr_54px] gap-[4px]">
        <div className="bg-transparent" />
        <div className="grid grid-cols-6 gap-[4px]">
          {(
            [
              ['1-18', '1-18'],
              ['Even', 'Even'],
              ['Red', 'Red'],
              ['Black', 'Black'],
              ['Odd', 'Odd'],
              ['19-36', '19-36'],
            ] as const
          ).map(([id, label]) => (
            <div key={id} className="h-[54px] w-full">
              {renderOutside(id, label, 'md', {
                color: id === 'Red' ? 'red' : 'black',
              })}
            </div>
          ))}
        </div>
        <div className="bg-transparent" />
      </div>
    </div>
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('w-full min-w-0 text-ds-white', className)}
    >
      {/* Mobile — unchanged stacked layout */}
      <div className="flex w-fit flex-row-reverse md:hidden">
        <div className="grid w-fit grid-cols-[repeat(3,60px)] gap-[4px]">
          <div className="col-span-3">{renderStraight(0)}</div>
          {(
            [
              { row: ROULETTE_ROW_3, label: 'Row3' as const },
              { row: ROULETTE_ROW_2, label: 'Row2' as const },
              { row: ROULETTE_ROW_1, label: 'Row1' as const },
            ] as const
          ).map(({ row, label }) => (
            <div key={label} className="flex flex-col gap-[4px]">
              {row.map(renderStraight)}
              {renderTwoToOne(label)}
            </div>
          ))}
        </div>

        <div className="mr-[4px] grid w-fit grid-rows-[30px_1fr_1fr_1fr_30px] gap-[4px]">
          <div className="pointer-events-none h-[30px] w-[60px] bg-transparent" />
          {(['1-12', '13-24', '25-36'] as const).map((key) => (
            <div key={key} className="h-full w-[60px]">
              {renderOutside(key, key, 'lg', { rotateLabel: true })}
            </div>
          ))}
          <div className="pointer-events-none h-[30px] w-[60px] bg-transparent" />
        </div>

        <div className="mr-[4px] grid w-fit grid-rows-[30px_repeat(6,_1fr)_30px] gap-[4px]">
          <div className="pointer-events-none h-[30px] w-[60px] bg-transparent" />
          {(
            [
              ['1-18', '1-18'],
              ['Even', 'Even'],
              ['Red', 'Red'],
              ['Black', 'Black'],
              ['Odd', 'Odd'],
              ['19-36', '19-36'],
            ] as const
          ).map(([id, label]) => (
            <div key={id} className="h-full w-[60px]">
              {renderOutside(id, label, 'md', {
                rotateLabel: true,
                color: id === 'Red' ? 'red' : 'black',
              })}
            </div>
          ))}
          <div className="pointer-events-none h-[30px] w-[60px] bg-transparent" />
        </div>
      </div>

      {/* Desktop — fixed grid scaled to the board column (sidebar-aware via container width). */}
      <div ref={desktopContainerRef} className="hidden w-full min-w-0 md:block">
        <div
          className="relative mx-auto overflow-clip"
          style={{
            width: ROULETTE_DESKTOP_FIELD_WIDTH * desktopScale,
            height: ROULETTE_DESKTOP_FIELD_HEIGHT * desktopScale,
          }}
        >
          <div
            className="absolute top-0 left-1/2 origin-top"
            style={{
              width: ROULETTE_DESKTOP_FIELD_WIDTH,
              transform: `translateX(-50%) scale(${desktopScale})`,
            }}
          >
            {desktopGrid}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { RouletteFieldProps } from './roulette-field.types';
