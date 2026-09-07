import type { ComponentProps } from 'react';

export function ClockIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12.004 6V12.005L16.2435 16.245"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
