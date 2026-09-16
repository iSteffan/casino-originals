'use client';

import { useIconGradientFill, type IconSvgProps } from './icon-gradient';

export function KenoIcon(props: IconSvgProps) {
  const { fill, defs } = useIconGradientFill();

  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {defs}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.25 2.5A1.25 1.25 0 0 0 2 3.75v12.5c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V3.75c0-.69-.56-1.25-1.25-1.25H3.25Zm1.5 2.25h4v4h-4v-4Zm6 0h4v4h-4v-4Zm-6 6h4v4h-4v-4Zm6 0h4v4h-4v-4Z"
        fill={fill}
      />
    </svg>
  );
}
