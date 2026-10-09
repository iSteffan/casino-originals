'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DoubleBetTypeSelector } from './double-bet-type-selector';
import type { DoubleBetTypeSelectorProps } from './double-bet-type-selector.types';

import { toggleDoubleBetType } from '#ui/features/games/originals/double/double-engine';
import { doubleStoryBetTypeOptions } from '#ui/features/games/originals/double/double-story-helpers';

/** Storybook preview hooks only; selection rules come from double-engine. */
function DoubleBetTypeSelectorStory() {
  const [args, updateArgs] = useArgs<DoubleBetTypeSelectorProps>();
  return (
    <div className="w-[248px]">
      <DoubleBetTypeSelector
        {...args}
        onToggle={(type) => updateArgs({ value: toggleDoubleBetType(args.value, type) })}
      />
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Double/Double Bet Type Selector',
  component: DoubleBetTypeSelector,
  render: DoubleBetTypeSelectorStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  argTypes: {
    value: { control: { type: 'check' }, options: ['RED', 'BLACK', 'GREEN', 'JOKER'] },
    onToggle: { control: false },
    options: { control: false },
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    className: { control: false },
  },
  args: {
    value: [],
    onToggle: () => undefined,
    options: doubleStoryBetTypeOptions,
    label: 'Your bet',
    disabled: false,
  },
} satisfies Meta<typeof DoubleBetTypeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TwoColorsAndJoker: Story = {
  args: { value: ['RED', 'BLACK', 'JOKER'] },
};

export const Disabled: Story = {
  args: { value: ['GREEN'], disabled: true },
};
