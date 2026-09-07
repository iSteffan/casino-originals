import type { ComponentProps } from 'react';

export function BurgerIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 5C2.948 5 2.5 5.448 2.5 6s.448 1 1 1h17c.552 0 1-.448 1-1s-.448-1-1-1h-17Zm-1 7c0-.552.448-1 1-1h17c.552 0 1 .448 1 1s-.448 1-1 1h-17c-.552 0-1-.448-1-1Zm0 6.001c0-.552.448-1 1-1h17c.552 0 1 .448 1 1s-.448 1-1 1h-17c-.552 0-1-.448-1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}
