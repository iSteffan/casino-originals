import type { ComponentProps } from 'react';

export function UserIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle
        cx="10"
        cy="7"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.5 17C3.5 13.962 6.462 11.5 10 11.5C13.538 11.5 16.5 13.962 16.5 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
