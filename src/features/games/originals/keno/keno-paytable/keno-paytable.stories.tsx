'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { KenoPaytable } from './keno-paytable';
import type { KenoPaytableProps } from './keno-paytable.types';

import {
  createKenoStoryPaytableItems,
  getKenoStoryPaytableItemAriaLabel,
  KENO_STORY_MAX_PICKS,
  kenoStoryHitsIconSrc,
  kenoStoryPaytableEmptyLabel,
} from '#ui/features/games/originals/keno/keno-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function getStorySelectedCount(args: KenoPaytableProps): number {
  if (args.empty) return 0;
  return Math.max(args.items.length - 1, 0);
}

function KenoPaytablePlayground(args: KenoPaytableProps) {
  const [, updateArgs] = useArgs<KenoPaytableProps>();
  const selectedCount = getStorySelectedCount(args);

  const setSelectedCount = (nextCount: number) => {
    const clampedCount = Math.min(KENO_STORY_MAX_PICKS, Math.max(0, nextCount));

    updateArgs({
      empty: clampedCount === 0,
      items: createKenoStoryPaytableItems(Math.max(clampedCount, 1)),
      reachedHits:
        args.reachedHits == null ? null : Math.min(args.reachedHits, clampedCount),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <KenoPaytable
        items={args.items}
        reachedHits={args.reachedHits}
        empty={args.empty}
        emptyLabel={args.emptyLabel}
        hitsIconSrc={args.hitsIconSrc}
        theatreMode={args.theatreMode}
        reducedMotion={args.reducedMotion}
        aria-label={args['aria-label']}
        getItemAriaLabel={args.getItemAriaLabel}
        className={args.className}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={selectedCount <= 0}
          onClick={() => {
            setSelectedCount(selectedCount - 1);
          }}
        >
          Remove cell
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={selectedCount >= KENO_STORY_MAX_PICKS}
          onClick={() => {
            setSelectedCount(selectedCount + 1);
          }}
        >
          Add cell
        </Button>
        <Typography as="p" kind="secondary-12-400" className="m-0">
          Selected cells: {selectedCount}
        </Typography>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Paytable',
  component: KenoPaytable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['empty', 'reachedHits', 'theatreMode', 'reducedMotion'],
    },
  },
  decorators: [
    (Story) => (
      <div className="ds-keno-surface-max mx-auto w-full">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    empty: { control: { type: 'boolean' } },
    reachedHits: { control: { type: 'number', min: 0, max: 10, step: 1 } },
    theatreMode: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    items: { control: false },
    emptyLabel: { control: false },
    hitsIconSrc: { control: false },
    getItemAriaLabel: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    items: createKenoStoryPaytableItems(1),
    reachedHits: 0,
    empty: false,
    emptyLabel: kenoStoryPaytableEmptyLabel,
    hitsIconSrc: kenoStoryHitsIconSrc,
    theatreMode: false,
    reducedMotion: false,
    'aria-label': 'Keno paytable',
    getItemAriaLabel: getKenoStoryPaytableItemAriaLabel,
  },
} satisfies Meta<typeof KenoPaytable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: KenoPaytablePlayground,
};

export const Empty: Story = {
  args: {
    empty: true,
    reachedHits: null,
  },
};

export const FourHits: Story = {
  args: {
    empty: false,
    items: createKenoStoryPaytableItems(9),
    reachedHits: 4,
  },
};
