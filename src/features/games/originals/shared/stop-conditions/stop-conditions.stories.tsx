import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StopConditions } from './stop-conditions';
import type { StopConditionsLabels } from './stop-conditions.types';
import { DEFAULT_STOP_CONDITIONS_PERCENTAGE } from './stop-conditions-format.utils';

const defaultLabels: StopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

interface PlaygroundArgs {
  disabled: boolean;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
}

function StopConditionsPlayground({
  disabled,
  isActiveOnWin: isActiveOnWinArg,
  isActiveOnLoss: isActiveOnLossArg,
  onWinValue: onWinValueArg,
  onLossValue: onLossValueArg,
  stopProfitValue: stopProfitValueArg,
  stopLossValue: stopLossValueArg,
}: PlaygroundArgs) {
  const [isActiveOnWin, setIsActiveOnWin] = useState(isActiveOnWinArg);
  const [isActiveOnLoss, setIsActiveOnLoss] = useState(isActiveOnLossArg);
  const [onWinValue, setOnWinValue] = useState(onWinValueArg);
  const [onLossValue, setOnLossValue] = useState(onLossValueArg);
  const [stopProfitValue, setStopProfitValue] = useState(stopProfitValueArg);
  const [stopLossValue, setStopLossValue] = useState(stopLossValueArg);

  useEffect(() => {
    setIsActiveOnWin(isActiveOnWinArg);
  }, [isActiveOnWinArg]);

  useEffect(() => {
    setIsActiveOnLoss(isActiveOnLossArg);
  }, [isActiveOnLossArg]);

  useEffect(() => {
    setOnWinValue(onWinValueArg);
  }, [onWinValueArg]);

  useEffect(() => {
    setOnLossValue(onLossValueArg);
  }, [onLossValueArg]);

  useEffect(() => {
    setStopProfitValue(stopProfitValueArg);
  }, [stopProfitValueArg]);

  useEffect(() => {
    setStopLossValue(stopLossValueArg);
  }, [stopLossValueArg]);

  return (
    <StopConditions
      labels={defaultLabels}
      onWinValue={onWinValue}
      onLossValue={onLossValue}
      stopProfitValue={stopProfitValue}
      stopLossValue={stopLossValue}
      isActiveOnWin={isActiveOnWin}
      isActiveOnLoss={isActiveOnLoss}
      onWinChange={setOnWinValue}
      onLossChange={setOnLossValue}
      onStopProfitChange={setStopProfitValue}
      onStopLossChange={setStopLossValue}
      onWinToggle={setIsActiveOnWin}
      onLossToggle={setIsActiveOnLoss}
      disabled={disabled}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Stop Conditions',
  component: StopConditions,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    labels: { control: false },
    onWinChange: { control: false },
    onLossChange: { control: false },
    onStopProfitChange: { control: false },
    onStopLossChange: { control: false },
    onWinToggle: { control: false },
    onLossToggle: { control: false },
    onResetOnWinFromActive: { control: false },
    onResetOnLossFromActive: { control: false },
    className: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="bg-ds-surface-secondary rounded-ds-md p-ds-4 w-[280px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StopConditions>;

export default meta;

type Story = StoryObj<typeof StopConditions>;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      include: [
        'disabled',
        'isActiveOnWin',
        'isActiveOnLoss',
        'onWinValue',
        'onLossValue',
        'stopProfitValue',
        'stopLossValue',
      ],
    },
  },
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    isActiveOnWin: { control: { type: 'boolean' }, name: 'On win active' },
    isActiveOnLoss: { control: { type: 'boolean' }, name: 'On loss active' },
    onWinValue: { control: { type: 'number', min: 0, max: 999 } },
    onLossValue: { control: { type: 'number', min: 0, max: 999 } },
    stopProfitValue: { control: { type: 'text' } },
    stopLossValue: { control: { type: 'text' } },
  },
  args: {
    disabled: false,
    isActiveOnWin: false,
    isActiveOnLoss: false,
    onWinValue: DEFAULT_STOP_CONDITIONS_PERCENTAGE,
    onLossValue: DEFAULT_STOP_CONDITIONS_PERCENTAGE,
    stopProfitValue: '',
    stopLossValue: '',
  },
  render: (args) => <StopConditionsPlayground {...args} />,
};

export const Default: Story = {
  args: {
    labels: defaultLabels,
    onWinValue: DEFAULT_STOP_CONDITIONS_PERCENTAGE,
    onLossValue: DEFAULT_STOP_CONDITIONS_PERCENTAGE,
    stopProfitValue: '',
    stopLossValue: '',
    isActiveOnWin: false,
    isActiveOnLoss: false,
    onWinChange: () => undefined,
    onLossChange: () => undefined,
    onStopProfitChange: () => undefined,
    onStopLossChange: () => undefined,
    onWinToggle: () => undefined,
    onLossToggle: () => undefined,
  },
};

export const WithStrategyActive: Story = {
  args: {
    labels: defaultLabels,
    onWinValue: 50,
    onLossValue: 25,
    stopProfitValue: '100.00',
    stopLossValue: '50.00',
    isActiveOnWin: true,
    isActiveOnLoss: true,
    onWinChange: () => undefined,
    onLossChange: () => undefined,
    onStopProfitChange: () => undefined,
    onStopLossChange: () => undefined,
    onWinToggle: () => undefined,
    onLossToggle: () => undefined,
  },
};

export const Disabled: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      include: ['disabled', 'isActiveOnWin', 'isActiveOnLoss'],
    },
  },
  args: {
    disabled: true,
    isActiveOnWin: true,
    isActiveOnLoss: true,
    onWinValue: 50,
    onLossValue: 25,
    stopProfitValue: '100.00',
    stopLossValue: '50.00',
  },
  render: (args) => <StopConditionsPlayground {...args} />,
};
