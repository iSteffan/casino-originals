'use client';

import type { CoinflipBoardProps } from './coinflip-board.types';

import { CoinflipCoin } from '#ui/features/games/originals/coinflip/coinflip-coin/coinflip-coin';
import { CoinflipLastResults } from '#ui/features/games/originals/coinflip/coinflip-last-results/coinflip-last-results';
import { cn } from '#ui/lib/cn';

export function CoinflipBoard({
  lastResults = [],
  lastResultsAssets,
  lastResultsLabels,
  lastResultsAriaLabel,
  resultAnnouncement,
  overlay,
  className,
  videoSrc,
  resolveAnimationSources,
  isVideoPlaying,
  onVideoEnd,
  onPlaybackError,
  onVideoDurationReady,
  reducedMotion,
  theatreMode = false,
  turboMode,
  volume,
}: CoinflipBoardProps) {
  return (
    <div
      className={cn(
        // Mobile: content-sized (last results + h-78 coin). Desktop: fill column.
        'bg-ds-black rounded-ds-sm relative flex w-full flex-col gap-2 pt-4 lg:min-h-0 lg:flex-1',
        theatreMode && 'lg:h-full',
        className,
      )}
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </span>
      <CoinflipLastResults
        items={lastResults}
        assets={lastResultsAssets}
        labels={lastResultsLabels}
        aria-label={lastResultsAriaLabel}
      />
      <CoinflipCoin
        videoSrc={videoSrc}
        resolveAnimationSources={resolveAnimationSources}
        isVideoPlaying={isVideoPlaying}
        onVideoEnd={onVideoEnd}
        onPlaybackError={onPlaybackError}
        onVideoDurationReady={onVideoDurationReady}
        reducedMotion={reducedMotion}
        turboMode={turboMode}
        volume={volume}
        overlay={overlay}
      />
    </div>
  );
}

export type {
  CoinflipBoardProps,
  CoinflipResultAnnouncement,
} from './coinflip-board.types';
