'use client';

import type { BetAmountInputTooltip } from './bet-amount-input.types';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#ui/primitives/feedback/tooltip/tooltip';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function BetAmountLabelTooltip({
  label,
  title,
  description,
}: BetAmountInputTooltip) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-ds-icon-secondary hover:text-ds-icon-primary rounded-ds-xxs inline-flex shrink-0 cursor-pointer',
            formControlFocusRing,
          )}
          aria-label={label}
        >
          <Icon name="info" size="sm" color="secondary" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        color="light"
        multiline
        side="bottom"
        className="ds-bet-amount-label-tooltip-content"
      >
        <Typography kind="black-12-700" className="ds-bet-amount-label-tooltip-title">
          {title}
        </Typography>
        <Typography
          kind="black-12-400"
          className="ds-bet-amount-label-tooltip-description"
        >
          {description}
        </Typography>
      </TooltipContent>
    </Tooltip>
  );
}
