import type { ComponentProps } from 'react';

export function ReplyIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.33333 12.6666V9.99998C3.33333 9.44442 3.52778 8.9722 3.91667 8.58331C4.30556 8.19442 4.77778 7.99998 5.33333 7.99998H11.45L9.05 10.4L10 11.3333L14 7.33331L10 3.33331L9.05 4.26665L11.45 6.66665H5.33333C4.41111 6.66665 3.62489 6.99176 2.97467 7.64198C2.32444 8.2922 1.99956 9.0782 2 9.99998V12.6666H3.33333Z"
        fill="currentColor"
      />
    </svg>
  );
}
