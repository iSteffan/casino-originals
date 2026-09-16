'use client';

import { useIconGradientFill, type IconSvgProps } from './icon-gradient';

export function MinesIcon(props: IconSvgProps) {
  const { fill, defs } = useIconGradientFill();

  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {defs}
      <path
        d="M10.75 2.1a1.1 1.1 0 0 0-1.5 0L3.4 8.35a1.1 1.1 0 0 0 0 1.5l5.85 6.05a1.1 1.1 0 0 0 1.5 0l5.85-6.05a1.1 1.1 0 0 0 0-1.5L10.75 2.1Z"
        fill={fill}
      />
    </svg>
  );
}
