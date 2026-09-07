import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RoundsInput } from './rounds-input';

interface PlaygroundArgs {
  label: string;
  value: string;
  error: string;
  disabled: boolean;
}

function RoundsInputPlayground({
  label,
  value: valueArg,
  error,
  disabled,
}: PlaygroundArgs) {
  const [value, setValue] = useState(valueArg);

  useEffect(() => {
    setValue(valueArg);
  }, [valueArg]);

  return (
    <RoundsInput
      label={label}
      value={value}
      onChange={setValue}
      disabled={disabled}
      error={error || undefined}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Rounds Input',
  component: RoundsInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    onChange: { control: false },
    className: { control: false },
    max: { control: false },
    placeholder: { control: false },
    label: { control: { type: 'text' } },
    value: { control: { type: 'text' } },
    error: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
  },
  decorators: [
    (Story) => (
      <div className="bg-ds-surface-secondary rounded-ds-md p-ds-4 w-[280px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoundsInput>;

export default meta;

type Story = StoryObj<typeof RoundsInput>;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      include: ['label', 'value', 'error', 'disabled'],
    },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    value: { control: { type: 'text' } },
    error: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
  },
  args: {
    label: 'Number of Bets',
    value: '100',
    error: '',
    disabled: false,
  },
  render: (args) => <RoundsInputPlayground {...args} />,
};

export const Default: Story = {
  parameters: {
    controls: { include: ['label', 'value', 'disabled'] },
  },
  args: {
    label: 'Number of Bets',
    value: '100',
    onChange: () => undefined,
  },
};

export const Infinite: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['label', 'disabled'] },
  },
  args: {
    label: 'Number of Bets',
    value: 'Infinity',
    error: '',
    disabled: false,
  },
  render: (args) => <RoundsInputPlayground {...args} />,
};

export const Error: Story = {
  parameters: {
    controls: { include: ['label', 'value', 'error', 'disabled'] },
  },
  args: {
    label: 'Number of Bets',
    value: '0',
    error: 'Minimum rounds is 1',
    onChange: () => undefined,
  },
};

export const Disabled: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['label', 'value', 'disabled'] },
  },
  args: {
    label: 'Number of Bets',
    value: 'Infinity',
    error: '',
    disabled: true,
  },
  render: (args) => <RoundsInputPlayground {...args} />,
};
