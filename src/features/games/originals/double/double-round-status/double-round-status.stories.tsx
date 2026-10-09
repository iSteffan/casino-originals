'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DoubleRoundProgress, DoubleRoundStatus } from './double-round-status';
import type { DoubleRoundStatusProps } from './double-round-status.types';

import { DOUBLE_PHASE_DURATION_MS } from '#ui/features/games/originals/double/double.constants';
import { getDoubleTile, toDoubleOutcome } from '#ui/features/games/originals/double/double-engine';
import { Button } from '#ui/primitives/actions/button/button';

type UpdateArgs = (patch: Partial<DoubleRoundStatusProps>) => void;

function DoubleRoundStatusPlayground({
  args,
  updateArgs,
}: {
  args: DoubleRoundStatusProps;
  updateArgs: UpdateArgs;
}) {
  // Countdown target is set from the button (event handler), never during render.
  const [endsAt, setEndsAt] = useState(args.phaseEndsAt);

  const restart = () => {
    updateArgs({ phase: 'BETTING' });
    setEndsAt(Date.now() + args.bettingDurationMs);
  };

  return (
    <div className="ds-double-board flex w-full flex-col items-center gap-6 rounded-ds-md py-6">
      <DoubleRoundStatus
        phase={args.phase}
        phaseEndsAt={endsAt}
        bettingDurationMs={args.bettingDurationMs}
        outcome={args.outcome}
        labels={args.labels}
        className={args.className}
      />
      <DoubleRoundProgress
        phase={args.phase}
        phaseEndsAt={endsAt}
        bettingDurationMs={args.bettingDurationMs}
      />
      <Button type="button" onClick={restart}>
        Start countdown
      </Button>
    </div>
  );
}

/** Storybook preview hooks only. */
function DoubleRoundStatusStory() {
  const [args, updateArgs] = useArgs<DoubleRoundStatusProps>();
  return <DoubleRoundStatusPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Double/Double Round Status',
  component: DoubleRoundStatus,
  render: DoubleRoundStatusStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  argTypes: {
    phase: {
      control: { type: 'inline-radio' },
      options: ['BETTING', 'LOCKED', 'RESOLVING', 'FINISHED'],
    },
    phaseEndsAt: { control: false },
    bettingDurationMs: { control: { type: 'number' } },
    outcome: { control: false },
    labels: { control: false },
    className: { control: false },
  },
  args: {
    phase: 'BETTING',
    phaseEndsAt: 0,
    bettingDurationMs: DOUBLE_PHASE_DURATION_MS.BETTING,
    outcome: toDoubleOutcome(getDoubleTile(11)),
  },
} satisfies Meta<typeof DoubleRoundStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rolling: Story = {
  args: { phase: 'RESOLVING' },
};

export const Rolled: Story = {
  args: { phase: 'FINISHED' },
};
