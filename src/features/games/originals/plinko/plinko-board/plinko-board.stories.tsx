'use client';

import { useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoBoard } from './plinko-board';
import type {
  PlinkoBallDrop,
  PlinkoBallLandEvent,
  PlinkoResultAnnouncement,
} from './plinko-board.types';

import { PLINKO_ROW_COUNTS } from '#ui/features/games/originals/plinko/plinko.constants';
import { rollPlinkoBucket } from '#ui/features/games/originals/plinko/plinko-engine';
import type { PlinkoLastResultItem } from '#ui/features/games/originals/plinko/plinko-last-results/plinko-last-results.types';
import {
  createPlinkoStoryEventId,
  createPlinkoStoryLastResult,
  getPlinkoStoryMultipliers,
  PLINKO_STORY_DEFAULT_RISK,
  PLINKO_STORY_DEFAULT_ROWS,
  plinkoStoryLastResults,
  plinkoStoryLastResultsAriaLabel,
  plinkoStoryRiskOptions,
} from '#ui/features/games/originals/plinko/plinko-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';

interface PlaygroundArgs {
  risk: string;
  rows: number;
  turboMode: boolean;
  reducedMotion: boolean;
  theatreMode: boolean;
  showLastResults: boolean;
}

/**
 * Pegs + buckets + ball flights. Buckets are rolled with the demo engine (binomial),
 * then the board animates a betstrike hop path to that bucket.
 */
function PlinkoBoardPlayground({ args }: { args: PlaygroundArgs }) {
  const multipliers = getPlinkoStoryMultipliers(args.rows, args.risk);
  const [drops, setDrops] = useState<PlinkoBallDrop[]>([]);
  const [lastResults, setLastResults] = useState<PlinkoLastResultItem[]>(
    args.showLastResults ? plinkoStoryLastResults : [],
  );
  const [resultAnnouncement, setResultAnnouncement] = useState<PlinkoResultAnnouncement>();
  const dropsRef = useRef<PlinkoBallDrop[]>([]);

  const queueDrops = (count: number) => {
    const next = Array.from({ length: count }, () => ({
      id: createPlinkoStoryEventId('plinko-board-drop'),
      bucketIndex: rollPlinkoBucket(args.rows),
    }));
    dropsRef.current = [...dropsRef.current, ...next].slice(-40);
    setDrops(dropsRef.current);
  };

  const handleBallLand = (event: PlinkoBallLandEvent) => {
    dropsRef.current = dropsRef.current.filter((drop) => drop.id !== event.id);
    setDrops(dropsRef.current);
    const result = createPlinkoStoryLastResult(event.multiplier, event.color);
    setLastResults((current) => [result, ...current].slice(0, 20));
    setResultAnnouncement({ id: result.id, message: `Landed ${event.multiplier}x.` });
  };

  return (
    <div
      className={
        args.theatreMode
          ? 'flex h-[calc(100dvh-2rem)] w-full min-w-0 flex-col gap-4'
          : 'mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-4'
      }
    >
      <PlinkoBoard
        rows={args.rows}
        multipliers={multipliers}
        lastResults={args.showLastResults ? lastResults : []}
        lastResultsAriaLabel={plinkoStoryLastResultsAriaLabel}
        resultAnnouncement={resultAnnouncement}
        drops={drops}
        onBallLand={handleBallLand}
        turboMode={args.turboMode}
        reducedMotion={args.reducedMotion}
        theatreMode={args.theatreMode}
        className={args.theatreMode ? 'min-h-0 flex-1' : undefined}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => queueDrops(1)}>
          Drop ball
        </Button>
        <Button type="button" variant="secondary" onClick={() => queueDrops(10)}>
          Drop 10 balls
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setLastResults([]);
            setResultAnnouncement(undefined);
          }}
        >
          Clear results
        </Button>
      </div>
    </div>
  );
}

/** Storybook preview hooks only; React state lives in PlinkoBoardPlayground. */
function PlinkoBoardStory() {
  const [args] = useArgs<PlaygroundArgs>();
  // Remount on geometry change so in-flight story drops reset with the board.
  return <PlinkoBoardPlayground key={`${args.risk}-${args.rows}`} args={args} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Board',
  component: PlinkoBoard,
  render: PlinkoBoardStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: {
      include: ['risk', 'rows', 'turboMode', 'reducedMotion', 'theatreMode', 'showLastResults'],
    },
  },
  argTypes: {
    risk: {
      control: { type: 'inline-radio' },
      options: plinkoStoryRiskOptions.map((option) => option.value),
    },
    rows: { control: { type: 'select' }, options: [...PLINKO_ROW_COUNTS] },
    turboMode: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    showLastResults: { control: { type: 'boolean' } },
  },
  args: {
    risk: PLINKO_STORY_DEFAULT_RISK,
    rows: PLINKO_STORY_DEFAULT_ROWS,
    turboMode: false,
    reducedMotion: false,
    theatreMode: false,
    showLastResults: true,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const EightRowsLowRisk: Story = {
  args: { rows: 8, risk: 'low' },
};

export const TwelveRows: Story = {
  args: { rows: 12 },
};

export const SixteenRowsHighRisk: Story = {
  args: { rows: 16, risk: 'high' },
};

export const TurboMode: Story = {
  args: { turboMode: true },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: { theatreMode: true },
};
