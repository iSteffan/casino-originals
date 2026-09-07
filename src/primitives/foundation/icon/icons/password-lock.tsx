import type { ComponentProps } from 'react';

export function PasswordLockIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.6667 9.16675H3.33333C2.8731 9.16675 2.5 9.53984 2.5 10.0001V17.5001C2.5 17.9603 2.8731 18.3334 3.33333 18.3334H16.6667C17.1269 18.3334 17.5 17.9603 17.5 17.5001V10.0001C17.5 9.53984 17.1269 9.16675 16.6667 9.16675Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.83331 9.16675V5.83341C5.83331 3.53216 7.69873 1.66675 9.99998 1.66675C12.3012 1.66675 14.1666 3.53216 14.1666 5.83341V9.16675M9.99998 12.5001V15.0001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
