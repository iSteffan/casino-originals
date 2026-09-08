import type { ReactNode } from 'react';

import type {
  CoinflipAnimationSourceResolver,
  CoinflipAnimationVideo,
} from './coinflip-coin.utils';

export interface CoinflipCoinProps {
  videoSrc: CoinflipAnimationVideo;
  /** Optional app/CDN media resolver. Defaults to the bundled public-path manifest. */
  resolveAnimationSources?: CoinflipAnimationSourceResolver;
  isVideoPlaying: boolean;
  /** Completes the controlled animation lifecycle after a natural media end. */
  onVideoEnd: () => void;
  /** Error is intentionally distinct from completion; the app controller owns recovery. */
  onPlaybackError: (error: Error) => void;
  onVideoDurationReady?: (duration: number) => void;
  /** Force reduced playback in addition to the user's system motion preference. */
  reducedMotion?: boolean;
  turboMode?: boolean;
  volume?: number;
  overlay?: ReactNode;
  className?: string;
}
