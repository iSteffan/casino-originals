import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BetAmountInput } from './bet-amount-input';

const currencyIcon = (
  <img
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    className="rounded-ds-full size-5"
  />
);

interface PlaygroundArgs {
  label: string;
  value: string;
  conversionText: string;
  showConversionText: boolean;
  showTooltip: boolean;
  tooltipLabel: string;
  tooltipTitle: string;
  tooltipDescription: string;
  showQuickActions: boolean;
  halfDisabled: boolean;
  doubleDisabled: boolean;
  showThresholdWarning: boolean;
  thresholdTitle: string;
  thresholdDescription: string;
  error: string;
  isLoading: boolean;
  disabled: boolean;
}

function BetAmountInputPlayground({
  label,
  value: valueArg,
  conversionText,
  showConversionText,
  showTooltip,
  tooltipLabel,
  tooltipTitle,
  tooltipDescription,
  showQuickActions,
  halfDisabled,
  doubleDisabled,
  showThresholdWarning,
  thresholdTitle,
  thresholdDescription,
  error,
  isLoading,
  disabled,
}: PlaygroundArgs) {
  const [value, setValue] = useState(valueArg);

  return (
    <BetAmountInput
      label={label}
      value={value}
      onChange={setValue}
      conversionText={showConversionText ? conversionText : null}
      tooltip={
        showTooltip
          ? {
              label: tooltipLabel,
              title: tooltipTitle,
              description: tooltipDescription,
            }
          : undefined
      }
      currencyIcon={currencyIcon}
      isLoading={isLoading}
      disabled={disabled}
      error={error || undefined}
      quickActions={
        showQuickActions
          ? [
              {
                label: '½',
                disabled: halfDisabled,
                onClick: () =>
                  setValue((current) => {
                    const parsed = Number.parseFloat(current);
                    if (Number.isNaN(parsed)) return current;
                    return (parsed / 2).toFixed(2);
                  }),
              },
              {
                label: '2x',
                disabled: doubleDisabled,
                onClick: () =>
                  setValue((current) => {
                    const parsed = Number.parseFloat(current);
                    if (Number.isNaN(parsed)) return current;
                    return (parsed * 2).toFixed(2);
                  }),
              },
            ]
          : undefined
      }
      thresholdWarning={
        showThresholdWarning
          ? {
              title: thresholdTitle,
              description: thresholdDescription,
            }
          : null
      }
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Bet Amount Input',
  component: BetAmountInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    onChange: { control: false },
    currencyIcon: { control: false },
    tooltip: { control: false },
    quickActions: { control: false },
    thresholdWarning: { control: false },
    className: { control: false },
    placeholder: { control: false },
    precision: { control: false },
    inputMode: { control: false },
    label: { control: { type: 'text' } },
    value: { control: { type: 'text' } },
    conversionText: { control: { type: 'text' } },
    error: { control: { type: 'text' } },
    isLoading: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  decorators: [
    (Story) => (
      <div className="bg-ds-surface-secondary rounded-ds-md p-ds-4 w-[280px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BetAmountInput>;

export default meta;

type Story = StoryObj<typeof BetAmountInput>;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      include: [
        'label',
        'value',
        'conversionText',
        'showConversionText',
        'showTooltip',
        'tooltipLabel',
        'tooltipTitle',
        'tooltipDescription',
        'showQuickActions',
        'halfDisabled',
        'doubleDisabled',
        'showThresholdWarning',
        'thresholdTitle',
        'thresholdDescription',
        'error',
        'isLoading',
        'disabled',
      ],
    },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    value: { control: { type: 'text' } },
    conversionText: { control: { type: 'text' } },
    showConversionText: { control: { type: 'boolean' } },
    showTooltip: { control: { type: 'boolean' } },
    tooltipTitle: { control: { type: 'text' } },
    tooltipDescription: { control: { type: 'text' } },
    showQuickActions: { control: { type: 'boolean' } },
    halfDisabled: { control: { type: 'boolean' }, name: 'Disable ½' },
    doubleDisabled: { control: { type: 'boolean' }, name: 'Disable 2x' },
    showThresholdWarning: { control: { type: 'boolean' } },
    thresholdTitle: { control: { type: 'text' } },
    thresholdDescription: { control: { type: 'text' } },
    error: { control: { type: 'text' } },
    isLoading: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  args: {
    label: 'Bet Amount',
    value: '1000.00',
    conversionText: '0.000145 BTC',
    showConversionText: true,
    showTooltip: true,
    tooltipLabel: 'Bet amount information',
    tooltipTitle: 'Max payout per round: $15,000',
    tooltipDescription:
      'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
    showQuickActions: true,
    halfDisabled: false,
    doubleDisabled: false,
    showThresholdWarning: false,
    thresholdTitle: 'High payout warning',
    thresholdDescription: 'This bet exceeds the recommended payout threshold.',
    error: '',
    isLoading: false,
    disabled: false,
  },
  render: (args) => <BetAmountInputPlayground {...args} />,
};

export const Default: Story = {
  parameters: {
    controls: { include: ['label', 'value', 'conversionText', 'isLoading', 'disabled'] },
  },
  args: {
    label: 'Bet Amount',
    value: '1000.00',
    conversionText: '0.000145 BTC',
    currencyIcon,
    onChange: () => undefined,
    quickActions: [
      { label: '½', onClick: () => undefined },
      { label: '2x', onClick: () => undefined },
    ],
  },
};

export const ThresholdWarning: Story = {
  parameters: {
    controls: { include: ['label', 'value', 'conversionText', 'isLoading', 'disabled'] },
  },
  args: {
    label: 'Bet Amount',
    value: '5001.00',
    conversionText: '0.072 BTC',
    currencyIcon,
    onChange: () => undefined,
    quickActions: [
      { label: '½', onClick: () => undefined },
      { label: '2x', onClick: () => undefined },
    ],
    thresholdWarning: {
      title: 'High payout warning',
      description: 'This bet exceeds the recommended payout threshold.',
    },
  },
};

export const Error: Story = {
  parameters: {
    controls: { include: ['label', 'value', 'error', 'isLoading', 'disabled'] },
  },
  args: {
    label: 'Bet Amount',
    value: '0.00',
    currencyIcon,
    onChange: () => undefined,
    error: 'Minimum bet is 0.01',
    quickActions: [
      { label: '½', onClick: () => undefined },
      { label: '2x', onClick: () => undefined },
    ],
  },
};

export const Loading: Story = {
  parameters: {
    controls: { include: ['label', 'isLoading', 'disabled'] },
  },
  args: {
    label: 'Bet Amount',
    value: '',
    currencyIcon,
    isLoading: true,
    onChange: () => undefined,
    quickActions: [
      { label: '½', onClick: () => undefined },
      { label: '2x', onClick: () => undefined },
    ],
  },
};
