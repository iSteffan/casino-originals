'use client';

import type { BlackjackActionsProps } from './blackjack-actions.types';

import { Button } from '#ui/primitives/actions/button/button';

export function BlackjackActions({ actions, className }: BlackjackActionsProps) {
  return (
    <div className={className ?? 'grid grid-cols-2 gap-2'}>
      {actions.map((action) => (
        <Button
          key={action.id ?? action.label}
          type="button"
          variant="secondary"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export type { BlackjackActionItem, BlackjackActionsProps } from './blackjack-actions.types';
