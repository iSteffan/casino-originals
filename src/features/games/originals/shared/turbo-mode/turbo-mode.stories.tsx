'use client';

import { type ReactNode, useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TurboMode } from './turbo-mode';

const ORIGINALS_CONFIG_WIDTH = 280;

function OriginalsConfigWidthDecorator(Story: () => ReactNode) {
  return (
    <div
      className="bg-ds-gray-900 rounded-ds-md p-ds-4 max-w-full"
      style={{ width: ORIGINALS_CONFIG_WIDTH }}
    >
      <Story />
    </div>
  );
}

interface PlaygroundArgs {
  label: string;
  initialChecked: boolean;
  disabled: boolean;
}

function TurboModePlayground({ label, initialChecked, disabled }: PlaygroundArgs) {
  const [checked, setChecked] = useState(initialChecked);

  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked]);

  return (
    <TurboMode
      label={label}
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Turbo Mode',
  component: TurboMode,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  argTypes: {
    onCheckedChange: { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof TurboMode>;

export default meta;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: { include: ['label', 'initialChecked', 'disabled'] },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    initialChecked: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  args: {
    label: 'Turbo Mode',
    initialChecked: false,
    disabled: false,
  },
  render: (args) => <TurboModePlayground {...args} />,
};
