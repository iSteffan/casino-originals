'use client';

import type { BetAmountThresholdWarningContent } from './bet-amount-input.types';

import { OriginalsFieldReveal } from '#ui/features/games/originals/shared/originals-field-reveal';
import { cn } from '#ui/lib/cn';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface BetAmountInputThresholdWarningProps extends BetAmountThresholdWarningContent {
  visible: boolean;
  id?: string;
  className?: string;
}

export function BetAmountInputThresholdWarning({
  visible,
  id,
  title,
  description,
  className,
}: BetAmountInputThresholdWarningProps) {
  return (
    <OriginalsFieldReveal open={visible} offset="2">
      <div id={id} className={cn('gap-ds-1 flex', className)}>
        <Icon name="warning" size="sm" color="warning" className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <Typography kind="warning-12-700">{title}</Typography>
          <Typography kind="secondary-12-400">{description}</Typography>
        </div>
      </div>
    </OriginalsFieldReveal>
  );
}
