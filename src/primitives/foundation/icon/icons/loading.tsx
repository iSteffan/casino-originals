'use client';

import type { ComponentProps } from 'react';
import { useId } from 'react';

export function LoadingIcon(props: ComponentProps<'svg'>) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle
        cx="10"
        cy="10"
        r="6.25"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2.5"
      />
      <path
        d="M10 3.75C10.8208 3.75 11.6335 3.91167 12.3918 4.22575C13.15 4.53984 13.839 5.00022 14.4194 5.58058C14.9998 6.16095 15.4602 6.84994 15.7742 7.60823C16.0883 8.36651 16.25 9.17924 16.25 10"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <radialGradient
          id={gradientId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(17.5 10) rotate(-135) scale(10.6066)"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
