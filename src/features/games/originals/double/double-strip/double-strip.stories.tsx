'use client';

import { useEffect, useRef } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DoubleStrip } from './double-strip';
import type { DoubleStripProps } from './double-strip.types';

import { DOUBLE_PHASE_DURATION_MS } from '#ui/features/games/originals/double/double.constants';
import { rollDoubleTileIndex } from '#ui/features/games/originals/double/double-engine';
import { Button } from '#ui/primitives/actions/button/button';

type UpdateArgs = (patch: Partial<DoubleStripProps>) => void;

function DoubleStripPlayground({
  args,
  updateArgs,
}: {
  args: DoubleStripProps;
  updateArgs: UpdateArgs;
}) {
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const roll = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    updateArgs({ phase: 'LOCKED' });
    const nextTile = rollDoubleTileIndex();
    timersRef.current = [
      window.setTimeout(() => updateArgs({ phase: 'RESOLVING', tileIndex: nextTile }), 50),
      window.setTimeout(() => updateArgs({ phase: 'FINISHED' }), 50 + args.rollDurationMs),
    ];
  };

  return (
    <div className="ds-double-board flex w-full flex-col gap-6 rounded-ds-md py-6">
      <DoubleStrip
        phase={args.phase}
        tileIndex={args.tileIndex}
        rollDurationMs={args.rollDurationMs}
        reducedMotion={args.reducedMotion}
        className={args.className}
      />
      <div className="flex justify-center gap-2">
        <Button type="button" onClick={roll} disabled={args.phase === 'RESOLVING'}>
          Roll
        </Button>
        <Button type="button" variant="secondary" onClick={() => updateArgs({ phase: 'BETTING' })}>
          Reset
        </Button>
      </div>
    </div>
  );
}

/** Storybook preview hooks only; timers live in the playground component. */
function DoubleStripStory() {
  const [args, updateArgs] = useArgs<DoubleStripProps>();
  return <DoubleStripPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Double/Double Strip',
  component: DoubleStrip,
  render: DoubleStripStory,
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
    tileIndex: { control: { type: 'range', min: 0, max: 13, step: 1 } },
    rollDurationMs: { control: { type: 'number' } },
    reducedMotion: { control: { type: 'boolean' } },
    className: { control: false },
  },
  args: {
    phase: 'BETTING',
    tileIndex: 0,
    rollDurationMs: DOUBLE_PHASE_DURATION_MS.RESOLVING,
    reducedMotion: false,
  },
} satisfies Meta<typeof DoubleStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rolling: Story = {
  args: { phase: 'LOCKED', tileIndex: 4 },
};

export const Result: Story = {
  args: { phase: 'FINISHED', tileIndex: 11 },
};
