'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useRef, useState } from 'storybook/preview-api';

import { CoinflipCoin, type CoinflipCoinProps } from './coinflip-coin';
import {
  COINFLIP_DEFAULT_VIDEO_SRC,
  type CoinflipAnimationSourceResolver,
  type CoinflipCoinColor,
  getCoinflipEndColorFromSide,
  getCoinflipIdleVideoSrc,
  getCoinflipVideoSrc,
} from './coinflip-coin.utils';

import type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';
import {
  coinflipStoryAnimationVideos,
  getCoinflipStoryEndColor,
  getCoinflipStoryStartColor,
} from '#ui/features/games/originals/coinflip/coinflip-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface PendingFlip {
  side: CoinflipSide;
  startColor: CoinflipCoinColor;
}

const resolveBrokenStoryAnimation: CoinflipAnimationSourceResolver = () => ({
  webm: '/__storybook__/missing-coinflip-animation.webm',
  mp4: '/__storybook__/missing-coinflip-animation.mp4',
});

function CoinflipCoinPlayground() {
  const [args, updateArgs] = useArgs<CoinflipCoinProps>();
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const pendingFlipRef = useRef<PendingFlip | null>(null);

  const flipToSide = (side: CoinflipSide) => {
    if (args.isVideoPlaying) return;

    const startColor = getCoinflipStoryEndColor(args.videoSrc);
    pendingFlipRef.current = { side, startColor };
    setPlaybackError(null);
    updateArgs({
      videoSrc: getCoinflipVideoSrc({
        startColor,
        endColor: getCoinflipEndColorFromSide(side),
      }),
      isVideoPlaying: true,
    });
  };

  const handleVideoEnd = () => {
    const landedSide = pendingFlipRef.current?.side;
    pendingFlipRef.current = null;

    updateArgs({
      videoSrc: landedSide
        ? getCoinflipIdleVideoSrc(getCoinflipEndColorFromSide(landedSide))
        : args.videoSrc,
      isVideoPlaying: false,
    });
    args.onVideoEnd();
  };

  const handlePlaybackError = (error: Error) => {
    const startColor =
      pendingFlipRef.current?.startColor ?? getCoinflipStoryStartColor(args.videoSrc);
    pendingFlipRef.current = null;
    setPlaybackError(error.message);
    updateArgs({
      videoSrc: getCoinflipIdleVideoSrc(startColor),
      resolveAnimationSources: undefined,
      isVideoPlaying: false,
    });
    args.onPlaybackError(error);
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4">
      <CoinflipCoin
        videoSrc={args.videoSrc}
        resolveAnimationSources={args.resolveAnimationSources}
        isVideoPlaying={args.isVideoPlaying}
        onVideoEnd={handleVideoEnd}
        onPlaybackError={handlePlaybackError}
        onVideoDurationReady={args.onVideoDurationReady}
        reducedMotion={args.reducedMotion}
        turboMode={args.turboMode}
        volume={args.volume}
        overlay={args.overlay}
        className={args.className}
      />

      <Typography
        as="p"
        kind="secondary-12-400"
        role="status"
        aria-live="polite"
        className="min-h-4"
      >
        {playbackError ? `Recovered: ${playbackError}` : ''}
      </Typography>

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
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Coinflip/Coinflip Coin',
  component: CoinflipCoin,
  render: CoinflipCoinPlayground,
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
  },
} satisfies Meta<typeof CoinflipCoin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TurboMode: Story = {
  args: {
    turboMode: true,
  },
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
};

export const PlaybackErrorRecovery: Story = {
  args: {
    resolveAnimationSources: resolveBrokenStoryAnimation,
  },
};
