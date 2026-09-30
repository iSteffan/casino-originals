'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { BlackjackConfig } from './blackjack-config';
import type { BlackjackConfigProps } from './blackjack-config.types';
import { BlackjackConfigExamples } from '#ui/features/games/originals/blackjack/blackjack-config-examples/blackjack-config-examples';

import { Image } from '#ui/primitives/data-display/image/image';

const currencyIcon = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    wrapperClassName="size-5 shrink-0 rounded-ds-full"
    className="size-5 object-contain"
    showSkeleton={false}
  />
);

interface PlaygroundArgs {
  amount: string;
  amountLabel: string;
  startLabel: string;
  startDisabled: boolean;
  playing: boolean;
  showInsurance: boolean;
  canDouble: boolean;
  canSplit: boolean;
}

function BlackjackConfigPlayground(args: PlaygroundArgs) {
  const [, updateArgs] = useArgs<PlaygroundArgs>();

  const props: BlackjackConfigProps = {
    amount: args.amount,
    onAmountChange: (amount) => updateArgs({ amount }),
    amountLabel: args.amountLabel,
    currencyIcon,
    amountQuickActions: [
      {
        label: '½',
        onClick: () => {
          const value = Number.parseFloat(args.amount);
          if (!Number.isNaN(value)) updateArgs({ amount: (value * 0.5).toFixed(2) });
        },
      },
      {
        label: '2x',
        onClick: () => {
          const value = Number.parseFloat(args.amount);
          if (!Number.isNaN(value)) updateArgs({ amount: (value * 2).toFixed(2) });
        },
      },
    ],
    startLabel: args.startLabel,
    onStart: () => undefined,
    startDisabled: args.startDisabled,
    playing: args.playing,
    insurance: args.showInsurance
      ? {
          label: 'Dealer shows an Ace. Take insurance for half your stake?',
          acceptLabel: 'Accept insurance',
          declineLabel: 'Decline',
          onChoose: () => undefined,
        }
      : null,
    actions: [
      { id: 'hit', label: 'Hit', disabled: !args.playing || args.showInsurance, onClick: () => undefined },
      { id: 'stand', label: 'Stand', disabled: !args.playing || args.showInsurance, onClick: () => undefined },
      {
        id: 'double',
        label: 'Double',
        disabled: !args.playing || args.showInsurance || !args.canDouble,
        onClick: () => undefined,
      },
      {
        id: 'split',
        label: 'Split',
        disabled: !args.playing || args.showInsurance || !args.canSplit,
        onClick: () => undefined,
      },
    ],
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <div className="w-full max-w-sm">
        <BlackjackConfig {...props} />
      </div>
      {/* Horizontal scenarios under the config panel (mirrors Composition placement). */}
      <BlackjackConfigExamples
        layout="horizontal"
        disabled={args.playing}
        onScenario={() => undefined}
      />
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Config',
  component: BlackjackConfig,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: {
      include: [
        'amount',
        'amountLabel',
        'startLabel',
        'startDisabled',
        'playing',
        'showInsurance',
        'canDouble',
        'canSplit',
      ],
    },
  },
  argTypes: {
    amount: { control: { type: 'text' } },
    amountLabel: { control: { type: 'text' } },
    startLabel: { control: { type: 'text' } },
    startDisabled: { control: { type: 'boolean' } },
    playing: { control: { type: 'boolean' } },
    showInsurance: { control: { type: 'boolean' } },
    canDouble: { control: { type: 'boolean' } },
    canSplit: { control: { type: 'boolean' } },
  },
  args: {
    amount: '10.00',
    amountLabel: 'Demo stake (credits)',
    startLabel: 'Deal demo hand',
    startDisabled: false,
    playing: false,
    showInsurance: false,
    canDouble: false,
    canSplit: false,
  } satisfies PlaygroundArgs,
  render: BlackjackConfigPlayground,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Playing: Story = {
  args: {
    playing: true,
    startDisabled: true,
    canDouble: true,
    canSplit: false,
  },
};

export const InsuranceOffer: Story = {
  args: {
    playing: true,
    startDisabled: true,
    showInsurance: true,
  },
};

export const CanSplit: Story = {
  args: {
    playing: true,
    startDisabled: true,
    canDouble: true,
    canSplit: true,
  },
};
