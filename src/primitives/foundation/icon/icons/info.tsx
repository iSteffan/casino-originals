import type { ComponentProps } from 'react';

export function InfoIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle
        cx="10"
        cy="10"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
      <path
        d="M10 9.5V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
