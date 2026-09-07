import type { ComponentProps } from 'react';

export function LockIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.5 6.41699H3.5C2.85567 6.41699 2.33334 6.93933 2.33334 7.58366V11.0837C2.33334 11.728 2.85567 12.2503 3.5 12.2503H10.5C11.1443 12.2503 11.6667 11.728 11.6667 11.0837V7.58366C11.6667 6.93933 11.1443 6.41699 10.5 6.41699Z"
        stroke="currentColor"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66666 6.41667V4.08333C4.66666 3.46449 4.9125 2.871 5.35008 2.43342C5.78767 1.99583 6.38116 1.75 7 1.75C7.61884 1.75 8.21233 1.99583 8.64991 2.43342C9.0875 2.871 9.33333 3.46449 9.33333 4.08333V6.41667"
        stroke="currentColor"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
