import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';

import { Icon } from '#ui/primitives/foundation/icon/icon';

const meta = {
  title: 'Primitives/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-8 p-ds-6 flex max-w-[320px] flex-col">
      <div className="gap-ds-3 flex flex-col">
        <span className="text-ds-body-sm text-ds-text-secondary">config actions</span>
        <div className="gap-ds-2 flex flex-col">
          <Button type="button" variant="gray" size="md" className="rounded-ds-2xs h-ds-8">
            Cashout
          </Button>
          <Button type="button" variant="primary" size="lg" className="rounded-ds-2xs">
            Place Bet
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="rounded-ds-2xs"
            disabled
          >
            Place Bet
          </Button>
        </div>
      </div>

      <div className="gap-ds-3 flex flex-col">
        <span className="text-ds-body-sm text-ds-text-secondary">
          bet amount / rounds
        </span>
        <div className="gap-ds-2 flex items-center">
          <Button type="button" variant="link-white" className="min-w-8 px-ds-1">
            ½
          </Button>
          <Button type="button" variant="link-white" className="px-ds-1 min-w-8">
            2x
          </Button>
          <Button
            type="button"
            variant="link-white"
            size="md"
            iconOnly
            aria-label="Infinite"
          >
            <Icon name="infinite" color="none" className="size-ds-5" />
          </Button>
        </div>
      </div>

      <div className="gap-ds-3 flex flex-col">
        <span className="text-ds-body-sm text-ds-text-secondary">game header</span>
        <div className="gap-ds-2 flex items-center">
          <Button
            type="button"
            variant="gray-muted"
            size="md"
            iconOnly
            aria-label="Theatre mode"
          >
            <Icon name="wide" size="sm" color="white" />
          </Button>
          <Button
            type="button"
            variant="white"
            size="md"
            iconOnly
            aria-label="Theatre mode on"
          >
            <Icon name="wide" size="sm" color="none" className="text-ds-black" />
          </Button>
          <Button
            type="button"
            variant="bare"
            iconOnly
            size="md"
            aria-label="Game volume"
            className="size-ds-8 bg-ds-brand-white p-ds-1-5 rounded-ds-full min-w-0"
          >
            <Icon name="volume" size="lg" color="none" className="text-ds-gray-950" />
          </Button>
        </div>
      </div>
    </div>
  ),
};
