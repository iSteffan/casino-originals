import type { ComponentProps } from 'react';

export function CopyIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="7"
        y="7"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 7V5.5C13 4.67157 12.3284 4 11.5 4H5.5C4.67157 4 4 4.67157 4 5.5V11.5C4 12.3284 4.67157 13 5.5 13H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
