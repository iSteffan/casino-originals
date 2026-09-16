'use client';

import { useIconGradientFill, type IconSvgProps } from './icon-gradient';

export function CoinflipIcon(props: IconSvgProps) {
  const { fill, defs } = useIconGradientFill();

  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {defs}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5ZM3.5 10a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"
        fill={fill}
      />
      <path
        d="M10.65 6.1c.9 0 1.55.55 1.55 1.4 0 .52-.25.95-.7 1.2.6.28.95.78.95 1.45 0 1.05-.85 1.75-2.05 1.75H9.7v.85a.65.65 0 1 1-1.3 0v-.85H7.75c-1.15 0-1.95-.7-1.95-1.7 0-.7.38-1.22.98-1.5.42-.25.65-.68.65-1.2 0-.88.68-1.4 1.62-1.4h1.6Zm-.95 1.15h.8c.35 0 .6.2.6.5s-.25.5-.6.5h-.8c-.35 0-.6-.2-.6-.5s.25-.5.6-.5Zm-.1 2.55h1.1c.42 0 .72.25.72.6s-.3.6-.72.6h-1.1c-.42 0-.72-.25-.72-.6s.3-.6.72-.6Z"
        fill={fill}
      />
    </svg>
  );
}
