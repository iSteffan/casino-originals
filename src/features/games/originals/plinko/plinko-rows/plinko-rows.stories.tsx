'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoRows } from './plinko-rows';

import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';
import { plinkoStoryRowsLabels } from '#ui/features/games/originals/plinko/plinko-story-helpers';
import { EmptyOptionLabelsMessage } from '#ui/features/games/originals/shared/empty-option-labels-message';
import { parseNumericOptionLabels } from '#ui/features/games/originals/shared/parse-option-labels.utils';

const defaultOptionLabels = '8, 9, 10, 11, 12, 13, 14, 15, 16';

interface PlaygroundArgs {
  disabled: boolean;
  optionLabels: string;
}

function PlinkoRowsPlayground({ args }: { args: PlaygroundArgs }) {
  const options = parseNumericOptionLabels(args.optionLabels);
  const [selected, setSelected] = useState<number>(options[0]?.value ?? 8);
  // Keep the selection valid when option labels are edited in controls.
  const value = options.some((option) => option.value === selected)
    ? selected
    : (options[0]?.value ?? 8);

  if (options.length === 0) {
    return <EmptyOptionLabelsMessage />;
  }

  return (
    <PlinkoRows
      value={value}
      onChange={setSelected}
      options={options}
      labels={plinkoStoryRowsLabels}
      disabled={args.disabled}
    />
  );
}

/** Storybook preview hooks only. */
function PlinkoRowsStory() {
  const [args] = useArgs<PlaygroundArgs>();
  return <PlinkoRowsPlayground args={args} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Rows',
  component: PlinkoRows,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' }, appHeader: false },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
    labels: { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof PlinkoRows>;

export default meta;

const playgroundArgTypes = {
  disabled: { control: { type: 'boolean' } },
  optionLabels: {
    control: { type: 'text' },
    description: 'Comma-separated option labels. Add or remove entries to update the group.',
  },
} as const;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['disabled', 'optionLabels'] },
  },
  argTypes: playgroundArgTypes,
  args: {
    disabled: false,
    optionLabels: defaultOptionLabels,
  },
  render: PlinkoRowsStory,
};

export const Disabled: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['disabled', 'optionLabels'] },
  },
  argTypes: playgroundArgTypes,
  args: {
    disabled: true,
    optionLabels: defaultOptionLabels,
  },
  render: PlinkoRowsStory,
};
