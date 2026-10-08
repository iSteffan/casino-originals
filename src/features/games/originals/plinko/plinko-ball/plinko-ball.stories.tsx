'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PlinkoBall } from './plinko-ball';

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Ball',
  component: PlinkoBall,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: { include: [] },
  },
  argTypes: {
    className: { control: false },
  },
  render: (args) => (
    <div className="bg-ds-black rounded-ds-sm grid size-24 place-items-center">
      <PlinkoBall className={args.className} />
    </div>
  ),
} satisfies Meta<typeof PlinkoBall>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
