'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useRef } from 'storybook/preview-api';

import { CoinflipBoard, type CoinflipBoardProps } from './coinflip-board';

import type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';
import {
  COINFLIP_DEFAULT_VIDEO_SRC,
  type CoinflipCoinColor,
  getCoinflipEndColorFromSide,
  getCoinflipIdleVideoSrc,
  getCoinflipVideoSrc,
} from '#ui/features/games/originals/coinflip/coinflip-coin/coinflip-coin.utils';
import {
  coinflipStoryAnimationVideos,
  coinflipStoryLastResults,
  coinflipStoryLastResultsAriaLabel,
  coinflipStoryLastResultsAssets,
  coinflipStoryLastResultsLabels,
  coinflipStoryWinCurrencyIcon,
  createCoinflipStoryLastResult,
  getCoinflipStoryEndColor,
  getCoinflipStoryStartColor,
} from '#ui/features/games/originals/coinflip/coinflip-story-helpers';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { Button } from '#ui/primitives/actions/button/button';

interface PendingFlip {
  side: CoinflipSide;
  startColor: CoinflipCoinColor;
}

function CoinflipBoardPlayground() {
  const [args, updateArgs] = useArgs<CoinflipBoardProps>();
  const pendingFlipRef = useRef<PendingFlip | null>(null);
  const lastResults = args.lastResults ?? [];

  const flipToSide = (side: CoinflipSide) => {
    if (args.isVideoPlaying) return;

    const startColor = getCoinflipStoryEndColor(args.videoSrc);
    pendingFlipRef.current = { side, startColor };
    updateArgs({
      videoSrc: getCoinflipVideoSrc({
        startColor,
        endColor: getCoinflipEndColorFromSide(side),
      }),
      isVideoPlaying: true,
      resultAnnouncement: undefined,
    });
  };

  const handleVideoEnd = () => {
    const landedSide = pendingFlipRef.current?.side;
    pendingFlipRef.current = null;

    if (!landedSide) {
      updateArgs({ isVideoPlaying: false });
      args.onVideoEnd();
      return;
    }

    const result = createCoinflipStoryLastResult(landedSide);
    updateArgs({
      videoSrc: getCoinflipIdleVideoSrc(getCoinflipEndColorFromSide(landedSide)),
      isVideoPlaying: false,
      lastResults: [result, ...lastResults].slice(0, 40),
      resultAnnouncement: {
        id: result.id,
        message: landedSide === 'HEADS' ? 'Heads.' : 'Tails.',
      },
    });
    args.onVideoEnd();
  };

  const handlePlaybackError = (error: Error) => {
    const startColor =
      pendingFlipRef.current?.startColor ?? getCoinflipStoryStartColor(args.videoSrc);
    pendingFlipRef.current = null;
    updateArgs({
      videoSrc: getCoinflipIdleVideoSrc(startColor),
      isVideoPlaying: false,
    });
    args.onPlaybackError(error);
  };

  const addResult = () => {
    const side = lastResults[0]?.side === 'HEADS' ? 'TAILS' : 'HEADS';
    const result = createCoinflipStoryLastResult(side);
    updateArgs({
      lastResults: [result, ...lastResults].slice(0, 40),
      resultAnnouncement: {
        id: result.id,
        message: side === 'HEADS' ? 'Heads.' : 'Tails.',
      },
    });
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4">
      <CoinflipBoard
        videoSrc={args.videoSrc}
        resolveAnimationSources={args.resolveAnimationSources}
        isVideoPlaying={args.isVideoPlaying}
        onVideoEnd={handleVideoEnd}
        onPlaybackError={handlePlaybackError}
        onVideoDurationReady={args.onVideoDurationReady}
        reducedMotion={args.reducedMotion}
        turboMode={args.turboMode}
        volume={args.volume}
        lastResults={lastResults}
        lastResultsAssets={args.lastResultsAssets}
        lastResultsLabels={args.lastResultsLabels}
        lastResultsAriaLabel={args.lastResultsAriaLabel}
        resultAnnouncement={args.resultAnnouncement}
        overlay={args.overlay}
        className={args.className}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          disabled={args.isVideoPlaying}
          onClick={() => flipToSide('HEADS')}
        >
          Flip to heads
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={args.isVideoPlaying}
          onClick={() => flipToSide('TAILS')}
        >
          Flip to tails
        </Button>
        <Button type="button" variant="secondary" onClick={addResult}>
          Add result
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => updateArgs({ lastResults: [], resultAnnouncement: undefined })}
        >
          Clear results
        </Button>
      </div>
    </div>
  );
}

const winModal = (
  <GameWinModal
    open
    title="You win!"
    multiplierLabel="Multiplier"
    multiplier="x2.00"
    formattedWinAmount="2,000.00"
    currencyIcon={coinflipStoryWinCurrencyIcon}
  />
);

const meta = {
  title: 'Features/Games/Originals/Coinflip/Coinflip Board',
  component: CoinflipBoard,
  render: CoinflipBoardPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['videoSrc', 'isVideoPlaying', 'reducedMotion', 'turboMode', 'volume'],
    },
  },
  argTypes: {
    videoSrc: {
      control: { type: 'select' },
      options: coinflipStoryAnimationVideos,
    },
    isVideoPlaying: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    turboMode: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    resolveAnimationSources: { control: false },
    onVideoEnd: { control: false },
    onPlaybackError: { control: false },
    onVideoDurationReady: { control: false },
    lastResults: { control: false },
    lastResultsAssets: { control: false },
    lastResultsLabels: { control: false },
    lastResultsAriaLabel: { control: false },
    resultAnnouncement: { control: false },
    overlay: { control: false },
    className: { control: false },
  },
  args: {
    videoSrc: COINFLIP_DEFAULT_VIDEO_SRC,
    isVideoPlaying: false,
    onVideoEnd: () => undefined,
    onPlaybackError: () => undefined,
    reducedMotion: false,
    turboMode: false,
    volume: 1,
    lastResults: coinflipStoryLastResults,
    lastResultsAssets: coinflipStoryLastResultsAssets,
    lastResultsLabels: coinflipStoryLastResultsLabels,
    lastResultsAriaLabel: coinflipStoryLastResultsAriaLabel,
  },
} satisfies Meta<typeof CoinflipBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TurboMode: Story = {
  args: {
    turboMode: true,
    lastResults: [],
  },
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
};

export const EmptyLastResults: Story = {
  args: { lastResults: [] },
};

export const WithWinModal: Story = {
  args: { overlay: winModal },
};

export const Mobile: Story = {
  globals: {
    viewport: { value: 'mobile1' },
  },
};
