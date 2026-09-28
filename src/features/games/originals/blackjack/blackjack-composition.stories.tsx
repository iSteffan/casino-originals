'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { BlackjackBoard } from '#ui/features/games/originals/blackjack/blackjack-board/blackjack-board';
import { BlackjackConfig } from '#ui/features/games/originals/blackjack/blackjack-config/blackjack-config';
import {
  actBlackjack,
  type BlackjackAction,
  type BlackjackState,
  chooseBlackjackInsurance,
  createBlackjackDemoDeck,
  startBlackjackDemo,
} from '#ui/features/games/originals/blackjack/blackjack-engine';
import {
  blackjackStoryBetAmountTooltip,
  blackjackStoryCurrencyIcon,
  blackjackStoryLabels,
  buildBlackjackBoardFromState,
  canStartBlackjackDemo,
  EMPTY_BLACKJACK,
  getBlackjackStoryActionItems,
  isBlackjackPlaying,
} from '#ui/features/games/originals/blackjack/blackjack-story-helpers';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

interface PlaygroundArgs {
  amount: string;
  game: BlackjackState;
  round: number;
  theatreMode: boolean;
  volume: number;
  showWinModal: boolean;
  winAmount: string;
}

function BlackjackCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const playing = isBlackjackPlaying(args.game);
  const canStart = canStartBlackjackDemo(args.game, Number(args.amount));
  const board = buildBlackjackBoardFromState(args.game, args.round);

  const updateAmount = (factor: number) => {
    if (playing) return;
    const value = Number.parseFloat(args.amount);
    if (!Number.isNaN(value)) {
      updateArgs({ amount: (value * factor).toFixed(2) });
    }
  };

  const deal = () => {
    if (!canStartBlackjackDemo(args.game, Number(args.amount))) return;
    const nextGame = startBlackjackDemo(
      createBlackjackDemoDeck(),
      Number(args.amount),
    );
    const finished = nextGame.phase === 'finished';
    updateArgs({
      game: nextGame,
      round: args.round + 1,
      showWinModal: finished && nextGame.profit > 0,
      winAmount: finished ? Math.max(0, nextGame.profit).toFixed(2) : '0.00',
    });
  };

  const chooseInsurance = (accepted: boolean) => {
    const nextGame = chooseBlackjackInsurance(args.game, accepted);
    if (nextGame === args.game) return;
    const finished = nextGame.phase === 'finished';
    updateArgs({
      game: nextGame,
      showWinModal: finished && nextGame.profit > 0,
      winAmount: finished ? Math.max(0, nextGame.profit).toFixed(2) : '0.00',
    });
  };

  const act = (action: BlackjackAction) => {
    const nextGame = actBlackjack(args.game, action);
    if (nextGame === args.game) return;
    const finished = nextGame.phase === 'finished';
    updateArgs({
      game: nextGame,
      showWinModal: finished && nextGame.profit > 0,
      winAmount: finished ? Math.max(0, nextGame.profit).toFixed(2) : '0.00',
    });
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
                if (!playing) updateArgs({ amount });
              }}
              amountLabel={blackjackStoryLabels.amountLabel}
              amountTooltip={blackjackStoryBetAmountTooltip}
              currencyIcon={blackjackStoryCurrencyIcon}
              amountQuickActions={[
                { label: '½', onClick: () => updateAmount(0.5) },
                { label: '2x', onClick: () => updateAmount(2) },
              ]}
              startLabel={blackjackStoryLabels.startLabel}
              onStart={deal}
              startDisabled={!canStart}
              playing={playing}
              insurance={
                args.game.phase === 'insurance'
                  ? {
                      label: blackjackStoryLabels.insuranceTerms,
                      acceptLabel: blackjackStoryLabels.insuranceAccept,
                      declineLabel: blackjackStoryLabels.insuranceDecline,
                      onChoose: chooseInsurance,
                    }
                  : null
              }
              actions={getBlackjackStoryActionItems(args.game, act)}
            />
          }
          board={
            <BlackjackBoard
              {...board}
              theatreMode={args.theatreMode}
              announcement={args.showWinModal ? '' : board.announcement}
              overlay={
                <GameWinModal
                  open={args.showWinModal}
                  title="You win!"
                  multiplierLabel="Profit"
                  multiplier={
                    args.game.profit > 0
                      ? `+${args.game.profit.toFixed(2)}`
                      : args.winAmount
                  }
                  formattedWinAmount={args.winAmount}
                  currencyIcon={blackjackStoryCurrencyIcon}
                />
              }
            />
          }
          theatreMode={args.theatreMode}
        />
      </div>
    </div>
  );
}

const defaultArgs = {
  amount: '10.00',
  game: EMPTY_BLACKJACK,
  round: 0,
  theatreMode: false,
  volume: 0.75,
  showWinModal: false,
  winAmount: '0.00',
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Composition',
  render: BlackjackCompositionStory,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['amount', 'theatreMode', 'volume', 'showWinModal', 'winAmount'],
    },
  },
  argTypes: {
    amount: { control: { type: 'text' } },
    theatreMode: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    showWinModal: { control: { type: 'boolean' } },
    winAmount: { control: { type: 'text' } },
    game: { control: false },
    round: { control: false },
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

export const WithWinModal: Story = {
  args: {
    showWinModal: true,
    winAmount: '15.00',
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
