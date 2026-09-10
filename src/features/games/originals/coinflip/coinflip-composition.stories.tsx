'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useRef } from 'storybook/preview-api';

import type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';
import { CoinflipBoard } from '#ui/features/games/originals/coinflip/coinflip-board/coinflip-board';
import type { CoinflipBoardProps } from '#ui/features/games/originals/coinflip/coinflip-board/coinflip-board.types';
import {
  COINFLIP_DEFAULT_VIDEO_SRC,
  type CoinflipAnimationVideo,
  type CoinflipCoinColor,
  getCoinflipEndColorFromSide,
  getCoinflipIdleVideoSrc,
  getCoinflipVideoSrc,
} from '#ui/features/games/originals/coinflip/coinflip-coin/coinflip-coin.utils';
import { CoinflipConfig } from '#ui/features/games/originals/coinflip/coinflip-config/coinflip-config';
import type { CoinflipConfigProps } from '#ui/features/games/originals/coinflip/coinflip-config/coinflip-config.types';
import type { CoinflipLastResultItem } from '#ui/features/games/originals/coinflip/coinflip-last-results/coinflip-last-results.types';
import {
  coinflipStoryBetAmountTooltip,
  coinflipStoryCurrencyIcon,
  coinflipStoryLastResults,
  coinflipStoryLastResultsAriaLabel,
  coinflipStoryLastResultsAssets,
  coinflipStoryLastResultsLabels,
  coinflipStorySelectSideOptions,
  coinflipStoryStopConditionsLabels,
  coinflipStoryWinCurrencyIcon,
  createCoinflipStoryLastResult,
  getCoinflipStoryEndColor,
  getCoinflipStoryStartColor,
} from '#ui/features/games/originals/coinflip/coinflip-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { cn } from '#ui/lib/cn';

interface PlaygroundArgs {
  mode: OriginalsConfigMode;
  tabsDisabled: boolean;
  fieldsDisabled: boolean;
  betAmountLoading: boolean;
  betAmount: string;
  side: CoinflipSide;
  reducedMotion: boolean;
  turboMode: boolean;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  theatreMode: boolean;
  volume: number;
  betAmountError: string;
  showBetAmountThresholdWarning: boolean;
  betAmountThresholdTitle: string;
  betAmountThresholdDescription: string;
  roundsError: string;
  autobetSessionState: AutobetSessionState;
  autobetTotalWagered: string;
  autobetNetProfit: string;
  autobetWinRate: string;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  videoSrc: CoinflipAnimationVideo;
  isVideoPlaying: boolean;
  lastResults: CoinflipLastResultItem[];
  resultAnnouncement?: CoinflipBoardProps['resultAnnouncement'];
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
}

interface PendingFlip {
  side: CoinflipSide;
  startColor: CoinflipCoinColor;
}

function CoinflipCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const pendingFlipRef = useRef<PendingFlip | null>(null);

  const flipToSide = (landedSide: CoinflipSide) => {
    if (args.isVideoPlaying) return;

    const startColor = getCoinflipStoryEndColor(args.videoSrc);
    pendingFlipRef.current = { side: landedSide, startColor };
    updateArgs({
      videoSrc: getCoinflipVideoSrc({
        startColor,
        endColor: getCoinflipEndColorFromSide(landedSide),
      }),
      isVideoPlaying: true,
      resultAnnouncement: undefined,
    });
  };

  const handleVideoEnd = () => {
    const pendingFlip = pendingFlipRef.current;
    pendingFlipRef.current = null;

    if (!pendingFlip) {
      updateArgs({ isVideoPlaying: false });
      return;
    }

    const { side: landedSide } = pendingFlip;
    const result = createCoinflipStoryLastResult(landedSide);
    updateArgs({
      videoSrc: getCoinflipIdleVideoSrc(getCoinflipEndColorFromSide(landedSide)),
      isVideoPlaying: false,
      lastResults: [result, ...args.lastResults].slice(0, 40),
      resultAnnouncement: {
        id: result.id,
        message: landedSide === 'HEADS' ? 'Heads.' : 'Tails.',
      },
    });
  };

  const handlePlaybackError = () => {
    const startColor =
      pendingFlipRef.current?.startColor ?? getCoinflipStoryStartColor(args.videoSrc);
    pendingFlipRef.current = null;
    updateArgs({
      videoSrc: getCoinflipIdleVideoSrc(startColor),
      isVideoPlaying: false,
    });
  };

  const updateBetAmount = (factor: number) => {
    const value = Number.parseFloat(args.betAmount);
    if (!Number.isNaN(value)) updateArgs({ betAmount: (value * factor).toFixed(2) });
  };

  const fieldsDisabled = args.fieldsDisabled || args.isVideoPlaying;
  const config = {
    shell: {
      mode: args.mode,
      onModeChange: (mode) => updateArgs({ mode }),
      tabsDisabled: args.tabsDisabled || args.isVideoPlaying,
      autobetSession: {
        state: args.autobetSessionState,
        totalWagered: args.autobetTotalWagered,
        netProfit: args.autobetNetProfit,
        winRate: args.autobetWinRate,
      },
      manualActionLabel: args.manualActionLabel,
      autoActionLabel: args.autoActionLabel,
      autoActionVariant: args.autoActionVariant,
      manualActionDisabled: args.manualActionDisabled,
      manualActionPending: args.isVideoPlaying,
      autoActionDisabled:
        args.autoActionDisabled ||
        (args.isVideoPlaying && args.autoActionVariant !== 'stop'),
      theatreMode: args.theatreMode,
      onManualAction: () => flipToSide(args.side),
      onAutoAction: () => undefined,
    },
    betAmount: {
      value: args.betAmount,
      onChange: (betAmount) => updateArgs({ betAmount }),
      conversionText: '0.000145 BTC',
      tooltip: coinflipStoryBetAmountTooltip,
      currencyIcon: coinflipStoryCurrencyIcon,
      isLoading: args.betAmountLoading,
      error: args.betAmountError || undefined,
      thresholdWarning: args.showBetAmountThresholdWarning
        ? {
            title: args.betAmountThresholdTitle,
            description: args.betAmountThresholdDescription,
          }
        : null,
      quickActions: [
        { label: '½', onClick: () => updateBetAmount(0.5) },
        { label: '2x', onClick: () => updateBetAmount(2) },
      ],
    },
    rounds: {
      value: args.rounds,
      onChange: (rounds) => updateArgs({ rounds }),
      error: args.roundsError || undefined,
    },
    fieldsDisabled,
    selectSide: {
      value: args.side,
      onChange: (side) => updateArgs({ side }),
      options: coinflipStorySelectSideOptions,
      labels: { title: 'Select Side' },
    },
    turboMode: {
      checked: args.turboMode,
      onCheckedChange: (turboMode) => updateArgs({ turboMode }),
    },
    stopConditions: {
      labels: coinflipStoryStopConditionsLabels,
      onWinValue: args.onWinValue,
      onLossValue: args.onLossValue,
      stopProfitValue: args.stopProfitValue,
      stopLossValue: args.stopLossValue,
      isActiveOnWin: args.isActiveOnWin,
      isActiveOnLoss: args.isActiveOnLoss,
      onWinChange: (onWinValue) => updateArgs({ onWinValue }),
      onLossChange: (onLossValue) => updateArgs({ onLossValue }),
      onStopProfitChange: (stopProfitValue) => updateArgs({ stopProfitValue }),
      onStopLossChange: (stopLossValue) => updateArgs({ stopLossValue }),
      onWinToggle: (isActiveOnWin) => updateArgs({ isActiveOnWin }),
      onLossToggle: (isActiveOnLoss) => updateArgs({ isActiveOnLoss }),
    },
  } satisfies CoinflipConfigProps;
  const board = {
    videoSrc: args.videoSrc,
    isVideoPlaying: args.isVideoPlaying,
    onVideoEnd: handleVideoEnd,
    onPlaybackError: handlePlaybackError,
    reducedMotion: args.reducedMotion,
    theatreMode: args.theatreMode,
    turboMode: args.turboMode,
    volume: args.volume,
    lastResults: args.lastResults,
    lastResultsAssets: coinflipStoryLastResultsAssets,
    lastResultsLabels: coinflipStoryLastResultsLabels,
    lastResultsAriaLabel: coinflipStoryLastResultsAriaLabel,
    resultAnnouncement: args.resultAnnouncement,
    overlay: (
      <GameWinModal
        open={args.showWinModal}
        title="You win!"
        multiplierLabel="Multiplier"
        multiplier={args.winMultiplier}
        formattedWinAmount={args.winAmount}
        currencyIcon={coinflipStoryWinCurrencyIcon}
      />
    ),
  } satisfies CoinflipBoardProps;

  return (
    <div
      className={cn(
        'bg-ds-black p-ds-4 md:p-ds-8 w-full',
        args.theatreMode ? 'h-dvh' : 'min-h-screen',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 flex-col',
          args.theatreMode ? 'h-full max-w-[1750px]' : 'max-w-[1400px]',
        )}
      >
        <OriginalsGameShell
          header={
            <GameHeader
              title="Coinflip"
              onBackClick={() => undefined}
              showVolumeControl
              volume={args.volume}
              onVolumeChange={(volume) => updateArgs({ volume })}
              isTheatreMode={args.theatreMode}
              onTheatreToggle={() => updateArgs({ theatreMode: !args.theatreMode })}
            />
          }
          config={
            <CoinflipConfig
              shell={config.shell}
              betAmount={config.betAmount}
              rounds={config.rounds}
              stopConditions={config.stopConditions}
              fieldsDisabled={config.fieldsDisabled}
              selectSide={config.selectSide}
              turboMode={config.turboMode}
            />
          }
          board={
            <CoinflipBoard
              videoSrc={board.videoSrc}
              isVideoPlaying={board.isVideoPlaying}
              onVideoEnd={board.onVideoEnd}
              onPlaybackError={board.onPlaybackError}
              reducedMotion={board.reducedMotion}
              theatreMode={board.theatreMode}
              turboMode={board.turboMode}
              volume={board.volume}
              lastResults={board.lastResults}
              lastResultsAssets={board.lastResultsAssets}
              lastResultsLabels={board.lastResultsLabels}
              lastResultsAriaLabel={board.lastResultsAriaLabel}
              resultAnnouncement={board.resultAnnouncement}
              overlay={board.overlay}
            />
          }
          theatreMode={args.theatreMode}
        />
      </div>
    </div>
  );
}

const defaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1.00',
  side: 'HEADS',
  reducedMotion: false,
  turboMode: false,
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  theatreMode: false,
  volume: 0.75,
  betAmountError: '',
  showBetAmountThresholdWarning: false,
  betAmountThresholdTitle: 'High payout warning',
  betAmountThresholdDescription: 'This bet exceeds the recommended payout threshold.',
  roundsError: '',
  autobetSessionState: 'ready-to-start',
  autobetTotalWagered: '$0.00',
  autobetNetProfit: '$0.00',
  autobetWinRate: '0%',
  onWinValue: 50,
  onLossValue: 50,
  stopProfitValue: '',
  stopLossValue: '',
  isActiveOnWin: false,
  isActiveOnLoss: false,
  videoSrc: COINFLIP_DEFAULT_VIDEO_SRC,
  isVideoPlaying: false,
  lastResults: coinflipStoryLastResults,
  showWinModal: false,
  winMultiplier: 'x2.00',
  winAmount: '2.00',
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Coinflip/Coinflip Composition',
  render: CoinflipCompositionStory,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'mode',
        'tabsDisabled',
        'fieldsDisabled',
        'betAmountLoading',
        'betAmount',
        'side',
        'reducedMotion',
        'turboMode',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'theatreMode',
        'volume',
        'betAmountError',
        'showBetAmountThresholdWarning',
        'betAmountThresholdTitle',
        'betAmountThresholdDescription',
        'roundsError',
        'autobetSessionState',
        'autobetTotalWagered',
        'autobetNetProfit',
        'autobetWinRate',
        'showWinModal',
        'winMultiplier',
        'winAmount',
      ],
    },
  },
  argTypes: {
    mode: {
      control: { type: 'inline-radio' },
      options: ['manual', 'auto'],
    },
    tabsDisabled: { control: { type: 'boolean' } },
    fieldsDisabled: { control: { type: 'boolean' } },
    betAmountLoading: { control: { type: 'boolean' } },
    betAmount: { control: { type: 'text' } },
    side: {
      control: { type: 'inline-radio' },
      options: ['HEADS', 'TAILS'],
    },
    reducedMotion: { control: { type: 'boolean' } },
    turboMode: { control: { type: 'boolean' } },
    rounds: { control: { type: 'text' } },
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: {
      control: { type: 'select' },
      options: ['start', 'stop', 'retry'],
    },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    betAmountError: { control: { type: 'text' } },
    showBetAmountThresholdWarning: { control: { type: 'boolean' } },
    betAmountThresholdTitle: { control: { type: 'text' } },
    betAmountThresholdDescription: { control: { type: 'text' } },
    roundsError: { control: { type: 'text' } },
    autobetSessionState: {
      control: { type: 'select' },
      options: [
        'live',
        'paused',
        'complete',
        'insufficient-balance',
        'interrupted',
        'awaiting-bets',
        'ready-to-start',
      ],
    },
    autobetTotalWagered: { control: { type: 'text' } },
    autobetNetProfit: { control: { type: 'text' } },
    autobetWinRate: { control: { type: 'text' } },
    showWinModal: { control: { type: 'boolean' } },
    winMultiplier: { control: { type: 'text' } },
    winAmount: { control: { type: 'text' } },
  },
  args: defaultArgs,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop' } },
  args: { theatreMode: true },
};

export const AutobetRunning: Story = {
  args: {
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    turboMode: true,
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    manualActionDisabled: true,
    autobetSessionState: 'live',
    autobetTotalWagered: '$1,250.00',
    autobetNetProfit: '+$320.50',
    autobetWinRate: '62%',
  },
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
};

export const WithWinModal: Story = {
  args: { showWinModal: true },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
};
