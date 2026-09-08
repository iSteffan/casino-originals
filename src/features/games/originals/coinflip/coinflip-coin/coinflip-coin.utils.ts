import type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';

export type CoinflipCoinColor = 'G' | 'P';
export type CoinflipAnimationVersion = 1 | 2 | 3;
export type CoinflipAnimationVideo =
  `/img/games/coinflip/animations/${CoinflipAnimationVersion} ${CoinflipCoinColor}2${CoinflipCoinColor}.webm`;

export interface CoinflipAnimationSources {
  webm: string;
  mp4?: string;
}

/** Lets an app/CDN replace package defaults without coupling the UI to storage paths. */
export type CoinflipAnimationSourceResolver = (
  video: CoinflipAnimationVideo,
) => CoinflipAnimationSources;

export const COINFLIP_DEFAULT_VIDEO_SRC: CoinflipAnimationVideo =
  '/img/games/coinflip/animations/1 G2G.webm';

export function getCoinflipAnimationSources(
  videoSrc: CoinflipAnimationVideo,
): CoinflipAnimationSources {
  return {
    webm: videoSrc,
    mp4: videoSrc.replace(/\.webm$/, '.mp4'),
  };
}

export function getCoinflipEndColorFromSide(side: CoinflipSide): CoinflipCoinColor {
  return side === 'HEADS' ? 'G' : 'P';
}

export function getCoinflipVideoSrc({
  version = 1,
  startColor,
  endColor,
}: {
  version?: CoinflipAnimationVersion;
  startColor: CoinflipCoinColor;
  endColor: CoinflipCoinColor;
}): CoinflipAnimationVideo {
  return `/img/games/coinflip/animations/${version} ${startColor}2${endColor}.webm`;
}

export function getCoinflipIdleVideoSrc(
  startColor: CoinflipCoinColor,
): CoinflipAnimationVideo {
  return getCoinflipVideoSrc({ version: 1, startColor, endColor: startColor });
}

export function isCoinflipSameColorVideo(videoSrc: CoinflipAnimationVideo): boolean {
  return videoSrc.includes('G2G') || videoSrc.includes('P2P');
}
