'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoMultiplier } from './plinko-multiplier';
import type { PlinkoMultiplierProps } from './plinko-multiplier.types';

import { PLINKO_ROW_COUNTS } from '#ui/features/games/originals/plinko/plinko.constants';
import { getPlinkoMultiplierColors } from '#ui/features/games/originals/plinko/plinko-board/plinko-board.utils';
import { rollPlinkoBucket } from '#ui/features/games/originals/plinko/plinko-engine';
import {
  createPlinkoStoryEventId,
  getPlinkoStoryMultipliers,
  plinkoStoryRiskOptions,
} from '#ui/features/games/originals/plinko/plinko-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface PlaygroundArgs extends PlinkoMultiplierProps {
  risk: string;
  rows: number;
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

const DEFAULT_MULTIPLIERS = getPlinkoStoryMultipliers(16, 'medium');
const DEFAULT_COLORS = getPlinkoMultiplierColors(DEFAULT_MULTIPLIERS.length);

function PlinkoMultiplierPlayground({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <PlinkoMultiplier
        value={args.value}
        color={args.color}
        landEventId={args.landEventId}
        reducedMotion={args.reducedMotion}
      />

      <Button
        type="button"
        onClick={() => updateArgs({ landEventId: createPlinkoStoryEventId('plinko-land') })}
      >
        Land
      </Button>
    </div>
  );
}

/** Bucket row for one risk/rows paytable with a land (hit) highlight. */
function PlinkoBucketRow({ args }: { args: PlaygroundArgs }) {
  const multipliers = getPlinkoStoryMultipliers(args.rows, args.risk);
  const colors = getPlinkoMultiplierColors(multipliers.length);
  const [land, setLand] = useState<{ index: number; eventId: string } | null>(null);

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      <div className="flex max-w-full items-end gap-0.5 overflow-x-auto py-2">
        {multipliers.map((value, index) => (
          <PlinkoMultiplier
            key={`${args.risk}-${args.rows}-${index}`}
            value={value}
            color={colors[index] ?? ''}
            landEventId={land?.index === index ? land.eventId : undefined}
            reducedMotion={args.reducedMotion}
            className="shrink-0"
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() =>
            setLand({
              index: rollPlinkoBucket(args.rows),
              eventId: createPlinkoStoryEventId('plinko-row-land'),
            })
          }
        >
          Land random bucket
        </Button>
        <Typography kind="secondary-12-400" as="span">
          {land ? `Bucket ${land.index}: x${multipliers[land.index]}` : 'No landing yet'}
        </Typography>
      </div>
    </div>
  );
}

function PlinkoMultiplierStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  return <PlinkoMultiplierPlayground args={args} updateArgs={updateArgs} />;
}

function PlinkoBucketRowStory() {
  const [args] = useArgs<PlaygroundArgs>();
  return <PlinkoBucketRow args={args} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Multiplier',
  component: PlinkoMultiplier,
  render: PlinkoMultiplierStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: { include: ['value', 'reducedMotion'] },
  },
  argTypes: {
    value: { control: { type: 'number' } },
    color: { control: false },
    landEventId: { control: false },
    reducedMotion: { control: { type: 'boolean' } },
    className: { control: false },
    risk: {
      control: { type: 'inline-radio' },
      options: plinkoStoryRiskOptions.map((option) => option.value),
    },
    rows: { control: { type: 'select' }, options: [...PLINKO_ROW_COUNTS] },
  },
  args: {
    value: DEFAULT_MULTIPLIERS[0] ?? 0,
    color: DEFAULT_COLORS[0] ?? '',
    reducedMotion: false,
    risk: 'medium',
    rows: 16,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BucketRow: Story = {
  render: PlinkoBucketRowStory,
  parameters: {
    layout: 'padded',
    controls: { include: ['risk', 'rows', 'reducedMotion'] },
  },
};

export const LowRiskEightRows: Story = {
  render: PlinkoBucketRowStory,
  parameters: {
    layout: 'padded',
    controls: { include: ['risk', 'rows', 'reducedMotion'] },
  },
  args: { risk: 'low', rows: 8 },
};

export const HighRiskSixteenRows: Story = {
  render: PlinkoBucketRowStory,
  parameters: {
    layout: 'padded',
    controls: { include: ['risk', 'rows', 'reducedMotion'] },
  },
  args: { risk: 'high', rows: 16 },
};
