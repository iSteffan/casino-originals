'use client';

import type { PlinkoPinProps } from './plinko-pin.types';

import { PLINKO_PIN_SRC } from '#ui/features/games/originals/plinko/plinko.constants';
import { cn } from '#ui/lib/cn';

export { PLINKO_PIN_SRC };

export function PlinkoPin({
  hitEventId,
  reducedMotion = false,
  className,
}: PlinkoPinProps) {
  const shouldHit = Boolean(hitEventId) && !reducedMotion;

  return (
    <div
      data-slot="plinko-pin"
      className={cn('ds-plinko-pin', className)}
      aria-hidden="true"
    >
      <span className="ds-plinko-pin-core">
        <span
          key={hitEventId ?? 'idle'}
          className="ds-plinko-pin-circle"
          data-hit={shouldHit ? '' : undefined}
          style={{ backgroundImage: `url(${PLINKO_PIN_SRC})` }}
        />
      </span>
    </div>
  );
}

export type { PlinkoPinProps } from './plinko-pin.types';
