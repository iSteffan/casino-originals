'use client';

import { useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MinesGridSize } from './mines-grid-size';

import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';
import { EmptyOptionLabelsMessage } from '#ui/features/games/originals/shared/empty-option-labels-message';
import { parseMinesGridOptionLabels } from '#ui/features/games/originals/shared/parse-option-labels.utils';

const defaultOptionLabels = '16, 25, 36, 64';

interface PlaygroundArgs {
  label: string;
  disabled: boolean;
  optionLabels: string;
}

function MinesGridSizePlayground({ label, disabled, optionLabels }: PlaygroundArgs) {
  const options = useMemo(() => parseMinesGridOptionLabels(optionLabels), [optionLabels]);
  const [selectedValue, setSelectedValue] = useState(options[0]?.value ?? 4);
  const value = options.some((option) => option.value === selectedValue)
    ? selectedValue
    : (options[0]?.value ?? 4);

  if (options.length === 0) {
    return <EmptyOptionLabelsMessage />;
  }

  return (
    <MinesGridSize
      label={label}
      value={value}
      onChange={setSelectedValue}
      options={options}
      disabled={disabled}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Mines/Mines Grid Size',
  component: MinesGridSize,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof MinesGridSize>;

export default meta;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['label', 'disabled', 'optionLabels'] },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    optionLabels: {
      control: { type: 'text' },
      description:
        'Comma-separated cell counts. Add or remove entries to update the group.',
    },
  },
  args: {
    label: 'Grid Size',
    disabled: false,
    optionLabels: defaultOptionLabels,
  },
  render: (args) => (
    <MinesGridSizePlayground
      label={args.label}
      disabled={args.disabled}
      optionLabels={args.optionLabels}
    />
  ),
};
