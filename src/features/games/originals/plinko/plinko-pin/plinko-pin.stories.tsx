'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoPin } from './plinko-pin';
import type { PlinkoPinProps } from './plinko-pin.types';

import { createPlinkoStoryEventId } from '#ui/features/games/originals/plinko/plinko-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';

type UpdateArgs = (patch: Partial<PlinkoPinProps>) => void;

function PlinkoPinPlayground({
  args,
  updateArgs,
}: {
  args: PlinkoPinProps;
  updateArgs: UpdateArgs;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-ds-black rounded-ds-sm grid size-24 place-items-center">
        <div className="relative size-2.5">
          <PlinkoPin hitEventId={args.hitEventId} reducedMotion={args.reducedMotion} />
        </div>
      </div>

      <Button
        type="button"
        onClick={() => updateArgs({ hitEventId: createPlinkoStoryEventId('plinko-pin-hit') })}
      >
        Ping pin
      </Button>
    </div>
  );
}

/** Storybook preview hooks only. */
function PlinkoPinStory() {
  const [args, updateArgs] = useArgs<PlinkoPinProps>();
  return <PlinkoPinPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Pin',
  component: PlinkoPin,
  render: PlinkoPinStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: { include: ['reducedMotion'] },
  },
  argTypes: {
    hitEventId: { control: false },
    reducedMotion: { control: { type: 'boolean' } },
    className: { control: false },
  },
  args: {
    reducedMotion: false,
  },
} satisfies Meta<typeof PlinkoPin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Hit: Story = {
  args: { hitEventId: 'plinko-pin-hit-initial' },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
};
