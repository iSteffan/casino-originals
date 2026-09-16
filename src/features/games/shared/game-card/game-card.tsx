'use client';

import { cva } from 'class-variance-authority';

import { cn } from '#ui/lib/cn';
import { Image } from '#ui/primitives/data-display/image/image';

const cardVariants = cva('group relative cursor-pointer overflow-clip', {
  variants: {
    frame: {
      true: 'border-ds-border-tertiary rounded-ds-sm bg-ds-surface-tertiary border',
      false: 'border-0 bg-transparent',
    },
    aspect: {
      portrait: 'aspect-3/4',
      landscape: 'aspect-3/2',
      square: 'aspect-square',
      fill: 'size-full',
    },
  },
  defaultVariants: {
    frame: true,
    aspect: 'portrait',
  },
});

const mediaAlignClasses = {
  center: 'object-center',
  right: 'object-right',
  'right-offset': 'object-[85%_center]',
} as const;

const mediaFitClasses = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
} as const;

interface GameCardProps {
  src?: string;
  alt?: string;
  imageDimensions?: { width: number; height: number };
  aspect?: 'portrait' | 'landscape' | 'square' | 'fill';
  frame?: boolean;
  titlePlacement?: 'hover' | 'always' | 'none';
  mediaAlign?: 'center' | 'right' | 'right-offset';
  mediaFit?: 'contain' | 'cover' | 'fill';
  eager?: boolean;
  className?: string;
}

export function GameCard({
  src,
  imageDimensions,
  alt,
  aspect = 'portrait',
  frame = true,
  mediaAlign = 'center',
  mediaFit = 'cover',
  eager = false,
  className,
}: GameCardProps) {
  const alignClass = mediaAlignClasses[mediaAlign];
  const fitClass = mediaFitClasses[mediaFit];

  return (
    <div data-game-card="" className={cn(cardVariants({ frame, aspect }), className)}>
      {src && imageDimensions ? (
        <Image
          src={src}
          alt={alt ?? ''}
          width={imageDimensions.width}
          height={imageDimensions.height}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          showSkeleton={false}
          unoptimized
          wrapperClassName="absolute inset-0 size-full"
          className={cn(fitClass, alignClass)}
        />
      ) : src ? (
        <Image
          src={src}
          alt={alt ?? ''}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          showSkeleton={false}
          unoptimized
          wrapperClassName="absolute inset-0 size-full"
          className={cn(fitClass, alignClass)}
        />
      ) : null}
    </div>
  );
}

export type { GameCardProps };
