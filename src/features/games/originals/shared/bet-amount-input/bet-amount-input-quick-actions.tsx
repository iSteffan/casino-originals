'use client';

import type { BetAmountQuickAction } from './bet-amount-input.types';

import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';

export interface BetAmountQuickActionsProps {
  actions: BetAmountQuickAction[];
  isLoading?: boolean;
  isEmpty?: boolean;
  isDisabled?: boolean;
}

export function BetAmountQuickActions({
  actions,
  isLoading = false,
  isEmpty = false,
  isDisabled = false,
}: BetAmountQuickActionsProps) {
  const preventFocusSteal = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div className="flex items-center">
      {actions.map((action, index) => (
        <div key={`${action.label}-${index}`} className="flex items-center">
          {index > 0 ? (
            <div
              className="bg-ds-border-primary mx-ds-1 h-[22px] w-px shrink-0"
              aria-hidden
            />
          ) : null}
          <Button
            type="button"
            variant="link-white"
            size="md"
            className={cn(
              'text-ds-body-lg font-ds-medium leading-ds-solid h-6 min-w-8 px-1',
              'disabled:text-ds-text-tertiary disabled:opacity-100',
            )}
            disabled={isLoading || isEmpty || isDisabled || action.disabled}
            onMouseDown={preventFocusSteal}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      ))}
    </div>
  );
}
