import type { Transition } from 'framer-motion';

import type { LastResultsFlow } from './last-results.types';

export const LAST_RESULTS_DEFAULT_GAP = 8;
export const LAST_RESULTS_DEFAULT_DURATION = 0.3;
const LAST_RESULTS_SLIDE_OFFSET = 40;

export function getLastResultsItemTransition(
  duration: number,
  reducedMotion: boolean | null,
): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }

  return { duration, ease: 'easeOut' };
}

export function getLastResultsEnterState(
  flow: LastResultsFlow,
  reducedMotion: boolean | null,
) {
  if (reducedMotion) {
    return { opacity: 1, x: 0 };
  }

  return {
    opacity: 0,
    x: flow === 'toward-end' ? -LAST_RESULTS_SLIDE_OFFSET : LAST_RESULTS_SLIDE_OFFSET,
  };
}

export function getLastResultsExitState(
  flow: LastResultsFlow,
  reducedMotion: boolean | null,
) {
  if (reducedMotion) {
    return { opacity: 0 };
  }

  return {
    opacity: 0,
    x: flow === 'toward-end' ? LAST_RESULTS_SLIDE_OFFSET : -LAST_RESULTS_SLIDE_OFFSET,
  };
}
