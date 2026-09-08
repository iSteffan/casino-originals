import type { ReactNode } from 'react';

import type {
  CoinflipAnimationSourceResolver,
  CoinflipAnimationVideo,
} from '#ui/features/games/originals/coinflip/coinflip-coin/coinflip-coin.utils';
import type {
  CoinflipLastResultItem,
  CoinflipLastResultsAssets,
  CoinflipLastResultsLabels,
} from '#ui/features/games/originals/coinflip/coinflip-last-results/coinflip-last-results.types';

export interface CoinflipResultAnnouncement {
  id: string;
  message: string;
}

export interface CoinflipBoardProps {
  videoSrc: CoinflipAnimationVideo;
  resolveAnimationSources?: CoinflipAnimationSourceResolver;
  isVideoPlaying: boolean;
  onVideoEnd: () => void;
  onPlaybackError: (error: Error) => void;
  onVideoDurationReady?: (duration: number) => void;
  /** Force reduced playback in addition to the user's system motion preference. */
  reducedMotion?: boolean;
  theatreMode?: boolean;
  turboMode?: boolean;
  volume?: number;
  lastResults?: readonly CoinflipLastResultItem[];
  lastResultsAssets: CoinflipLastResultsAssets;
  lastResultsLabels: CoinflipLastResultsLabels;
  lastResultsAriaLabel: string;
  /** Identifiable polite announcement for the latest settled round. */
  resultAnnouncement?: CoinflipResultAnnouncement;
  overlay?: ReactNode;
  className?: string;
}
