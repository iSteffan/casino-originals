'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DiceLastResults } from './dice-last-results';
import type {
  DiceLastResultColor,
  DiceLastResultsProps,
} from './dice-last-results.types';

import {
  createDiceStoryLastResult,
  diceStoryLastResults,
  diceStoryLastResultsAriaLabel,
  diceStoryLastResultsAssets,
  diceStoryLastResultsLabels,
} from '#ui/features/games/originals/dice/dice-story-helpers';
import { OriginalsLastResultsDecorator } from '#ui/features/games/originals/originals-last-results-decorator';
import { Button } from '#ui/primitives/actions/button/button';

function randomDiceResult() {
  const value = Math.random() * 94 + 3;
  const color: DiceLastResultColor = Math.random() > 0.5 ? 'green' : 'red';
  return createDiceStoryLastResult(value, color);
}

function DiceLastResultsPlayground() {
  const [args, updateArgs] = useArgs<DiceLastResultsProps>();

  return (
    <div className="flex w-full flex-col gap-4">
      <DiceLastResults
        items={args.items}
        assets={args.assets}
        labels={args.labels}
        className={args.className}
        aria-label={args['aria-label']}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() =>
            updateArgs({ items: [randomDiceResult(), ...args.items].slice(0, 40) })
          }
        >
          Roll
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => updateArgs({ items: [] })}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Last Results',
  component: DiceLastResults,
  render: DiceLastResultsPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
  decorators: [OriginalsLastResultsDecorator],
  argTypes: {
    items: { control: false },
    assets: { control: false },
    labels: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    items: diceStoryLastResults,
    assets: diceStoryLastResultsAssets,
    labels: diceStoryLastResultsLabels,
    'aria-label': diceStoryLastResultsAriaLabel,
  },
} satisfies Meta<typeof DiceLastResults>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const Narrow: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
