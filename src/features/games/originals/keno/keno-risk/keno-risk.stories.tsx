'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useState } from 'storybook/preview-api';

import { KenoRisk } from './keno-risk';

import { kenoStoryRiskLabels } from '#ui/features/games/originals/keno/keno-story-helpers';
import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';
import { EmptyOptionLabelsMessage } from '#ui/features/games/originals/shared/empty-option-labels-message';
import { parseStringOptionLabels } from '#ui/features/games/originals/shared/parse-option-labels.utils';

const defaultOptionLabels = 'Classic Risk, Low Risk, Medium Risk, High Risk';
const localizedOptions = [
  { value: 'classic', label: 'Riesgo clásico', shortLabel: 'Clásico' },
  { value: 'low', label: 'Riesgo bajo', shortLabel: 'Bajo' },
  { value: 'medium', label: 'Riesgo medio', shortLabel: 'Medio' },
  { value: 'high', label: 'Riesgo alto', shortLabel: 'Alto' },
] as const;

interface PlaygroundArgs {
  disabled: boolean;
  optionLabels: string;
}

function KenoRiskPlayground() {
  const [args] = useArgs<PlaygroundArgs>();
  const options = parseStringOptionLabels(args.optionLabels);
  const [value, setValue] = useState('0');

  useEffect(() => {
    setValue((current) => {
      const nextOptions = parseStringOptionLabels(args.optionLabels);
      if (nextOptions.some((option) => option.value === current)) return current;
      return nextOptions[0]?.value ?? '0';
    });
  }, [args.optionLabels]);

  if (options.length === 0) {
    return <EmptyOptionLabelsMessage />;
  }

  return (
    <KenoRisk
      value={value}
      onChange={setValue}
      options={options}
      labels={kenoStoryRiskLabels}
      disabled={args.disabled}
    />
  );
}

function LocalizedKenoRiskPreview() {
  const [value, setValue] = useState('classic');

  return (
    <KenoRisk
      value={value}
      onChange={setValue}
      options={localizedOptions}
      labels={{ title: 'Riesgo' }}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Risk',
  component: KenoRisk,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
    labels: { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof KenoRisk>;

export default meta;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['disabled', 'optionLabels'] },
  },
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    optionLabels: {
      control: { type: 'text' },
      description:
        'Comma-separated option labels. Add or remove entries to update the group.',
    },
  },
  args: {
    disabled: false,
    optionLabels: defaultOptionLabels,
  },
  render: KenoRiskPlayground,
};

export const LocalizedLabels: StoryObj<PlaygroundArgs> = {
  args: {
    disabled: false,
    optionLabels: 'Riesgo clásico, Riesgo bajo, Riesgo medio, Riesgo alto',
  },
  render: LocalizedKenoRiskPreview,
};
