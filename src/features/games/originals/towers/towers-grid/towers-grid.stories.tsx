'use client';

import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef, useState } from 'storybook/preview-api';

import { TowersGrid } from './towers-grid';
import type { TowersGridProps, TowersResultAnnouncement } from './towers-grid.types';

import {
  acceptTowersStoryRowSelection,
  createTowersStoryIdleRows,
  createTowersStoryPlaygroundRows,
  createTowersStoryPreviewRows,
  getTowersStoryBombAnnouncementMessage,
  getTowersStoryGridConfig,
  getTowersStoryPickOutcome,
  getTowersStoryTopReachedAnnouncementMessage,
  TOWERS_PLAYGROUND_NEXT_ROW_DELAY_MS,
  TOWERS_STORY_EASY,
  TOWERS_STORY_HARD,
  TOWERS_STORY_MEDIUM,
  towersStoryBoardAriaLabel,
  towersStoryCellAssets,
  towersStoryCellAssetsCompact,
} from '#ui/features/games/originals/towers/towers-story-helpers';
import { shouldReduceMotion } from '#ui/lib/motion';
import { Button } from '#ui/primitives/actions/button/button';

interface PlaygroundArgs extends TowersGridProps {
  columns: 2 | 3;
  bombsPerRow: 1 | 2;
}

function TowersGridTheatreFrame({
  theatreMode,
  children,
}: {
  theatreMode?: boolean;
  children: ReactNode;
}) {
  if (!theatreMode) return children;

  return <div className="h-[min(80dvh,42rem)] min-h-0 w-full">{children}</div>;
}

function renderStaticGrid(
  config: Parameters<typeof createTowersStoryPreviewRows>[0],
  args: PlaygroundArgs,
) {
  return (
    <TowersGridTheatreFrame theatreMode={args.theatreMode}>
      <TowersGrid
        rows={createTowersStoryPreviewRows(config)}
        assets={towersStoryCellAssets}
        mobileAssets={towersStoryCellAssetsCompact}
        theatreMode={args.theatreMode}
        reducedMotion={args.reducedMotion}
        aria-label={towersStoryBoardAriaLabel}
      />
    </TowersGridTheatreFrame>
  );
}

const meta = {
  title: 'Features/Games/Originals/Towers/Towers Grid',
  component: TowersGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['theatreMode', 'reducedMotion'],
    },
  },
  argTypes: {
    rows: { control: false },
    assets: { control: false },
    mobileAssets: { control: false },
    onCellClick: { control: false },
    className: { control: false },
    'aria-label': { control: false },
    resultAnnouncement: { control: false },
    theatreMode: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    columns: { control: false },
    bombsPerRow: { control: false },
  },
  args: {
    rows: createTowersStoryIdleRows(TOWERS_STORY_EASY),
    assets: towersStoryCellAssets,
    mobileAssets: towersStoryCellAssetsCompact,
    theatreMode: false,
    reducedMotion: false,
    columns: 3,
    bombsPerRow: 1,
    'aria-label': towersStoryBoardAriaLabel,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {
  argTypes: {
    columns: {
      control: { type: 'inline-radio' },
      options: [2, 3],
    },
    bombsPerRow: {
      control: { type: 'inline-radio' },
      options: [1, 2],
    },
  },
  parameters: {
    controls: {
      include: ['columns', 'bombsPerRow', 'theatreMode', 'reducedMotion'],
    },
  },
  render: function TowersGridPlayground() {
    const [args] = useArgs<PlaygroundArgs>();
    const [picks, setPicks] = useState<Record<number, number>>({});
    const [activeRowIndex, setActiveRowIndex] = useState(0);
    const [resultAnnouncement, setResultAnnouncement] = useState<
      TowersResultAnnouncement | undefined
    >(undefined);
    const announcementSeqRef = useRef(0);
    const advanceTimerRef = useRef<number | undefined>(undefined);
    const acceptedRowsRef = useRef(new Set<number>());
    const config = getTowersStoryGridConfig(args.columns, args.bombsPerRow);
    const effectiveReducedMotion = args.reducedMotion || shouldReduceMotion();

    const announceResult = (message: string) => {
      announcementSeqRef.current += 1;
      setResultAnnouncement({
        id: String(announcementSeqRef.current),
        message,
      });
    };

    useEffect(() => {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
      setPicks({});
      acceptedRowsRef.current.clear();
      setActiveRowIndex(0);
      setResultAnnouncement(undefined);
    }, [args.columns, args.bombsPerRow]);

    useEffect(() => {
      return () => {
        window.clearTimeout(advanceTimerRef.current);
      };
    }, []);

    const resetPlayground = () => {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
      setPicks({});
      acceptedRowsRef.current.clear();
      setActiveRowIndex(0);
      setResultAnnouncement(undefined);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <TowersGridTheatreFrame theatreMode={args.theatreMode}>
          <TowersGrid
            rows={createTowersStoryPlaygroundRows(config, picks, activeRowIndex, true)}
            assets={towersStoryCellAssets}
            mobileAssets={towersStoryCellAssetsCompact}
            theatreMode={args.theatreMode}
            reducedMotion={effectiveReducedMotion}
            aria-label={towersStoryBoardAriaLabel}
            resultAnnouncement={resultAnnouncement}
            onCellClick={(rowIndex, colIndex) => {
              if (rowIndex !== activeRowIndex) return;

              if (!acceptTowersStoryRowSelection(acceptedRowsRef.current, rowIndex)) {
                return;
              }
              setPicks((current) => ({ ...current, [rowIndex]: colIndex }));
              const outcome = getTowersStoryPickOutcome(rowIndex, colIndex, config);

              if (outcome === 'bomb') {
                announceResult(getTowersStoryBombAnnouncementMessage(rowIndex));
                return;
              }

              if (outcome === 'top') {
                announceResult(getTowersStoryTopReachedAnnouncementMessage());
                return;
              }

              window.clearTimeout(advanceTimerRef.current);
              advanceTimerRef.current = window.setTimeout(
                () => {
                  advanceTimerRef.current = undefined;
                  setActiveRowIndex((current) =>
                    current === rowIndex ? Math.min(rowIndex + 1, config.rows) : current,
                  );
                },
                effectiveReducedMotion ? 0 : TOWERS_PLAYGROUND_NEXT_ROW_DELAY_MS,
              );
            }}
          />
        </TowersGridTheatreFrame>
        <Button type="button" variant="ghost" onClick={resetPlayground}>
          Reset
        </Button>
      </div>
    );
  },
};

export const TwoColumns: Story = {
  name: '2 columns',
  args: {
    columns: 2,
    bombsPerRow: 1,
  },
  render: (args) => renderStaticGrid(TOWERS_STORY_MEDIUM, args),
};

export const ThreeColumns: Story = {
  name: '3 columns',
  argTypes: {
    bombsPerRow: {
      control: { type: 'inline-radio' },
      options: [1, 2],
    },
  },
  parameters: {
    controls: {
      include: ['theatreMode', 'reducedMotion', 'bombsPerRow'],
    },
  },
  args: {
    columns: 3,
    bombsPerRow: 1,
  },
  render: (args) =>
    renderStaticGrid(
      args.bombsPerRow === 2 ? TOWERS_STORY_HARD : TOWERS_STORY_EASY,
      args,
    ),
};
