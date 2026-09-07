import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

import { Icon } from '#ui/primitives/foundation/icon/icon';

const meta = {
  title: 'Primitives/Feedback/Tooltip',
  component: TooltipContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  decorators: [
    (Story) => (
      <div className="p-ds-16 flex min-h-[12rem] items-center justify-center">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Bet amount info"
          className="size-ds-4 inline-flex items-center justify-center"
        >
          <Icon name="info" size="sm" color="secondary" />
        </button>
      </TooltipTrigger>
      <TooltipContent color="dark" size="sm">
        Maximum bet amount for this currency
      </TooltipContent>
    </Tooltip>
  ),
};
