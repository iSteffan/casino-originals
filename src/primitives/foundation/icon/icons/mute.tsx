import type { ComponentProps } from 'react';

export function MuteIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5 7.49984H2.5V12.4998H5L9.16667 15.8332V4.1665L5 7.49984Z"
        stroke="currentColor"
        strokeWidth="1.5625"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 7.5L17.5 12.5M17.5 7.5L12.5 12.5"
        stroke="currentColor"
        strokeWidth="1.5625"
        strokeLinecap="round"
      />
    </svg>
  );
}
