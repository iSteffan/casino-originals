'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BlackjackInsurance } from './blackjack-insurance';

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Insurance',
  component: BlackjackInsurance,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    label: 'Dealer shows an Ace. Take insurance for half your stake?',
    acceptLabel: 'Accept insurance',
    declineLabel: 'Decline',
    onChoose: () => undefined,
  },
} satisfies Meta<typeof BlackjackInsurance>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
