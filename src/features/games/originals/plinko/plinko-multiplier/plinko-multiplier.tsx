'use client';

import type { PlinkoMultiplierProps } from './plinko-multiplier.types';

import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function PlinkoMultiplier({
  value,
  color,
  landEventId,
  reducedMotion = false,
  className,
}: PlinkoMultiplierProps) {
  const shouldLand = Boolean(landEventId) && !reducedMotion;

  return (
    <div
      key={landEventId ?? 'idle'}
      data-slot="plinko-multiplier"
      className={cn('ds-plinko-multiplier', className)}
      data-land={shouldLand ? '' : undefined}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      <Typography kind="white-12-700" as="span">
        {value}
      </Typography>
    </div>
  );
}

export type { PlinkoMultiplierProps } from './plinko-multiplier.types';
