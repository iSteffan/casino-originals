'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Slider } from './slider';

const meta = {
  title: 'Primitives/Controls/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-3 p-ds-6 flex w-[280px] max-w-full flex-col">
      <span className="text-ds-body-sm text-ds-text-secondary">mines count</span>
      <Slider min={1} max={24} step={1} defaultValue={[3]} />
    </div>
  ),
};
