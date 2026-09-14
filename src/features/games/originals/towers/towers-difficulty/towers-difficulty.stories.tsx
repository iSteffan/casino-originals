'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useState } from 'storybook/preview-api';

import { TowersDifficulty } from './towers-difficulty';

import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';
import { EmptyOptionLabelsMessage } from '#ui/features/games/originals/shared/empty-option-labels-message';
import {
  createTowersStoryDifficultyOptions,
  towersStoryDifficultyLabels,
} from '#ui/features/games/originals/towers/towers-story-helpers';

const defaultOptionLabels = 'Easy Mode, Medium Mode, Hard Mode';

interface PlaygroundArgs {
  disabled: boolean;
  optionLabels: string;
}

function parseTowersOptionLabels(input: string) {
  return createTowersStoryDifficultyOptions(
    input
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

function TowersDifficultyPlayground() {
  const [args] = useArgs<PlaygroundArgs>();
  const [value, setValue] = useState(0);
  const options = parseTowersOptionLabels(args.optionLabels);
  const selectedValue = options.some((option) => option.value === value)
    ? value
    : (options[0]?.value ?? 0);

  if (options.length === 0) {
    return <EmptyOptionLabelsMessage />;
  }

  return (
    <TowersDifficulty
      value={selectedValue}
      onChange={setValue}
      options={options}
      labels={towersStoryDifficultyLabels}
      disabled={args.disabled}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Towers/Towers Difficulty',
  component: TowersDifficulty,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof TowersDifficulty>;

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
  render: TowersDifficultyPlayground,
};
