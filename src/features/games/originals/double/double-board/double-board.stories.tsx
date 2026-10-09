'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DoubleBoard } from './double-board';

import { DOUBLE_PHASE_DURATION_MS } from '#ui/features/games/originals/double/double.constants';
import {
  doubleStoryLabels,
  doubleStoryLast100Stats,
  doubleStoryLastResults,
  doubleStoryLastResultsAriaLabel,
} from '#ui/features/games/originals/double/double-story-helpers';

/**
 * Static board states. The live round loop (countdown -> roll -> result) runs in
 * the Double Composition story through use-double-session.
 */
const meta = {
  title: 'Features/Games/Originals/Double/Double Board',
  component: DoubleBoard,
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
    phaseEndsAt: { control: false },
    bettingDurationMs: { control: false },
    rollDurationMs: { control: false },
    lastResults: { control: false },
    stats: { control: 'object' },
    statusLabels: { control: false },
    lastResultsLabels: { control: false },
    resultAnnouncement: { control: false },
    reducedMotion: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    className: { control: false },
  },
  args: {
    phase: 'BETTING',
    phaseEndsAt: 0,
    bettingDurationMs: DOUBLE_PHASE_DURATION_MS.BETTING,
    rollDurationMs: DOUBLE_PHASE_DURATION_MS.RESOLVING,
    tileIndex: 11,
    lastResults: doubleStoryLastResults,
    stats: doubleStoryLast100Stats,
    title: doubleStoryLabels.boardTitle,
    lastResultsAriaLabel: doubleStoryLastResultsAriaLabel,
    reducedMotion: false,
    theatreMode: false,
  },
} satisfies Meta<typeof DoubleBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rolling: Story = {
  args: { phase: 'LOCKED' },
};

export const Result: Story = {
  args: { phase: 'FINISHED' },
};

export const EmptyHistory: Story = {
  args: { lastResults: [], stats: { red: 0, black: 0, green: 0, joker: 0 } },
};
