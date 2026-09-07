import type { ComponentProps } from 'react';

export function TwitterIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.8916 1.5H22.5542L14.5542 10.4133L24 22.5H16.5783L10.7952 15.1733L4.14458 22.5H0.481928L9.06024 12.98L0 1.5H7.61446L12.8675 8.22L18.8916 1.5ZM17.5904 20.3533H19.6145L6.50602 3.50667H4.28916L17.5904 20.3533Z"
        fill="currentColor"
      />
    </svg>
  );
}
