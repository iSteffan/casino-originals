'use client';

import type { ComponentProps } from 'react';
import { useId } from 'react';

export function LiveCasinoCardsIcon(props: ComponentProps<'svg'>) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.711 1.353 11.169.024a1.56 1.56 0 0 0-1.806 1.265l-.072.405a2.52 2.52 0 0 1 2.302 2.003l.461 1.72a1.54 1.54 0 0 1 1.9.868 1.56 1.56 0 0 1 2.5 1.099c-.294 1.662-2.076 2.997-2.923 3.546l1.293 4.821c.067.252.098.513.092.773l1.086.192a1.56 1.56 0 0 0 1.806-1.265l2.168-12.291a1.56 1.56 0 0 0-1.265-1.807Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M10.464 3.999a1.558 1.558 0 0 0-1.911-1.103L1.157 4.878A1.557 1.557 0 0 0 .054 6.788l3.23 12.055a1.558 1.558 0 0 0 1.911 1.104l7.398-1.982a1.557 1.557 0 0 0 1.102-1.91L10.464 3.999Zm-5.756 8.24a.417.417 0 0 1-.119-.443l1.13-3.35a.417.417 0 0 1 .666-.178l2.654 2.335a.417.417 0 0 1 .12.444l-1.131 3.349a.417.417 0 0 1-.666.178l-2.654-2.335Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="10"
          y1="0"
          x2="10"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--ds-live-casino-cards-icon-start, currentColor)" />
          <stop
            offset="1"
            stopColor="var(--ds-live-casino-cards-icon-end, currentColor)"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
