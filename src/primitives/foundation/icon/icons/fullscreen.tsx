import type { ComponentProps } from 'react';

export function FullscreenIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0.625 3.95833V1.95833C0.625 1.60471 0.765476 1.26557 1.01552 1.01552C1.26557 0.765476 1.60471 0.625 1.95833 0.625H3.95833M11.2917 7.95833V9.95833C11.2917 10.312 11.1512 10.6511 10.9011 10.9011C10.6511 11.1512 10.312 11.2917 9.95833 11.2917H7.95833M7.95833 0.625H9.95833C10.312 0.625 10.6511 0.765476 10.9011 1.01552C11.1512 1.26557 11.2917 1.60471 11.2917 1.95833V3.95833M3.95833 11.2917H1.95833C1.60471 11.2917 1.26557 11.1512 1.01552 10.9011C0.765476 10.6511 0.625 10.312 0.625 9.95833V7.95833"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
