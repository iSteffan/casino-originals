'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BlackjackCardStatic } from './blackjack-card';
import {
  BlackjackProvider,
  useBlackjackGame,
} from '#ui/features/games/originals/blackjack/blackjack-session-context';
import { BlackjackCard } from './blackjack-card';

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Card',
  component: BlackjackCardStatic,
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
} satisfies Meta<typeof BlackjackCardStatic>;

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

function FlipDemo() {
  const { flippedPlayerCards, setFlippedPlayerCards } = useBlackjackGame();
  const flipped = Boolean(flippedPlayerCards[0]);
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-3"
      onClick={() => setFlippedPlayerCards([!flipped])}
    >
      <BlackjackCard
        card={{ rank: 'Ace', suit: 'Spades' }}
        flipped={flipped}
        isDealer={false}
        handIndex={0}
      />
      <span className="text-ds-text-secondary text-ds-sm">
        Click to {flipped ? 'hide' : 'flip'}
      </span>
    </button>
  );
}

/** Y-flip with plain img + backfaceVisibility (betstrike BlackjaskCard). */
export const FlipMotion: StoryObj = {
  render: () => (
    <BlackjackProvider>
      <FlipDemo />
    </BlackjackProvider>
  ),
};
