import type { ComponentProps } from 'react';

export function HelpIcon(props: ComponentProps<'svg'>) {
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
      <path
        d="M7.75 7.75C7.75 6.645 8.645 5.75 10 5.75C11.355 5.75 12.25 6.645 12.25 7.75C12.25 8.855 11.5 9.5 10 10.25V11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="13.75" r="0.75" fill="currentColor" />
    </svg>
  );
}
