import type { Card } from './blackjack-session-context';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'] as const;
const ranks = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Jack',
  'Queen',
  'King',
  'Ace',
] as const;

export const generateDeck = (): Card[] => {
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return shuffle(deck);
};

const shuffle = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateScore = (
  hand: Card[],
  options?: { hideSecondCard?: boolean },
): number => {
  let total = 0;
  let aces = 0;

  const cardsToCount = options?.hideSecondCard
    ? hand.filter((_, idx) => idx !== 1)
    : hand;

  for (const card of cardsToCount) {
    const { rank } = card;
    if (rank === 'Ace') {
      aces += 1;
      total += 11;
    } else if (['King', 'Queen', 'Jack'].includes(rank)) {
      total += 10;
    } else {
      total += Number(rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
};
