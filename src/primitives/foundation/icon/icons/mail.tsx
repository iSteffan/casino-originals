import type { ComponentProps } from 'react';

export function MailIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.3333 5.83337L10.8408 10.6059C10.5866 10.7536 10.2978 10.8313 10.0038 10.8313C9.70972 10.8313 9.42093 10.7536 9.16667 10.6059L1.66667 5.83337"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 3.33337H3.33334C2.41286 3.33337 1.66667 4.07957 1.66667 5.00004V15C1.66667 15.9205 2.41286 16.6667 3.33334 16.6667H16.6667C17.5871 16.6667 18.3333 15.9205 18.3333 15V5.00004C18.3333 4.07957 17.5871 3.33337 16.6667 3.33337Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
