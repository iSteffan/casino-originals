'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import {
  CoinflipLastResults,
  type CoinflipLastResultsProps,
} from './coinflip-last-results';

import {
  coinflipStoryLastResults,
  coinflipStoryLastResultsAriaLabel,
  coinflipStoryLastResultsAssets,
  coinflipStoryLastResultsLabels,
  createCoinflipStoryLastResult,
} from '#ui/features/games/originals/coinflip/coinflip-story-helpers';
import { OriginalsLastResultsDecorator } from '#ui/features/games/originals/originals-last-results-decorator';
import { Button } from '#ui/primitives/actions/button/button';

function CoinflipLastResultsPlayground() {
  const [args, updateArgs] = useArgs<CoinflipLastResultsProps>();

  const addResult = () => {
    const nextSide = args.items[0]?.side === 'HEADS' ? 'TAILS' : 'HEADS';
    updateArgs({
      items: [createCoinflipStoryLastResult(nextSide), ...args.items].slice(0, 40),
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <CoinflipLastResults
        items={args.items}
        assets={args.assets}
        labels={args.labels}
        className={args.className}
        aria-label={args['aria-label']}
      />
      <div className="flex items-center gap-2">
        <Button type="button" onClick={addResult}>
          Flip
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
  title: 'Features/Games/Originals/Coinflip/Coinflip Last Results',
  component: CoinflipLastResults,
  render: CoinflipLastResultsPlayground,
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
    items: coinflipStoryLastResults,
    assets: coinflipStoryLastResultsAssets,
    labels: coinflipStoryLastResultsLabels,
    'aria-label': coinflipStoryLastResultsAriaLabel,
  },
} satisfies Meta<typeof CoinflipLastResults>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const Narrow: Story = {
  globals: {
    viewport: { value: 'mobile1' },
  },
};
