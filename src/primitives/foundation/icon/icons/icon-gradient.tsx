'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';

/** Vertical one-color gradient used by catalog/sidebar filter-style icons. */
export function useIconGradientFill(): { fill: string; defs: ReactNode } {
  const gradientId = useId().replace(/:/g, '');

  return {
    fill: `url(#${gradientId})`,
    defs: (
      <defs>
        <linearGradient
          id={gradientId}
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop stopColor="var(--ds-gradient-icon-start, currentColor)" />
          <stop offset="1" stopColor="var(--ds-gradient-icon-end, currentColor)" />
        </linearGradient>
      </defs>
    ),
  };
}

export type IconSvgProps = ComponentProps<'svg'>;
