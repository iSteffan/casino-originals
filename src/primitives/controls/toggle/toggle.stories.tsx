'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Toggle } from './toggle';

import { Label } from '#ui/primitives/inputs/label/label';

const meta = {
  title: 'Primitives/Controls/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-8 p-ds-6 flex w-[280px] max-w-full flex-col">
      <div className="flex items-center justify-between gap-ds-4">
        <Label htmlFor="turbo-off">Turbo Mode</Label>
        <Toggle id="turbo-off" size="lg" />
      </div>
      <div className="flex items-center justify-between gap-ds-4">
        <Label htmlFor="turbo-on">Turbo Mode</Label>
        <Toggle id="turbo-on" size="lg" defaultChecked />
      </div>
      <div className="flex items-center justify-between gap-ds-4">
        <Label htmlFor="turbo-disabled">Turbo Mode</Label>
        <Toggle id="turbo-disabled" size="lg" disabled />
      </div>
    </div>
  ),
};
