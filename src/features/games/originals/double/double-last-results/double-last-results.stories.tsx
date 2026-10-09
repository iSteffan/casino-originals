'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DoubleLastResults } from './double-last-results';
import type { DoubleLastResultsProps } from './double-last-results.types';

import { DOUBLE_LAST_RESULTS_LIMIT } from '#ui/features/games/originals/double/double.constants';
import {
  getDoubleTile,
  rollDoubleTileIndex,
} from '#ui/features/games/originals/double/double-engine';
import {
  createDoubleStoryHistoryItem,
  doubleStoryLast100Stats,
  doubleStoryLastResults,
  doubleStoryLastResultsAriaLabel,
} from '#ui/features/games/originals/double/double-story-helpers';
import { OriginalsLastResultsDecorator } from '#ui/features/games/originals/originals-last-results-decorator';
import { Button } from '#ui/primitives/actions/button/button';

type UpdateArgs = (patch: Partial<DoubleLastResultsProps>) => void;

function DoubleLastResultsPlayground({
  args,
  updateArgs,
}: {
  args: DoubleLastResultsProps;
  updateArgs: UpdateArgs;
}) {
  const roll = () => {
    const item = createDoubleStoryHistoryItem(getDoubleTile(rollDoubleTileIndex()));
    const color = item.color.toLowerCase() as 'red' | 'black' | 'green';
    updateArgs({
      items: [item, ...args.items].slice(0, DOUBLE_LAST_RESULTS_LIMIT),
      stats: {
        ...args.stats,
        [color]: args.stats[color] + 1,
        joker: args.stats.joker + (item.hasJoker ? 1 : 0),
      },
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <DoubleLastResults
        items={args.items}
        stats={args.stats}
        labels={args.labels}
        className={args.className}
        aria-label={args['aria-label']}
      />
      <div className="flex items-center gap-2">
        <Button type="button" onClick={roll}>
          Roll
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => updateArgs({ items: [], stats: { red: 0, black: 0, green: 0, joker: 0 } })}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

/** Storybook preview hooks only. */
function DoubleLastResultsStory() {
  const [args, updateArgs] = useArgs<DoubleLastResultsProps>();
  return <DoubleLastResultsPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Double/Double Last Results',
  component: DoubleLastResults,
  render: DoubleLastResultsStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  decorators: [OriginalsLastResultsDecorator],
  argTypes: {
    items: { control: false },
    stats: { control: 'object' },
    labels: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    items: doubleStoryLastResults,
    stats: doubleStoryLast100Stats,
    'aria-label': doubleStoryLastResultsAriaLabel,
  },
} satisfies Meta<typeof DoubleLastResults>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: { items: [], stats: { red: 0, black: 0, green: 0, joker: 0 } },
};
