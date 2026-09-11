'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef } from 'storybook/preview-api';

import { DiceBoard } from './dice-board';
import type { DiceBoardDirection, DiceResultAnnouncement } from './dice-board.types';

import {
  getDiceStoryResultColor,
  isDiceStoryWin,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.story-math';
import type {
  DiceCubeAnimationDirection,
  DiceCubeMarkerState,
} from '#ui/features/games/originals/dice/dice-cube/dice-cube.types';
import { DICE_CUBE_ANIMATION_DURATION_MS } from '#ui/features/games/originals/dice/dice-cube/dice-cube.utils';
import type {
  DiceLastResultItem,
  DiceLastResultsAssets,
  DiceLastResultsLabels,
} from '#ui/features/games/originals/dice/dice-last-results/dice-last-results.types';
import {
  createDiceStoryLastResult,
  diceStoryBoardLabels,
  diceStoryLastResults,
  diceStoryLastResultsAriaLabel,
  diceStoryLastResultsAssets,
  diceStoryLastResultsLabels,
  diceStoryWinCurrencyIcon,
  diceStoryWinModalContentClassName,
} from '#ui/features/games/originals/dice/dice-story-helpers';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { shouldReduceMotion } from '#ui/lib/motion';
import { Button } from '#ui/primitives/actions/button/button';

interface PlaygroundArgs {
  displayValue: number;
  rolledNumber: number;
  markerValue: number | null;
  markerState: DiceCubeMarkerState;
  isAnimating: boolean;
  animationDirection: DiceCubeAnimationDirection;
  reducedMotion: boolean;
  lastResults: DiceLastResultItem[];
  lastResultsAssets: DiceLastResultsAssets;
  lastResultsLabels: DiceLastResultsLabels;
  lastResultsAriaLabel: string;
  resultAnnouncement?: DiceResultAnnouncement;
  sliderDisabled: boolean;
  direction: DiceBoardDirection;
  showSliderValueLabel: boolean;
  theatreMode: boolean;
  className?: string;
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
}

function DiceBoardPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResultsRef = useRef(args.lastResults);

  useEffect(() => {
    lastResultsRef.current = args.lastResults;
  }, [args.lastResults]);

  useEffect(
    () => () => {
      if (settleTimeoutRef.current !== null) {
        clearTimeout(settleTimeoutRef.current);
      }
    },
    [],
  );

  const clearSettleTimeout = () => {
    if (settleTimeoutRef.current !== null) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  const simulateRoll = (targetValue: number) => {
    if (args.isAnimating) return;

    clearSettleTimeout();

    const threshold = args.displayValue;
    const prev = args.markerValue ?? threshold;
    const isWin = isDiceStoryWin(targetValue, threshold, args.direction);
    const animationDirection: DiceCubeAnimationDirection =
      targetValue > prev ? 'right' : 'left';

    const settle = () => {
      const result = createDiceStoryLastResult(targetValue, isWin ? 'green' : 'red');
      updateArgs({
        isAnimating: false,
        markerState: (isWin ? 'win' : 'lose') satisfies DiceCubeMarkerState,
        lastResults: [result, ...lastResultsRef.current].slice(0, 40),
        resultAnnouncement: {
          id: result.id,
          message: `${targetValue.toFixed(2)}. ${isWin ? 'Win' : 'Loss'}.`,
        },
        showWinModal: isWin,
      });
      settleTimeoutRef.current = null;
    };

    if (args.reducedMotion || shouldReduceMotion()) {
      const result = createDiceStoryLastResult(targetValue, isWin ? 'green' : 'red');
      updateArgs({
        markerState: (isWin ? 'win' : 'lose') satisfies DiceCubeMarkerState,
        isAnimating: false,
        animationDirection,
        rolledNumber: targetValue,
        markerValue: targetValue,
        lastResults: [result, ...lastResultsRef.current].slice(0, 40),
        resultAnnouncement: {
          id: result.id,
          message: `${targetValue.toFixed(2)}. ${isWin ? 'Win' : 'Loss'}.`,
        },
        showWinModal: isWin,
      });
      return;
    }

    updateArgs({
      markerState: 'play',
      isAnimating: true,
      animationDirection,
      rolledNumber: targetValue,
      markerValue: targetValue,
      resultAnnouncement: undefined,
      showWinModal: false,
    });

    settleTimeoutRef.current = setTimeout(settle, DICE_CUBE_ANIMATION_DURATION_MS);
  };

  const addResult = () => {
    const value = Math.random() * 94 + 3;
    const color = getDiceStoryResultColor(value, args.displayValue, args.direction);
    const result = createDiceStoryLastResult(value, color);
    updateArgs({
      lastResults: [result, ...lastResultsRef.current].slice(0, 40),
      resultAnnouncement: {
        id: result.id,
        message: `${value.toFixed(2)}. ${color === 'green' ? 'Win' : 'Loss'}.`,
      },
    });
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4">
      <DiceBoard
        displayValue={args.displayValue}
        rolledNumber={args.rolledNumber}
        markerValue={args.markerValue}
        markerState={args.markerState}
        isAnimating={args.isAnimating}
        animationDirection={args.animationDirection}
        reducedMotion={args.reducedMotion}
        labels={diceStoryBoardLabels}
        lastResults={args.lastResults}
        lastResultsAssets={args.lastResultsAssets}
        lastResultsLabels={args.lastResultsLabels}
        lastResultsAriaLabel={args.lastResultsAriaLabel}
        resultAnnouncement={args.showWinModal ? undefined : args.resultAnnouncement}
        sliderValue={args.displayValue}
        onSliderValueChange={(value) => updateArgs({ displayValue: value })}
        sliderDisabled={args.sliderDisabled || args.isAnimating}
        direction={args.direction}
        showSliderValueLabel={args.showSliderValueLabel}
        theatreMode={args.theatreMode}
        overlay={
          <GameWinModal
            open={args.showWinModal}
            title="You win!"
            multiplierLabel="Multiplier"
            multiplier={args.winMultiplier}
            formattedWinAmount={args.winAmount}
            currencyIcon={diceStoryWinCurrencyIcon}
            contentClassName={diceStoryWinModalContentClassName}
          />
        }
        className={args.className}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => simulateRoll(Math.random() * 94 + 3)}
          disabled={args.isAnimating}
        >
          Roll
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={addResult}
          disabled={args.isAnimating}
        >
          Add result
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => updateArgs({ lastResults: [] })}
        >
          Clear results
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Board',
  render: DiceBoardPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'displayValue',
        'rolledNumber',
        'markerValue',
        'markerState',
        'isAnimating',
        'animationDirection',
        'direction',
        'reducedMotion',
        'sliderDisabled',
        'theatreMode',
        'showWinModal',
        'winMultiplier',
        'winAmount',
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-ds-black rounded-ds-md p-ds-4 w-full min-w-0">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    displayValue: {
      control: { type: 'range', min: 3, max: 97, step: 0.01 },
    },
    rolledNumber: {
      control: { type: 'range', min: 0, max: 100, step: 0.01 },
    },
    markerValue: { control: { type: 'range', min: 0, max: 100, step: 0.01 } },
    markerState: {
      control: { type: 'inline-radio' },
      options: ['play', 'win', 'lose'],
    },
    isAnimating: { control: { type: 'boolean' } },
    animationDirection: {
      control: { type: 'inline-radio' },
      options: ['left', 'right'],
    },
    reducedMotion: { control: { type: 'boolean' } },
    direction: {
      control: { type: 'inline-radio' },
      options: ['UNDER', 'OVER'] satisfies DiceBoardDirection[],
    },
    sliderDisabled: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    showWinModal: { control: { type: 'boolean' } },
    winMultiplier: { control: { type: 'text' } },
    winAmount: { control: { type: 'text' } },
    lastResults: { control: false },
    lastResultsAssets: { control: false },
    lastResultsLabels: { control: false },
    lastResultsAriaLabel: { control: false },
    resultAnnouncement: { control: false },
    showSliderValueLabel: { control: false },
    className: { control: false },
  },
  args: {
    displayValue: 50,
    rolledNumber: 42.18,
    markerValue: 42.18,
    markerState: 'win',
    isAnimating: false,
    animationDirection: 'right',
    reducedMotion: false,
    direction: 'UNDER',
    sliderDisabled: false,
    showSliderValueLabel: true,
    theatreMode: false,
    lastResults: diceStoryLastResults,
    lastResultsAssets: diceStoryLastResultsAssets,
    lastResultsLabels: diceStoryLastResultsLabels,
    lastResultsAriaLabel: diceStoryLastResultsAriaLabel,
    showWinModal: false,
    winMultiplier: 'x1.96',
    winAmount: '1,960.00',
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WaitingForFirstRoll: Story = {
  args: {
    rolledNumber: 0,
    markerValue: null,
    markerState: 'play',
    lastResults: [],
  },
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
};

export const TheatreMode: Story = {
  args: {
    theatreMode: true,
  },
  decorators: [
    (Story) => (
      <div className="bg-ds-black rounded-ds-md p-ds-4 flex h-[720px] w-full min-w-0 flex-col">
        <Story />
      </div>
    ),
  ],
};
