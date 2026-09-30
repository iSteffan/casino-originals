'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BlackjackConfigExamples } from './blackjack-config-examples';

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Config Examples',
  component: BlackjackConfigExamples,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    disabled: false,
    layout: 'horizontal',
    onScenario: () => undefined,
  },
  argTypes: {
    layout: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof BlackjackConfigExamples>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default: wrap/scroll row used under Composition / Config. */
export const Horizontal: Story = {
  args: { layout: 'horizontal' },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: { layout: 'vertical' },
};

export const Disabled: Story = {
  args: { layout: 'horizontal', disabled: true },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
};