'use client';

import { useEffect, useMemo } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { RouletteOriginalsView } from './roulette-originals-view';
import {
  betsToRouletteFieldMap,
  formatRouletteMoney,
  historyToRouletteLastResults,
  rouletteStoryCellAssets,
  rouletteStoryChipOptions,
  rouletteStoryClearIconSrc,
  rouletteStoryLastResultsAssets,
  rouletteStoryUndoIconSrc,
  rouletteStoryWinCurrencyIcon,
} from './roulette-story-helpers';
import { useRouletteSession } from './use-roulette-session';

import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { cn } from '#ui/lib/cn';
import { useAppLayoutState } from '#ui/layouts/app-header/app-layout-provider';
import { shouldReduceMotion } from '#ui/lib/motion';

interface PlaygroundArgs {
  theatreMode: boolean;
  volume: number;
  reducedMotion: boolean;
  previewWidth?: string;
  previewHeight?: string;
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

function IconImg({ src }: { src: string }) {
  return <img src={src} alt="" width={16} height={16} className="size-4" />;
}

/**
 * React/session hooks live here. Storybook preview hooks (useArgs) must stay in
 * RouletteCompositionStory — same split as BlackjackCompositionStory.
 */
function RouletteCompositionPlayground({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  const { effectiveSideMenuExpanded } = useAppLayoutState();
  const reducedMotion = args.reducedMotion || shouldReduceMotion();
  const fieldCompact = effectiveSideMenuExpanded;
  const session = useRouletteSession({
    initialBalance: 1000,
    reducedMotion,
    resultHoldMs: reducedMotion ? 1200 : 2800,
  });
  const { state, setVolume } = session;

  useEffect(() => {
    setVolume(args.volume);
  }, [args.volume, setVolume]);
  const autoBetActive = state.remaining > 0;
  const fieldsDisabled = session.fieldsDisabled;
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: autoBetActive,
    startAutobetLabel: 'Start autobet',
  });

  const fieldBets = useMemo(() => betsToRouletteFieldMap(state.bets), [state.bets]);
  const lastResults = useMemo(
    () => historyToRouletteLastResults(state.history),
    [state.history],
  );

  const winRatePct =
    state.round === 0 ? 0 : Math.round((state.wins / state.round) * 100);

  const theatreLayoutActive = args.theatreMode;
  const undoIcon = <IconImg src={rouletteStoryUndoIconSrc} />;
  const clearIcon = <IconImg src={rouletteStoryClearIconSrc} />;
  const balanceDelta = state.balance - 1000;
  const netProfitLabel = `${balanceDelta >= 0 ? '+' : ''}${formatRouletteMoney(balanceDelta)}`;
  const totalLabel = `Stake ${formatRouletteMoney(session.totalStake)} | Balance ${formatRouletteMoney(state.balance)}`;

  return (
    <div
      className={cn(
        'bg-ds-black w-full',
        theatreLayoutActive ? 'h-dvh overflow-hidden' : 'min-h-screen',
      )}
      style={
        args.previewWidth || args.previewHeight
          ? {
              width: args.previewWidth,
              height: args.previewHeight,
              maxWidth: '100%',
            }
          : undefined
      }
    >
      <RouletteOriginalsView
        theatreMode={args.theatreMode}
        theatreModeActive={args.theatreMode}
        theatreLayoutActive={theatreLayoutActive}
        theatreSync={{
          theatreMode: args.theatreMode,
          onExitTheatre: () => updateArgs({ theatreMode: false }),
        }}
        header={{
          title: 'Roulette',
          volume: args.volume,
          isTheatreMode: args.theatreMode,
          onVolumeChange: (volume) => updateArgs({ volume }),
          onTheatreToggle: () => updateArgs({ theatreMode: !args.theatreMode }),
          onBackClick: () => undefined,
        }}
        config={{
          shell: {
            mode: state.mode,
            onModeChange: (mode: OriginalsConfigMode) => session.changeMode(mode),
            tabsDisabled: fieldsDisabled,
            theatreMode: args.theatreMode,
            manualTabLabel: 'Manual',
            autoTabLabel: 'Auto',
            manualActionLabel: state.spinning ? 'Spinning...' : 'Spin',
            autoActionLabel: autobetAction.label,
            autoActionVariant: autobetAction.variant as OriginalsConfigAutoActionVariant,
            manualActionDisabled: !session.canStartManualBet,
            manualActionPending: state.spinning && state.mode === 'manual',
            autoActionDisabled: autoBetActive ? false : !session.canStartAutoBet,
            onManualAction: session.startManualBet,
            onAutoAction: autoBetActive ? session.stopAutoBet : session.startAutoBet,
            autobetSession: {
              state: autoBetActive ? 'live' : 'ready-to-start',
              totalWagered: formatRouletteMoney(
                Math.max(0, 1000 - state.balance + session.totalStake),
              ),
              netProfit: netProfitLabel,
              winRate: `${winRatePct}%`,
            },
          },
          chips: rouletteStoryChipOptions,
          selectedChip: state.chip,
          onSelectChip: session.changeChip,
          onUndo: session.undo,
          onClear: session.clear,
          fieldsDisabled,
          totalLabel,
          rounds: state.rounds,
          onRoundsChange: session.changeRounds,
          undoIcon,
          clearIcon,
          labels: {
            chips: 'Chips',
            undo: 'Undo',
            clear: 'Clear',
            rounds: 'Number of Bets',
          },
        }}
        board={{
          lastResults: {
            items: lastResults,
            assets: rouletteStoryLastResultsAssets,
            label: 'Previous rolls',
          },
          wheel: {
            start: state.spinning && !reducedMotion,
            winningBet: state.winningBet,
            onSpinningEnd: session.onWheelSpinningEnd,
            spinLaps: 5,
            spinDuration: 5,
            spinEaseFunction: 'cubic-bezier(0.73, 0.03, 0.14, 0.96)',
            automaticSpinning: !reducedMotion,
          },
          field: {
            assets: rouletteStoryCellAssets,
            bets: fieldBets,
            highlightedNumbers: state.highlightedNumbers,
            winningNumber: state.result,
            disabled: fieldsDisabled,
            compact: fieldCompact,
            onCellClick: (cellId) => session.placeChip(cellId),
            onHoverNumbersChange: (numbers) => {
              if (state.spinning) return;
              session.setHighlightedNumbers([...numbers]);
            },
          },
        }}
        winOverlay={{
          open: state.showWinModal,
          title: 'You win',
          multiplierLabel: 'Multiplier',
          multiplier: state.winMultiplier,
          // Total payout (settle.payout), not net profit - matches Mines/Keno/Dice/Towers.
          formattedWinAmount: state.winAmount,
          currencyIcon: rouletteStoryWinCurrencyIcon,
          volume: args.volume,
          reducedMotion,
        }}
      />
    </div>
  );
}

/** Storybook preview hooks only — no React/session hooks here. */
function RouletteCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  return <RouletteCompositionPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Roulette/Roulette Composition',
  render: RouletteCompositionStory,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['theatreMode', 'volume', 'reducedMotion'],
    },
  },
  argTypes: {
    theatreMode: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    reducedMotion: { control: { type: 'boolean' } },
    previewWidth: { control: false },
    previewHeight: { control: false },
  },
  args: {
    theatreMode: false,
    volume: 0.75,
    reducedMotion: false,
  } satisfies PlaygroundArgs,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: { theatreMode: true },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
