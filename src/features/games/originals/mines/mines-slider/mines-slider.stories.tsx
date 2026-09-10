'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import type { MinesSliderProps } from './mines-slider';
import { MinesSlider } from './mines-slider';

function MinesSliderPlayground() {
  const [args, updateArgs] = useArgs<MinesSliderProps>();

  return (
    <MinesSlider
      {...args}
      onValueChange={(value) => {
        updateArgs({ value });
        args.onValueChange?.(value);
      }}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Mines/Mines Slider',
  component: MinesSlider,
  render: MinesSliderPlayground,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    min: { control: { type: 'number', min: 1 } },
    max: { control: { type: 'number', min: 1 } },
    step: { control: { type: 'number', min: 1 } },
    totalCells: { control: { type: 'number', min: 2 } },
    value: { control: 'object' },
    disabled: { control: { type: 'boolean' } },
    assets: { control: false },
  },
  args: {
    min: 1,
    max: 15,
    step: 1,
    totalCells: 16,
    assets: {
      thumb: '/img/games/mines/mines-thumb.svg',
      safe: '/img/games/mines/gold.svg',
      mine: '/img/games/mines/mine.svg',
    },
    value: [3],
    disabled: false,
    'aria-label': 'Number of mines',
  },
} satisfies Meta<typeof MinesSlider>;

export default meta;

export const Playground: StoryObj<typeof meta> = {
  parameters: {
    controls: {
      include: ['min', 'max', 'step', 'totalCells', 'value', 'disabled'],
    },
  },
};
