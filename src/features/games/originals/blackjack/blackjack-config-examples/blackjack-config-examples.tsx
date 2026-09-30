'use client';

import type { BlackjackConfigExamplesProps } from './blackjack-config-examples.types';
import { BLACKJACK_CONFIG_EXAMPLE_SCENARIOS } from './blackjack-config-examples.data';

import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';

/** Fixed footprint so every scenario chip matches in the horizontal row. */
const SCENARIO_BUTTON_CLASS =
  'flex h-16 flex-col items-start justify-center gap-0.5 overflow-hidden whitespace-normal px-3 py-2 text-left';

export function BlackjackConfigExamples({
  onScenario,
  disabled = false,
  scenarios = BLACKJACK_CONFIG_EXAMPLE_SCENARIOS,
  title = 'Test Scenarios',
  layout = 'horizontal',
  className,
}: BlackjackConfigExamplesProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={cn(
        'bg-ds-surface-secondary rounded-ds-sm flex w-full flex-col gap-2 p-3',
        !isHorizontal && 'lg:w-80 p-4',
        className,
      )}
    >
      <p className="text-ds-text-primary text-ds-sm shrink-0 font-medium">{title}</p>
      <div
        className={cn(
          isHorizontal
            ? 'flex flex-row flex-wrap gap-2 overflow-x-auto pb-0.5'
            : 'flex flex-col gap-2',
        )}
      >
        {scenarios.map((scenario) => (
          <Button
            key={scenario.id}
            type="button"
            variant="gray"
            size="md"
            disabled={disabled}
            className={cn(
              SCENARIO_BUTTON_CLASS,
              isHorizontal ? 'w-[15.5rem] shrink-0' : 'w-full',
              // Default gray disabled bg is gray-900 (= surface-secondary); use gray-800 so chips stay visible on the panel / black shell.
              'disabled:bg-ds-gray-800 disabled:text-ds-text-secondary',
            )}
            onClick={() => onScenario(scenario.playerCards, scenario.dealerCards)}
          >
            <span className="text-ds-text-brand-secondary w-full truncate text-ds-xs font-medium leading-tight">
              {scenario.title}
            </span>
            <span className="text-ds-text-secondary w-full truncate text-ds-xs leading-tight">
              {scenario.dealerLine}
            </span>
            <span className="text-ds-text-tertiary w-full truncate text-ds-xs leading-tight">
              {scenario.playerLine}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export type {
  BlackjackConfigExampleScenario,
  BlackjackConfigExamplesProps,
} from './blackjack-config-examples.types';
export { BLACKJACK_CONFIG_EXAMPLE_SCENARIOS } from './blackjack-config-examples.data';
