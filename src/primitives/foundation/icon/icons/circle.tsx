import type { ComponentProps } from 'react';

export function CircleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
