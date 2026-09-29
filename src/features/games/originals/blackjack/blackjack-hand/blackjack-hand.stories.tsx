'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BlackjackHand } from './blackjack-hand';

const sampleCards = [
  {
    id: 'c1',
    src: '/img/games/blackjack/cards/8-of-Clubs.png',
    label: '8 of Clubs',
    layoutKey: '8-Clubs',
  },
  {
    id: 'c2',
    src: '/img/games/blackjack/cards/10-of-Diamonds.png',
    label: '10 of Diamonds',
    layoutKey: '10-Diamonds',
  },
];

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Hand',
  component: BlackjackHand,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    score: 18,
    cards: sampleCards,
    active: false,
    result: 'playing',
    label: 'Hand 1',
    animate: false,
  },
} satisfies Meta<typeof BlackjackHand>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Normal / idle hand — gray score badge, no card glow. */
export const Normal: Story = {};

/** Active hand during split — purple score badge + purple card glow. */
export const ActiveOnSplit: Story = {
  args: {
    score: 12,
    active: true,
    result: 'playing',
    label: 'Hand 1 (active)',
    cards: [
      {
        id: 'a1',
        src: '/img/games/blackjack/cards/8-of-Clubs.png',
        label: '8 of Clubs',
        layoutKey: '8-Clubs',
      },
      {
        id: 'a2',
        src: '/img/games/blackjack/cards/4-of-Hearts.png',
        label: '4 of Hearts',
        layoutKey: '4-Hearts',
      },
    ],
  },
};

/** Bust — red score badge + red card glow. */
export const Bust: Story = {
  args: {
    score: 25,
    active: false,
    result: 'busted',
    label: 'Hand 1 bust',
    cards: [
      ...sampleCards,
      {
        id: 'c3',
        src: '/img/games/blackjack/cards/King-of-Hearts.png',
        label: 'King of Hearts',
        layoutKey: 'King-Hearts',
      },
    ],
  },
};

/** Push / tie — yellow score badge + yellow card glow. */
export const Push: Story = {
  args: {
    score: 20,
    active: false,
    result: 'push',
    label: 'Hand 1 push',
    cards: [
      {
        id: 'p1',
        src: '/img/games/blackjack/cards/10-of-Spades.png',
        label: '10 of Spades',
        layoutKey: '10-Spades',
      },
      {
        id: 'p2',
        src: '/img/games/blackjack/cards/Queen-of-Hearts.png',
        label: 'Queen of Hearts',
        layoutKey: 'Queen-Hearts',
      },
    ],
  },
};

/** Win — lime score badge + green card glow. */
export const Win: Story = {
  args: {
    score: 20,
    active: false,
    result: 'win',
    label: 'Hand 1 win',
  },
};

/** Side-by-side split: active vs idle. */
export const SplitComparison: Story = {
  render: () => (
    <div className="flex flex-wrap items-end justify-center gap-16">
      <BlackjackHand
        score={12}
        active
        result="playing"
        label="Hand 1 active"
        animate={false}
        cards={[
          {
            id: 's0-1',
            src: '/img/games/blackjack/cards/8-of-Clubs.png',
            label: '8 of Clubs',
            layoutKey: '8-Clubs',
          },
          {
            id: 's0-2',
            src: '/img/games/blackjack/cards/4-of-Hearts.png',
            label: '4 of Hearts',
            layoutKey: '4-Hearts',
          },
        ]}
      />
      <BlackjackHand
        score={18}
        active={false}
        result="stand"
        label="Hand 2 idle"
        animate={false}
        cards={[
          {
            id: 's1-1',
            src: '/img/games/blackjack/cards/8-of-Diamonds.png',
            label: '8 of Diamonds',
            layoutKey: '8-Diamonds',
          },
          {
            id: 's1-2',
            src: '/img/games/blackjack/cards/10-of-Spades.png',
            label: '10 of Spades',
            layoutKey: '10-Spades',
          },
        ]}
      />
    </div>
  ),
};
