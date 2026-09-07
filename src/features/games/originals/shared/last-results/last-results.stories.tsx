'use client';

import { useCallback, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LastResults } from './last-results';
import type { LastResultsFlow } from './last-results.types';

import { Button } from '#ui/primitives/actions/button/button';

interface DemoItem {
  id: string;
  label: string;
  color: string;
}

const palette = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777'];

function createDemoItem(index: number): DemoItem {
  return {
    id: `result-${index}-${Date.now()}`,
    label: `x${(Math.random() * 9 + 1).toFixed(2)}`,
    color: palette[index % palette.length] ?? palette[0]!,
  };
}

interface PlaygroundArgs {
  flow: LastResultsFlow;
  withLead: boolean;
  gap: number;
  duration: number;
  initialCount: number;
}

function LastResultsPlayground({
  flow,
  withLead,
  gap,
  duration,
  initialCount,
}: PlaygroundArgs) {
  const [items, setItems] = useState<DemoItem[]>(() =>
    Array.from({ length: initialCount }, (_, index) => createDemoItem(index)),
  );
  const [counter, setCounter] = useState(initialCount);

  const addItem = useCallback(() => {
    setCounter((value) => value + 1);
    setItems((prev) => [createDemoItem(counter), ...prev].slice(0, 40));
  }, [counter]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <LastResults
        items={items}
        getItemKey={(item) => item.id}
        flow={flow}
        gap={gap}
        duration={duration}
        lead={
          withLead ? (
            <div className="bg-ds-gray-700 rounded-ds-xs text-ds-text-secondary text-ds-xxs flex size-4 items-center justify-center">
              ?
            </div>
          ) : undefined
        }
        renderItem={(item) => (
          <div
            className="rounded-ds-xs text-ds-xxs font-ds-medium text-ds-text-white flex h-5 min-w-12 items-center justify-center px-1.5"
            style={{ backgroundColor: item.color }}
          >
            {item.label}
          </div>
        )}
        aria-label="Last results"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={addItem}>
          Add result
        </Button>
        <Button type="button" variant="secondary" onClick={clearItems}>
          Clear
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Last Results',
  component: LastResultsPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['flow', 'withLead', 'gap', 'duration', 'initialCount'],
    },
  },
  argTypes: {
    flow: {
      control: { type: 'inline-radio' },
      options: ['toward-end', 'toward-start'],
    },
    withLead: { control: { type: 'boolean' } },
    gap: { control: { type: 'number', min: 0, max: 24, step: 2 } },
    duration: { control: { type: 'number', min: 0.15, max: 1, step: 0.05 } },
    initialCount: { control: { type: 'number', min: 0, max: 8, step: 1 } },
  },
  args: {
    flow: 'toward-end',
    withLead: false,
    gap: 8,
    duration: 0.3,
    initialCount: 3,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TowardEndWithLead: Story = {
  args: {
    flow: 'toward-end',
    withLead: true,
    initialCount: 4,
  },
};

export const TowardStart: Story = {
  args: {
    flow: 'toward-start',
    withLead: false,
    initialCount: 5,
  },
};
