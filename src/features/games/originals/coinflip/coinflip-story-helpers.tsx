import type { ReactNode } from 'react';

import type {
  CoinflipAnimationVideo,
  CoinflipCoinColor,
} from './coinflip-coin/coinflip-coin.utils';
import type {
  CoinflipLastResultItem,
  CoinflipLastResultsAssets,
  CoinflipLastResultsLabels,
} from './coinflip-last-results/coinflip-last-results.types';
import type {
  CoinflipSelectSideOption,
  CoinflipSide,
} from './coinflip-select-side/coinflip-select-side.types';

import { Image } from '#ui/primitives/data-display/image/image';

let nextStoryResultId = 1;

export const coinflipStoryAnimationVideos = [
  '/img/games/coinflip/animations/1 G2G.webm',
  '/img/games/coinflip/animations/1 G2P.webm',
  '/img/games/coinflip/animations/1 P2G.webm',
  '/img/games/coinflip/animations/1 P2P.webm',
  '/img/games/coinflip/animations/2 G2G.webm',
  '/img/games/coinflip/animations/2 G2P.webm',
  '/img/games/coinflip/animations/2 P2G.webm',
  '/img/games/coinflip/animations/2 P2P.webm',
  '/img/games/coinflip/animations/3 G2G.webm',
  '/img/games/coinflip/animations/3 G2P.webm',
  '/img/games/coinflip/animations/3 P2G.webm',
  '/img/games/coinflip/animations/3 P2P.webm',
] as const satisfies readonly CoinflipAnimationVideo[];

export const coinflipStoryCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    wrapperClassName="size-5 shrink-0 rounded-ds-full"
    className="size-5 object-contain"
    showSkeleton={false}
  />
);

export const coinflipStoryWinCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={32}
    height={32}
    wrapperClassName="size-8 shrink-0 rounded-ds-full"
    className="size-8 object-contain"
    showSkeleton={false}
  />
);

export const coinflipStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export const coinflipStoryStopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

function CoinflipStoryCoinVisual({ side }: { side: CoinflipSide }) {
  return (
    <Image
      src={
        side === 'HEADS' ? '/img/games/coinflip/head.png' : '/img/games/coinflip/tail.png'
      }
      alt=""
      width={100}
      height={100}
      wrapperClassName="ds-coinflip-select-side-coin shrink-0"
      className="ds-coinflip-select-side-coin block object-contain"
      showSkeleton={false}
    />
  );
}

export const coinflipStorySelectSideOptions: [
  CoinflipSelectSideOption,
  CoinflipSelectSideOption,
] = [
  {
    value: 'HEADS',
    label: 'Heads',
    visual: <CoinflipStoryCoinVisual side="HEADS" />,
  },
  {
    value: 'TAILS',
    label: 'Tails',
    visual: <CoinflipStoryCoinVisual side="TAILS" />,
  },
];

export const coinflipStoryLastResults: CoinflipLastResultItem[] = [
  { id: 'coinflip-1', side: 'HEADS' },
  { id: 'coinflip-2', side: 'TAILS' },
  { id: 'coinflip-3', side: 'HEADS' },
  { id: 'coinflip-4', side: 'TAILS' },
];

export const coinflipStoryLastResultsAssets: CoinflipLastResultsAssets = {
  HEADS: '/img/games/coinflip/head-side.svg',
  TAILS: '/img/games/coinflip/tail-side.svg',
  lead: '/img/games/coinflip/undefined-side.svg',
};

export const coinflipStoryLastResultsLabels: CoinflipLastResultsLabels = {
  HEADS: 'Heads',
  TAILS: 'Tails',
};

export const coinflipStoryLastResultsAriaLabel = 'Coinflip last results';

export function createCoinflipStoryLastResult(
  side: CoinflipSide,
): CoinflipLastResultItem {
  const id = `coinflip-story-${nextStoryResultId}`;
  nextStoryResultId += 1;

  return { id, side };
}

export function getCoinflipStoryEndColor(
  videoSrc: CoinflipAnimationVideo,
): CoinflipCoinColor {
  return videoSrc.includes('2P.') ? 'P' : 'G';
}

export function getCoinflipStoryStartColor(
  videoSrc: CoinflipAnimationVideo,
): CoinflipCoinColor {
  return videoSrc.includes(' P2') ? 'P' : 'G';
}
