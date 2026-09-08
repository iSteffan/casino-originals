'use client';

import type { CoinflipCoinProps } from './coinflip-coin.types';
import { getCoinflipAnimationSources } from './coinflip-coin.utils';
import { useCoinflipCoinVideos } from './use-coinflip-coin-videos';

import { cn } from '#ui/lib/cn';
import { useMediaQuery } from '#ui/lib/hooks/use-media-query';

export function CoinflipCoin({
  videoSrc,
  resolveAnimationSources = getCoinflipAnimationSources,
  isVideoPlaying,
  onVideoEnd,
  onPlaybackError,
  onVideoDurationReady,
  reducedMotion = false,
  turboMode = false,
  volume = 1,
  overlay,
  className,
}: CoinflipCoinProps) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { webm, mp4 } = resolveAnimationSources(videoSrc);
  const animation = {
    videoSrc,
    sourceKey: `${videoSrc}|${webm}|${mp4 ?? ''}`,
    sources: { webm, mp4 },
  };

  const { setVideoRef, visibleAnimation } = useCoinflipCoinVideos({
    animation,
    isVideoPlaying,
    onVideoEnd,
    onPlaybackError,
    onVideoDurationReady,
    reducedMotion: reducedMotion || prefersReducedMotion === true,
    turboMode,
    volume,
  });

  const mountedAnimations =
    visibleAnimation.sourceKey === animation.sourceKey
      ? [animation]
      : [visibleAnimation, animation];

  return (
    <div
      className={cn(
        // Keep a real slot for isolated stories and allow the coin to stretch in
        // the composed game layout on desktop.
        'h-78 lg:min-h-78 relative w-full shrink-0 lg:flex-1',
        className,
      )}
    >
      {mountedAnimations.map((mountedAnimation) => {
        const isVisible = mountedAnimation.sourceKey === visibleAnimation.sourceKey;

        return (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- decorative coin flip animation without spoken dialogue
          <video
            key={mountedAnimation.sourceKey}
            ref={(element) => setVideoRef(mountedAnimation.sourceKey, element)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              zIndex: isVisible ? 10 : 0,
              opacity: isVisible ? 1 : 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
            playsInline
            preload={mountedAnimation.sourceKey === animation.sourceKey ? 'auto' : 'none'}
          >
            <source src={mountedAnimation.sources.webm} type="video/webm" />
            {mountedAnimation.sources.mp4 ? (
              <source src={mountedAnimation.sources.mp4} type="video/mp4" />
            ) : null}
          </video>
        );
      })}
      {overlay}
    </div>
  );
}

export type { CoinflipCoinProps } from './coinflip-coin.types';
export type {
  CoinflipAnimationSourceResolver,
  CoinflipAnimationSources,
  CoinflipAnimationVersion,
  CoinflipAnimationVideo,
  CoinflipCoinColor,
} from './coinflip-coin.utils';
export {
  COINFLIP_DEFAULT_VIDEO_SRC,
  getCoinflipEndColorFromSide,
  getCoinflipIdleVideoSrc,
  getCoinflipVideoSrc,
} from './coinflip-coin.utils';
export type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';
