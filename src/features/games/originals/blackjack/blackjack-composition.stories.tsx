'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { BlackjackConfig } from '#ui/features/games/originals/blackjack/blackjack-config/blackjack-config';
import { BlackjackConfigExamples } from '#ui/features/games/originals/blackjack/blackjack-config-examples/blackjack-config-examples';
import {
  blackjackStoryBetAmountTooltip,
  blackjackStoryCurrencyIcon,
  blackjackStoryLabels,
} from '#ui/features/games/originals/blackjack/blackjack-story-helpers';
import {
  BlackjackProvider,
  useBlackjackGame,
} from '#ui/features/games/originals/blackjack/blackjack-session-context';
import {
  playBlackjackSound,
  preloadBlackjackSounds,
  setBlackjackSoundsVolume,
  stopBlackjackSounds,
  type BlackjackSoundName,
} from '#ui/features/games/originals/blackjack/blackjack-sounds';
import { BlackjackTable } from '#ui/features/games/originals/blackjack/blackjack-table';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

interface PlaygroundArgs {
  amount: string;
  theatreMode: boolean;
  volume: number;
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

/**
 * Playground wired to the ported betstrike session (context + table + card).
 * Deal cascade, flips, hit/stand/double/split/insurance/dealer reveal match
 * legacy blackjack-context / blackjack-table from 125c36de (pre-6052c4f52).
 *
 * Must stay under BlackjackProvider. Storybook preview hooks (useArgs) stay in
 * BlackjackCompositionStory — they cannot run in nested components.
 */
function BlackjackPlaygroundInner({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  const game = useBlackjackGame();

  const {
    startGame,
    customStartGame,
    setBetAmount,
    hit,
    stand,
    doubleDown,
    split,
    insuranceOffered,
    setInsuranceAccepted,
    canSplit,
    isSplitDone,
    isGameOver,
    isFirstRoundEnded,
    isBtnActivated,
    isGameRunning,
    betHistory,
    handResults,
  } = game;

  const volumeRef = useRef(args.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const prevInsuranceOfferedRef = useRef(false);
  const prevSplitDoneRef = useRef(false);
  const prevNaturalBlackjackRef = useRef(false);
  volumeRef.current = args.volume;

  const playSound = (name: BlackjackSoundName) => {
    const audio = playBlackjackSound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  useEffect(() => {
    preloadBlackjackSounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      stopBlackjackSounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setBlackjackSoundsVolume(activeSoundsRef.current, args.volume);
  }, [args.volume]);

  useEffect(() => {
    if (insuranceOffered && !prevInsuranceOfferedRef.current) {
      playSound('insurance');
    }
    prevInsuranceOfferedRef.current = insuranceOffered;
  }, [insuranceOffered]);

  useEffect(() => {
    if (isSplitDone && !prevSplitDoneRef.current) {
      playSound('split');
    }
    prevSplitDoneRef.current = isSplitDone;
  }, [isSplitDone]);

  useEffect(() => {
    const isNatural = handResults.includes('blackjack');
    if (isNatural && !prevNaturalBlackjackRef.current) {
      playSound('blackjack');
    }
    prevNaturalBlackjackRef.current = isNatural;
  }, [handResults]);

  const stake = Number.parseFloat(args.amount);
  const canStart =
    !isGameRunning && Number.isFinite(stake) && stake > 0 && stake <= 1_000_000;

  useEffect(() => {
    if (Number.isFinite(stake) && stake > 0) {
      setBetAmount(stake);
    }
  }, [stake, setBetAmount]);

  const lastBet = betHistory[betHistory.length - 1];
  // Same rule as live session: any winning hand (incl. split with net <= 0) opens the modal.
  const lastBetWon = Boolean(lastBet && (lastBet.isPlayerWin || lastBet.winAmount > 0));
  const showWinModal = Boolean(isGameOver && lastBetWon);
  const winAmount = lastBet && lastBetWon
    ? (lastBet.isPlayerWin ? lastBet.handsWinAmount : lastBet.winAmount).toFixed(2)
    : '0.00';
  const netProfit = lastBet?.winAmount ?? 0;
  const profitLabel = `${netProfit < 0 ? '-' : '+'}${Math.abs(netProfit).toFixed(2)}`;

  const actionsLocked =
    !isGameRunning || !isFirstRoundEnded || insuranceOffered || isGameOver;

  const actions = useMemo(
    () => [
      {
        id: 'hit',
        label: blackjackStoryLabels.hit,
        disabled: actionsLocked || isBtnActivated,
        onClick: hit,
      },
      {
        id: 'stand',
        label: blackjackStoryLabels.stand,
        disabled: actionsLocked || isBtnActivated,
        onClick: stand,
      },
      {
        id: 'double',
        label: blackjackStoryLabels.double,
        disabled: actionsLocked || isBtnActivated || isSplitDone,
        onClick: doubleDown,
      },
      {
        id: 'split',
        label: blackjackStoryLabels.split,
        disabled: actionsLocked || isBtnActivated || !canSplit,
        onClick: split,
      },
    ],
    [
      actionsLocked,
      isBtnActivated,
      isSplitDone,
      canSplit,
      hit,
      stand,
      doubleDown,
      split,
    ],
  );

  const updateAmount = (factor: number) => {
    if (isGameRunning) return;
    if (!Number.isNaN(stake)) {
      updateArgs({ amount: (stake * factor).toFixed(2) });
    }
  };

  const deal = () => {
    if (!canStart) return;
    setBetAmount(stake);
    startGame();
  };

  return (
    <div
      className={cn(
        'bg-ds-black px-ds-4 py-ds-2 md:px-ds-8 md:py-ds-4 w-full',
        args.theatreMode ? 'h-dvh' : 'min-h-screen',
      )}
    >
      <TheatreModeSync
        theatreMode={args.theatreMode}
        onExitTheatre={() => updateArgs({ theatreMode: false })}
      />
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 flex-col',
          args.theatreMode ? 'h-full max-w-[1750px]' : 'max-w-[1400px]',
        )}
      >
        <div className={cn(args.theatreMode && 'flex min-h-0 flex-1 flex-col')}>
        <OriginalsGameShell
          header={
            <GameHeader
              title="Blackjack"
              onBackClick={() => undefined}
              showVolumeControl
              volume={args.volume}
              onVolumeChange={(volume) => updateArgs({ volume })}
              isTheatreMode={args.theatreMode}
              onTheatreToggle={() => updateArgs({ theatreMode: !args.theatreMode })}
            />
          }
          config={
            <BlackjackConfig
              amount={args.amount}
              onAmountChange={(amount) => {
                if (!isGameRunning) updateArgs({ amount });
              }}
              amountLabel={blackjackStoryLabels.amountLabel}
              amountTooltip={blackjackStoryBetAmountTooltip}
              currencyIcon={blackjackStoryCurrencyIcon}
              amountQuickActions={[
                { label: '1/2', onClick: () => updateAmount(0.5) },
                { label: '2x', onClick: () => updateAmount(2) },
              ]}
              startLabel={blackjackStoryLabels.startLabel}
              onStart={deal}
              startDisabled={!canStart}
              playing={isGameRunning}
              insurance={
                insuranceOffered
                  ? {
                      label: blackjackStoryLabels.insuranceTerms,
                      acceptLabel: blackjackStoryLabels.insuranceAccept,
                      declineLabel: blackjackStoryLabels.insuranceDecline,
                      onChoose: (accepted) => setInsuranceAccepted(accepted),
                    }
                  : null
              }
              actions={actions}
            />
          }
          board={
            <BlackjackTable
              theatreMode={args.theatreMode}
              demoNotice={blackjackStoryLabels.demoNotice}
              volume={args.volume}
              overlay={
                <GameWinModal
                  open={showWinModal}
                  title="You win!"
                  multiplierLabel="Profit"
                  multiplier={showWinModal ? profitLabel : winAmount}
                  formattedWinAmount={winAmount}
                  currencyIcon={blackjackStoryCurrencyIcon}
                volume={args.volume}
                />
              }
            />
          }
          theatreMode={args.theatreMode}
        />
        </div>
        {/* Horizontal test scenarios under board + config; hidden in theatre mode. */}
        {!args.theatreMode && (
          <BlackjackConfigExamples
            layout="horizontal"
            className="mt-2 shrink-0"
            disabled={isGameRunning}
            onScenario={(playerCards, dealerCards) => {
              if (!canStart) return;
              setBetAmount(stake);
              customStartGame(playerCards, dealerCards);
            }}
          />
        )}
      </div>
    </div>
  );
}

function BlackjackCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();

  return (
    <BlackjackProvider>
      <BlackjackPlaygroundInner args={args} updateArgs={updateArgs} />
    </BlackjackProvider>
  );
}

const defaultArgs = {
  amount: '10.00',
  theatreMode: false,
  volume: 0.75,
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Composition',
  render: BlackjackCompositionStory,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['amount', 'theatreMode', 'volume'],
    },
  },
  argTypes: {
    amount: { control: { type: 'text' } },
    theatreMode: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
  args: defaultArgs,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: { theatreMode: true },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
