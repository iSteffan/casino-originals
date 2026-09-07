import { type ComponentProps, useId } from 'react';

export function ChatIcon(props: ComponentProps<'svg'>) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M19.261 8.773l-.205.472a.423.423 0 0 1-.779 0l-.205-.472a3.663 3.663 0 0 0-1.85-1.875l-.632-.282a.44.44 0 0 1 0-.802l.598-.267a3.662 3.662 0 0 0 1.875-1.938l.211-.509a.423.423 0 0 1 .785 0l.211.508a3.663 3.663 0 0 0 1.875 1.94l.598.266a.44.44 0 0 1 0 .802l-.633.281a3.663 3.663 0 0 0-1.849 1.876Zm-.594 2.394c.565 0 1.127-.095 1.66-.283.004.095.006.189.006.283a6.667 6.667 0 0 1-6.666 6.666v2.917c-4.167-1.667-10-4.167-10-9.583A6.667 6.667 0 0 1 10.333 4.5h3.334c.094 0 .188.002.282.006a5 5 0 0 0 4.718 6.66Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="12.833"
          y1="2.832"
          x2="12.833"
          y2="20.75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--icon-gradient-start, var(--color-ds-gray-700))" />
          <stop
            offset="1"
            stopColor="var(--icon-gradient-end, var(--color-ds-gray-300))"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
