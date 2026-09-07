import type { ComponentProps } from 'react';

export function ImageIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="2"
        y="4"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6.5"
        cy="7.5"
        r="1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="2,14 6,10 9,13 12,10 18,16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
