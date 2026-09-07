import type { ComponentProps } from 'react';

export function EyeIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 8C10 8.53043 9.78929 9.03914 9.41421 9.41421C9.03914 9.78929 8.53043 10 8 10C7.46957 10 6.96086 9.78929 6.58579 9.41421C6.21071 9.03914 6 8.53043 6 8C6 7.46957 6.21071 6.96086 6.58579 6.58579C6.96086 6.21071 7.46957 6 8 6C8.53043 6 9.03914 6.21071 9.41421 6.58579C9.78929 6.96086 10 7.46957 10 8Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.33334 7.99992C2.40001 5.26859 4.89068 3.33325 8.00001 3.33325C11.1093 3.33325 13.6 5.26859 14.6667 7.99992C13.6 10.7313 11.1093 12.6666 8.00001 12.6666C4.89068 12.6666 2.40001 10.7313 1.33334 7.99992Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
