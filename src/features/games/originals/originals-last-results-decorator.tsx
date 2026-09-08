import type { ReactNode } from 'react';

/** Typical game board slot width for last-results stories (wider than config drawer). */
const ORIGINALS_LAST_RESULTS_STORY_WIDTH = 560;

export function OriginalsLastResultsDecorator(Story: () => ReactNode) {
  return (
    <div
      className="bg-ds-gray-900 rounded-ds-md p-ds-4 mx-auto w-full min-w-0"
      style={{ maxWidth: ORIGINALS_LAST_RESULTS_STORY_WIDTH }}
    >
      <Story />
    </div>
  );
}
