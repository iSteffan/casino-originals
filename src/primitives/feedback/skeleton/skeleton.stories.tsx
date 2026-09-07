import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Skeleton } from './skeleton';

import { Label } from '#ui/primitives/inputs/label/label';

const meta = {
  title: 'Primitives/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-1-5 p-ds-6 flex w-[280px] max-w-full flex-col">
      <Label>Bet amount</Label>
      <div className="rounded-ds-xs border-ds-border-primary bg-ds-surface-secondary px-ds-3 flex h-ds-10 items-center border">
        <Skeleton className="h-ds-4 w-[6rem]" aria-label="Loading bet amount" />
      </div>
    </div>
  ),
};
