'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef } from 'storybook/preview-api';

import { DiceCube } from './dice-cube';
import type { DiceCubeAnimationDirection, DiceCubeMarkerState } from './dice-cube.types';
import { DICE_CUBE_ANIMATION_DURATION_MS } from './dice-cube.utils';

import { shouldReduceMotion } from '#ui/lib/motion';
import { Button } from '#ui/primitives/actions/button/button';

interface PlaygroundArgs {
  markerValue: number;
  markerState: DiceCubeMarkerState;
  isAnimating: boolean;
  animationDirection: DiceCubeAnimationDirection;
  reducedMotion: boolean;
}

function DiceCubePlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current !== null) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const toss = (direction: DiceCubeAnimationDirection, outcome: DiceCubeMarkerState) => {
    if (args.isAnimating) return;

    if (settleTimeoutRef.current !== null) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }

    const settle = () => {
      updateArgs({
        isAnimating: false,
        markerState: outcome,
      });
      settleTimeoutRef.current = null;
    };

    if (args.reducedMotion || shouldReduceMotion()) {
      updateArgs({
        markerState: outcome,
        isAnimating: false,
        animationDirection: direction,
      });
      return;
    }

    updateArgs({
      markerState: 'play',
      isAnimating: true,
      animationDirection: direction,
    });

    settleTimeoutRef.current = setTimeout(settle, DICE_CUBE_ANIMATION_DURATION_MS);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="dice-board-play-area rounded-ds-md relative h-[280px] w-full overflow-visible">
        <DiceCube
          markerValue={args.markerValue}
          markerState={args.markerState}
          isAnimating={args.isAnimating}
          animationDirection={args.animationDirection}
          reducedMotion={args.reducedMotion}
        />
      </div>
      <div className="flex w-full items-stretch gap-2">
        <Button
          type="button"
          size="md"
          className="bg-ds-error-500 text-ds-black hover:bg-ds-error-600 hover:text-ds-black min-w-0 flex-1"
          onClick={() => toss('left', 'lose')}
          disabled={args.isAnimating}
        >
          Toss left → lose
        </Button>
        <Button
          type="button"
          size="md"
          variant="gray"
          className="min-w-0 flex-1"
          onClick={() => updateArgs({ markerState: 'play' })}
          disabled={args.isAnimating}
        >
          Reset color
        </Button>
        <Button
          type="button"
          size="md"
          className="min-w-0 flex-1"
          onClick={() => toss('right', 'win')}
          disabled={args.isAnimating}
        >
          Toss right → win
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Cube',
  render: DiceCubePlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'markerValue',
        'markerState',
        'isAnimating',
        'animationDirection',
        'reducedMotion',
      ],
    },
  },
  argTypes: {
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
  },
  args: {
    markerValue: 50,
    markerState: 'play',
    isAnimating: false,
    animationDirection: 'right',
    reducedMotion: false,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
    markerState: 'win',
  },
};

export const Win: Story = {
  args: {
    markerState: 'win',
  },
};

export const Lose: Story = {
  args: {
    markerState: 'lose',
  },
};
