'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DiceSlider } from './dice-slider';
import type { DiceSliderDirection } from './dice-slider.types';

interface PlaygroundArgs {
  min: number;
  max: number;
  step: number;
  value: number;
  direction: DiceSliderDirection;
  showValueLabel: boolean;
  disabled: boolean;
}

function DiceSliderPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();

  return (
    <DiceSlider
      min={args.min}
      max={args.max}
      step={args.step}
      value={[args.value]}
      onValueChange={(values) => updateArgs({ value: values[0] })}
      direction={args.direction}
      showValueLabel={args.showValueLabel}
      disabled={args.disabled}
      aria-label="Dice target value"
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Slider',
  render: DiceSliderPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['min', 'max', 'step', 'value', 'direction', 'showValueLabel', 'disabled'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    min: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: { type: 'number', min: 0, max: 100 } },
    step: { control: { type: 'number', min: 0.01, max: 1, step: 0.01 } },
    value: { control: { type: 'number', min: 3, max: 97, step: 0.01 } },
    direction: {
      control: { type: 'inline-radio' },
      options: ['UNDER', 'OVER'],
    },
    showValueLabel: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  args: {
    min: 3,
    max: 97,
    step: 0.01,
    value: 50.25,
    direction: 'UNDER',
    showValueLabel: true,
    disabled: false,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OverDirection: Story = {
  args: {
    value: 62.5,
    direction: 'OVER',
  },
};

export const Disabled: Story = {
  args: {
    value: 50,
    disabled: true,
  },
};
