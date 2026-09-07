import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AutobetSessionStatus } from './autobet-session-status';
import type { AutobetSessionState } from './autobet-session-status.types';

/** Inner content width inside `ds-originals-config-shell`. */
const ORIGINALS_CONFIG_WIDTH = 280;

interface PlaygroundArgs {
  state: AutobetSessionState;
  totalWagered: string;
  netProfit: string;
  winRate: string;
}

const meta = {
  title: 'Features/Games/Originals/Shared/Autobet Session Status',
  component: AutobetSessionStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    className: { control: false },
    labels: { control: false },
  },
  decorators: [
    (Story) => (
      <div
        className="bg-ds-gray-900 rounded-ds-md p-ds-4 max-w-full"
        style={{ width: ORIGINALS_CONFIG_WIDTH }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AutobetSessionStatus>;

export default meta;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      include: ['state', 'totalWagered', 'netProfit', 'winRate'],
    },
  },
  argTypes: {
    state: {
      control: { type: 'select' },
      options: [
        'live',
        'paused',
        'complete',
        'insufficient-balance',
        'awaiting-bets',
        'ready-to-start',
      ],
    },
    totalWagered: { control: { type: 'text' } },
    netProfit: { control: { type: 'text' } },
    winRate: { control: { type: 'text' } },
  },
  args: {
    state: 'live',
    totalWagered: '$1,250.00',
    netProfit: '+$320.50',
    winRate: '62%',
  },
  render: (args) => <AutobetSessionStatus {...args} />,
};
