import type { ComponentProps } from 'react';

export function WarningIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 2.5L17.5 16.5H2.5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.5V11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14" r="0.75" fill="currentColor" />
    </svg>
  );
}
