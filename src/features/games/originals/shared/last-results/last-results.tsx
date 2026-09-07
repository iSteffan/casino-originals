'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import type { LastResultsProps } from './last-results.types';
import {
  getLastResultsEnterState,
  getLastResultsExitState,
  getLastResultsItemTransition,
  LAST_RESULTS_DEFAULT_DURATION,
  LAST_RESULTS_DEFAULT_GAP,
} from './last-results.utils';

import { cn } from '#ui/lib/cn';

export function LastResults<T>({
  items,
  getItemKey,
  renderItem,
  flow = 'toward-end',
  lead,
  gap = LAST_RESULTS_DEFAULT_GAP,
  duration = LAST_RESULTS_DEFAULT_DURATION,
  className,
  'aria-label': ariaLabel,
}: LastResultsProps<T>) {
  const reducedMotion = useReducedMotion();
  const transition = getLastResultsItemTransition(duration, reducedMotion);
  const enterState = getLastResultsEnterState(flow, reducedMotion);
  const exitState = getLastResultsExitState(flow, reducedMotion);

  return (
    <div
      data-slot="last-results"
      className={cn('ds-last-results', lead && 'ds-last-results-with-lead', className)}
    >
      {lead ? (
        <div
          data-slot="last-results-lead"
          className={cn(
            'ds-last-results-lead',
            flow === 'toward-start'
              ? 'ds-last-results-lead-toward-start'
              : 'ds-last-results-lead-toward-end',
          )}
        >
          {lead}
        </div>
      ) : null}

      <div data-slot="last-results-viewport" className="ds-last-results-viewport">
        <div data-slot="last-results-clip" className="ds-last-results-clip">
          <div
            data-slot="last-results-offset"
            className={cn(
              'ds-last-results-offset',
              lead &&
                (flow === 'toward-start'
                  ? 'ds-last-results-offset-toward-start'
                  : 'ds-last-results-offset-toward-end'),
            )}
          >
            <div
              data-slot="last-results-track"
              role="list"
              aria-label={ariaLabel}
              className={cn(
                'ds-last-results-track',
                flow === 'toward-start' && 'ds-last-results-track-toward-start',
              )}
              style={{ gap }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => {
                  const key = getItemKey(item);

                  return (
                    <motion.div
                      key={key}
                      layout
                      initial={enterState}
                      animate={{ x: 0, opacity: 1 }}
                      exit={exitState}
                      transition={transition}
                      data-slot="last-results-item"
                      role="listitem"
                      className="ds-last-results-item"
                    >
                      {renderItem(item)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { LastResultsFlow, LastResultsProps } from './last-results.types';
export {
  LAST_RESULTS_DEFAULT_DURATION,
  LAST_RESULTS_DEFAULT_GAP,
} from './last-results.utils';
