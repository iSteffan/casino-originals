'use client';

import type { BlackjackCardProps } from './blackjack-card.types';

import { cn } from '#ui/lib/cn';
import { Image } from '#ui/primitives/data-display/image/image';

/** Card art PNGs have transparent rounded corners; white + matching radius fills the frame like betstrike. */
export function BlackjackCard({
  src,
  label,
  width = 80,
  height = 104,
  className,
}: BlackjackCardProps) {
  return (
    <Image
      src={src}
      alt={label}
      width={width}
      height={height}
      showSkeleton={false}
      className={cn('h-26 w-20 object-cover', className)}
      wrapperClassName="rounded-[4px] bg-ds-white sm:rounded-[6px]"
    />
  );
}

export type { BlackjackCardProps, BlackjackCardVisual } from './blackjack-card.types';
