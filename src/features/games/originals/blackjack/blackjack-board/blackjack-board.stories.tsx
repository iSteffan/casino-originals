'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BlackjackBoard } from './blackjack-board';

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Board',
  component: BlackjackBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    dealer: [],
    dealerLabel: 'Dealer',
    hands: [],
    announcement: '',
    emptyLabel: 'Deal a demo hand to begin.',
    demoNotice: 'Demo only. No wallet funds are wagered or paid out.',
    backgroundSrc: '/img/games/blackjack/blackjack-bg.png',
    // Part stories mount with cards already present — skip crooked deal fly/flip.
    // Live deal animation lives on Composition Playground (BlackjackTable + session).
    animate: false,
  },
} satisfies Meta<typeof BlackjackBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Playing: Story = {
  args: {
    dealer: [
      {
        id: 'dealer-1',
        src: '/img/games/blackjack/cards/10-of-Hearts.png',
        label: '10 of Hearts',
        layoutKey: '10-Hearts',
      },
      {
        id: 'dealer-2',
        src: '/img/games/blackjack/cards/7-of-Spades.png',
        label: 'Face-down card',
        layoutKey: '7-Spades',
        concealed: true,
      },
    ],
    dealerLabel: 'Dealer - 10',
    hands: [
      {
        id: 'first',
        active: false,
        score: 18,
        result: 'playing',
        label: 'Hand 1',
        cards: [
          {
            id: 'first-1',
            src: '/img/games/blackjack/cards/8-of-Clubs.png',
            label: '8 of Clubs',
            layoutKey: '8-Clubs',
          },
          {
            id: 'first-2',
            src: '/img/games/blackjack/cards/10-of-Diamonds.png',
            label: '10 of Diamonds',
            layoutKey: '10-Diamonds',
          },
        ],
      },
    ],
  },
};

export const Result: Story = {
  args: {
    ...Playing.args,
    dealer: [
      {
        id: 'dealer-1',
        src: '/img/games/blackjack/cards/10-of-Hearts.png',
        label: '10 of Hearts',
        layoutKey: '10-Hearts',
      },
      {
        id: 'dealer-2',
        src: '/img/games/blackjack/cards/7-of-Spades.png',
        label: '7 of Spades',
        layoutKey: '7-Spades',
      },
    ],
    dealerLabel: 'Dealer - 17',
    hands: [
      {
        id: 'first',
        active: false,
        score: 18,
        result: 'win',
        label: 'Hand 1',
        cards: Playing.args!.hands![0]!.cards,
      },
    ],
    announcement: 'Demo result: +10.00 credits',
    announcementId: 'result-1',
  },
};

export const SplitHands: Story = {
  args: {
    dealer: Playing.args!.dealer,
    dealerLabel: 'Dealer - 10',
    hands: [
      {
        id: 'hand-0',
        active: true,
        score: 12,
        result: 'playing',
        label: 'Hand 1',
        cards: [
          {
            id: 'h0-1',
            src: '/img/games/blackjack/cards/8-of-Clubs.png',
            label: '8 of Clubs',
            layoutKey: '8-Clubs',
          },
          {
            id: 'h0-2',
            src: '/img/games/blackjack/cards/4-of-Hearts.png',
            label: '4 of Hearts',
            layoutKey: '4-Hearts',
          },
        ],
      },
      {
        id: 'hand-1',
        active: false,
        score: 18,
        result: 'stand',
        label: 'Hand 2',
        cards: [
          {
            id: 'h1-1',
            src: '/img/games/blackjack/cards/8-of-Diamonds.png',
            label: '8 of Diamonds',
            layoutKey: '8-Diamonds',
          },
          {
            id: 'h1-2',
            src: '/img/games/blackjack/cards/10-of-Spades.png',
            label: '10 of Spades',
            layoutKey: '10-Spades',
          },
        ],
      },
    ],
    emptyLabel: 'Deal a demo hand to begin.',
    demoNotice: 'Demo only. No wallet funds are wagered or paid out.',
    announcement: '',
  },
};

export const BustAndPush: Story = {
  args: {
    dealer: [
      {
        id: 'dealer-1',
        src: '/img/games/blackjack/cards/10-of-Hearts.png',
        label: '10 of Hearts',
        layoutKey: '10-Hearts',
      },
      {
        id: 'dealer-2',
        src: '/img/games/blackjack/cards/King-of-Clubs.png',
        label: 'King of Clubs',
        layoutKey: 'King-Clubs',
      },
    ],
    dealerLabel: 'Dealer - 20',
    hands: [
      {
        id: 'bust',
        active: false,
        score: 25,
        result: 'busted',
        label: 'Hand 1',
        cards: [
          {
            id: 'b1',
            src: '/img/games/blackjack/cards/8-of-Clubs.png',
            label: '8 of Clubs',
            layoutKey: '8-Clubs',
          },
          {
            id: 'b2',
            src: '/img/games/blackjack/cards/10-of-Diamonds.png',
            label: '10 of Diamonds',
            layoutKey: '10-Diamonds',
          },
          {
            id: 'b3',
            src: '/img/games/blackjack/cards/King-of-Hearts.png',
            label: 'King of Hearts',
            layoutKey: 'King-Hearts',
          },
        ],
      },
      {
        id: 'push',
        active: false,
        score: 20,
        result: 'push',
        label: 'Hand 2',
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
    ],
    announcement: 'Demo result: +0.00 credits',
    announcementId: 'bust-push-1',
  },
};

export const Mobile: Story = {
  ...Playing,
  globals: { viewport: { value: 'mobile1' } },
};
