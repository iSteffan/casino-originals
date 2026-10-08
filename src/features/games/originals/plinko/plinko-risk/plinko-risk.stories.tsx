'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoRisk } from './plinko-risk';

import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';
import { plinkoStoryRiskLabels } from '#ui/features/games/originals/plinko/plinko-story-helpers';
import { EmptyOptionLabelsMessage } from '#ui/features/games/originals/shared/empty-option-labels-message';
import { parseStringOptionLabels } from '#ui/features/games/originals/shared/parse-option-labels.utils';

const defaultOptionLabels = 'Low Risk, Medium Risk, High Risk';

interface PlaygroundArgs {
  disabled: boolean;
  optionLabels: string;
}

function PlinkoRiskPlayground({ args }: { args: PlaygroundArgs }) {
  const options = parseStringOptionLabels(args.optionLabels);
  const [selected, setSelected] = useState<string>(options[0]?.value ?? '0');
  // Keep the selection valid when option labels are edited in controls.
  const value = options.some((option) => option.value === selected)
    ? selected
    : (options[0]?.value ?? '0');

  if (options.length === 0) {
    return <EmptyOptionLabelsMessage />;
  }

  return (
    <PlinkoRisk
      value={value}
      onChange={setSelected}
      options={options}
      labels={plinkoStoryRiskLabels}
      disabled={args.disabled}
    />
  );
}

/** Storybook preview hooks only. */
function PlinkoRiskStory() {
  const [args] = useArgs<PlaygroundArgs>();
  return <PlinkoRiskPlayground args={args} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Risk',
  component: PlinkoRisk,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' }, appHeader: false },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
    labels: { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof PlinkoRisk>;

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
  render: PlinkoRiskStory,
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
  render: PlinkoRiskStory,
};
