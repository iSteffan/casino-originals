import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Label } from './label';

import { Toggle } from '#ui/primitives/controls/toggle/toggle';
import { Icon } from '#ui/primitives/foundation/icon/icon';

const meta = {
  title: 'Primitives/Inputs/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-8 p-ds-6 flex w-[280px] max-w-full flex-col">
      <Label>Bet amount</Label>
      <Label required>Rounds</Label>
      <Label adornment={<Icon name="info" size="sm" color="secondary" />}>
        Bet amount
      </Label>
      <div className="flex items-center justify-between gap-ds-4">
        <Label htmlFor="turbo">Turbo Mode</Label>
        <Toggle id="turbo" size="lg" />
      </div>
    </div>
  ),
};
