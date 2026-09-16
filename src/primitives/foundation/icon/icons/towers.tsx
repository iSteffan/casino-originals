'use client';

import { useIconGradientFill, type IconSvgProps } from './icon-gradient';

export function TowersIcon(props: IconSvgProps) {
  const { fill, defs } = useIconGradientFill();

  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {defs}
      <path
        d="M7.75 2.5h4.5a.75.75 0 0 1 .75.75V5h1.75A.75.75 0 0 1 15.5 5.75v2.5h1.25a.75.75 0 0 1 .75.75v7.25a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75H4.5v-2.5A.75.75 0 0 1 5.25 5H7V3.25a.75.75 0 0 1 .75-.75Zm.75 1.5v1h3v-1h-3Zm-2.5 2.5v1.5h7.5V6.5h-7.5ZM4.5 10.5v4h3.25v-4H4.5Zm4 0v4H11.5v-4H8.5Zm4 0v4h3v-4h-3Z"
        fill={fill}
      />
    </svg>
  );
}
