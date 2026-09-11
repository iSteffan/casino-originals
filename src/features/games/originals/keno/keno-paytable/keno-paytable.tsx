'use client';

import { type CSSProperties, useEffect, useState } from 'react';

import type { KenoPaytableItem, KenoPaytableProps } from './keno-paytable.types';
import { getKenoPaytableReachedIndex } from './keno-paytable.utils';

import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function KenoPaytable({
  items,
  reachedHits = null,
  empty = false,
  emptyLabel,
  hitsIconSrc,
  theatreMode = false,
  reducedMotion = false,
  className,
  'aria-label': ariaLabel,
  getItemAriaLabel,
}: KenoPaytableProps) {
  const [lastNonEmptyState, setLastNonEmptyState] = useState({
    items,
    reachedHits,
  });

  useEffect(() => {
    if (empty) return;

    setLastNonEmptyState({
      items,
      reachedHits,
    });
  }, [empty, items, reachedHits]);

  const visibleItems = empty ? lastNonEmptyState.items : items;
  const visibleReachedHits = empty ? lastNonEmptyState.reachedHits : reachedHits;
  const reachedIndex = getKenoPaytableReachedIndex(visibleItems, visibleReachedHits);
  const hitsIconStyle = {
    '--ds-keno-paytable-hits-icon': `url("${hitsIconSrc}")`,
  } as CSSProperties;

  const opacityTransition = reducedMotion
    ? null
    : 'duration-ds-slower ease-ds-standard transition-opacity motion-reduce:transition-none';
  const colorTransition = reducedMotion
    ? null
    : 'duration-ds-slow ease-ds-standard transition-colors motion-reduce:transition-none';

  return (
    <div
      className={cn(
        'ds-keno-paytable relative w-full shrink-0',
        theatreMode && 'ds-keno-paytable-theatre',
        className,
      )}
    >
      <div
        aria-hidden={!empty}
        className={cn(
          'bg-ds-gray-900 rounded-ds-xs absolute inset-0 flex items-center justify-center',
          opacityTransition,
          empty ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <Typography as="p" kind="white-12-400" align="center" className="m-0">
          {emptyLabel}
        </Typography>
      </div>

      <div
        role="list"
        aria-label={ariaLabel}
        aria-hidden={empty || undefined}
        className={cn(
          'absolute inset-0 grid w-full gap-px sm:gap-1 md:gap-1.5',
          opacityTransition,
          empty ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        style={
          visibleItems.length > 0
            ? { gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {visibleItems.map((item, index) => {
          const reached = reachedIndex >= 0 && index <= reachedIndex;

          return (
            <KenoPaytableStep
              key={`${item.hits}-${item.multiplierLabel}`}
              item={item}
              reached={reached}
              hitsIconStyle={hitsIconStyle}
              colorTransition={colorTransition}
              ariaLabel={getItemAriaLabel(item, reached)}
            />
          );
        })}
      </div>
    </div>
  );
}

function KenoPaytableStep({
  item,
  reached,
  hitsIconStyle,
  colorTransition,
  ariaLabel,
}: {
  item: KenoPaytableItem;
  reached: boolean;
  hitsIconStyle: CSSProperties;
  colorTransition: string | null;
  ariaLabel: string;
}) {
  return (
    <div
      role="listitem"
      aria-label={ariaLabel}
      className={cn(
        'rounded-ds-xs flex min-w-0 flex-col items-center justify-center gap-px',
        reached ? 'bg-ds-gray-800' : 'bg-ds-gray-900',
        colorTransition,
      )}
    >
      <div className="flex items-center justify-center gap-px">
        <span
          className={cn(
            'ds-keno-paytable-label font-ds-medium',
            reached ? 'text-ds-text-brand-primary' : 'text-ds-gray-600',
            colorTransition,
          )}
        >
          {item.hits}
        </span>
        <span
          aria-hidden
          style={hitsIconStyle}
          className={cn(
            'ds-keno-paytable-hits-icon',
            reached ? 'text-ds-text-brand-primary' : 'text-ds-gray-550',
            colorTransition,
          )}
        />
      </div>
      <span className="ds-keno-paytable-label text-ds-text-white font-ds-bold">
        x{item.multiplierLabel}
      </span>
    </div>
  );
}

export type { KenoPaytableProps } from './keno-paytable.types';
