'use client';

import type { ReactNode } from 'react';

import type { OriginalsConfigMode } from './originals-config.types';

import { cn } from '#ui/lib/cn';

interface OriginalsConfigModeStackProps {
  mode: OriginalsConfigMode;
  manual: ReactNode;
  auto: ReactNode;
  className?: string;
  /**
   * When true (default), inactive panel stays in layout on `lg+` via `invisible` so form
   * height matches max(manual, auto). On mobile, inactive panel always uses `hidden`.
   * Set false in theatre mode so inactive panel is `hidden` at every breakpoint.
   */
  reserveInactiveHeight?: boolean;
}

function getInactivePanelClassName(isInactive: boolean, reserveInactiveHeight: boolean) {
  if (!isInactive) return undefined;

  if (!reserveInactiveHeight) {
    return 'hidden';
  }

  return 'pointer-events-none max-lg:hidden lg:invisible';
}

/**
 * Renders manual and auto panels in the same grid cell so layout height follows
 * max(manual, auto) content while only the active tab is visible and interactive.
 */
export function OriginalsConfigModeStack({
  mode,
  manual,
  auto,
  className,
  reserveInactiveHeight = true,
}: OriginalsConfigModeStackProps) {
  const isManual = mode === 'manual';
  // Auto-only stacks (manual={null}) collapse on mobile manual tab so flex gap
  // does not reserve space for an empty grid cell.
  const hideOnMobileManual = isManual && manual == null;

  return (
    <div
      className={cn(
        'grid w-full [&>*]:col-start-1 [&>*]:row-start-1',
        hideOnMobileManual && 'max-lg:hidden',
        className,
      )}
    >
      <div
        className={cn(
          'h-full w-full min-w-0',
          getInactivePanelClassName(!isManual, reserveInactiveHeight),
        )}
        aria-hidden={!isManual}
        inert={!isManual}
      >
        {manual}
      </div>
      <div
        className={cn(
          'h-full w-full min-w-0',
          getInactivePanelClassName(isManual, reserveInactiveHeight),
        )}
        aria-hidden={isManual}
        inert={isManual}
      >
        {auto}
      </div>
    </div>
  );
}
