'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoLastResults } from './plinko-last-results';
import type { PlinkoLastResultsProps } from './plinko-last-results.types';

import { OriginalsLastResultsDecorator } from '#ui/features/games/originals/originals-last-results-decorator';
import { rollPlinkoBucket } from '#ui/features/games/originals/plinko/plinko-engine';
import {
  createPlinkoStoryLastResultAtIndex,
  getPlinkoStoryMultipliers,
  plinkoStoryLastResults,
  plinkoStoryLastResultsAriaLabel,
} from '#ui/features/games/originals/plinko/plinko-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';

type UpdateArgs = (patch: Partial<PlinkoLastResultsProps>) => void;

const STORY_MULTIPLIERS = getPlinkoStoryMultipliers(16, 'high');

function PlinkoLastResultsPlayground({
  args,
  updateArgs,
}: {
  args: PlinkoLastResultsProps;
  updateArgs: UpdateArgs;
}) {
  const dropBall = () => {
    const item = createPlinkoStoryLastResultAtIndex(STORY_MULTIPLIERS, rollPlinkoBucket(16));
    if (item) updateArgs({ items: [item, ...args.items].slice(0, 20) });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PlinkoLastResults
        items={args.items}
        className={args.className}
        aria-label={args['aria-label']}
      />
      <div className="flex items-center gap-2">
        <Button type="button" onClick={dropBall}>
          Drop ball
        </Button>
        <Button type="button" variant="secondary" onClick={() => updateArgs({ items: [] })}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function PlinkoLastResultsStory() {
  const [args, updateArgs] = useArgs<PlinkoLastResultsProps>();
  return <PlinkoLastResultsPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Last Results',
  component: PlinkoLastResults,
  render: PlinkoLastResultsStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  decorators: [OriginalsLastResultsDecorator],
  argTypes: {
    items: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    items: plinkoStoryLastResults,
    'aria-label': plinkoStoryLastResultsAriaLabel,
  },
} satisfies Meta<typeof PlinkoLastResults>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: {
    items: [],
  },
};
