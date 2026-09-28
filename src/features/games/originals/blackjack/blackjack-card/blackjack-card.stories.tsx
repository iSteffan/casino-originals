'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BlackjackCard } from './blackjack-card';

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Card',
  component: BlackjackCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    src: '/img/games/blackjack/cards/Ace-of-Spades.png',
    label: 'Ace of Spades',
  },
} satisfies Meta<typeof BlackjackCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FaceUp: Story = {};

export const FaceDown: Story = {
  args: {
    src: '/img/games/blackjack/cards/back.png',
    label: 'Face-down card',
  },
};

export const TenOfHearts: Story = {
  args: {
    src: '/img/games/blackjack/cards/10-of-Hearts.png',
    label: '10 of Hearts',
  },
};
