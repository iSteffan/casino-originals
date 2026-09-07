import type { ComponentProps } from 'react';

export function ExternalLinkIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13 11L22 2M22 2H16.656M22 2V7.344"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 12C22 16.714 22 19.071 20.535 20.535C19.072 22 16.714 22 12 22C7.286 22 4.929 22 3.464 20.535C2 19.072 2 16.714 2 12C2 7.286 2 4.929 3.464 3.464C4.93 2 7.286 2 12 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
