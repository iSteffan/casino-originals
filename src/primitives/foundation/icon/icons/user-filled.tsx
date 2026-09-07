import { type ComponentProps, useId } from 'react';

export function UserFilledIcon(props: ComponentProps<'svg'>) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM10 8.75C10 9.993 10 11 6 11s-4-1.007-4-2.25S3.791 6.5 6 6.5s4 1.007 4 2.25Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="6"
          y1="1"
          x2="6"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--icon-gradient-start, currentColor)" />
          <stop offset="1" stopColor="var(--icon-gradient-end, currentColor)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
