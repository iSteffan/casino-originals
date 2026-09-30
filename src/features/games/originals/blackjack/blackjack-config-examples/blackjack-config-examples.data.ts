import type { BlackjackConfigExampleScenario } from './blackjack-config-examples.types';

/**
 * Ported from commented "Test Scenarios" in betstrike legacy blackjack-config
 * (f8a680b99 / pre-eb7912aed). Storybook-only helpers for forced deals.
 *
 * Labels: title = case at a glance; dealer/player lines = who has which cards
 * plus natural BJ / insurance flags.
 */
export const BLACKJACK_CONFIG_EXAMPLE_SCENARIOS: readonly BlackjackConfigExampleScenario[] = [
  {
    id: 'dealer-bj-insurance-player-lose',
    title: 'Dealer BJ + Insurance',
    dealerLine: 'Dealer: A♦ K♣ · Natural BJ · Insurance offered',
    playerLine: 'Player: K♥ 3♠ · Lose',
    dealerTone: 'yellow',
    playerTone: 'red',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: '3', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: 'Ace', suit: 'Diamonds' },
      { rank: 'King', suit: 'Clubs' },
    ],
  },
  {
    id: 'dealer-insurance-no-bj-player-lose',
    title: 'Insurance, no dealer BJ',
    dealerLine: 'Dealer: A♦ 2♣ · Not BJ · Insurance offered',
    playerLine: 'Player: K♥ 3♠ · Lose',
    dealerTone: 'yellow',
    playerTone: 'red',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: '3', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: 'Ace', suit: 'Diamonds' },
      { rank: '2', suit: 'Clubs' },
    ],
  },
  {
    id: 'dealer-insurance-player-bj',
    title: 'Your BJ · Insurance (no dealer BJ)',
    dealerLine: 'Dealer: A♦ 2♣ · Not BJ · Insurance offered',
    playerLine: 'Player: K♥ A♥ · Natural BJ',
    dealerTone: 'red',
    playerTone: 'yellow',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: 'Ace', suit: 'Hearts' },
    ],
    dealerCards: [
      { rank: 'Ace', suit: 'Diamonds' },
      { rank: '2', suit: 'Clubs' },
    ],
  },
  {
    id: 'dealer-bj-player-bj-push',
    title: 'Both natural BJ · Push',
    dealerLine: 'Dealer: A♦ J♣ · Natural BJ · Insurance offered',
    playerLine: 'Player: K♥ A♥ · Natural BJ · Push',
    dealerTone: 'yellow',
    playerTone: 'yellow',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: 'Ace', suit: 'Hearts' },
    ],
    dealerCards: [
      { rank: 'Ace', suit: 'Diamonds' },
      { rank: 'Jack', suit: 'Clubs' },
    ],
  },
  {
    id: 'dealer-bj-no-insurance-player-lose',
    title: 'Dealer BJ · No insurance',
    dealerLine: 'Dealer: J♦ A♣ · Natural BJ · No Ace up (no insurance)',
    playerLine: 'Player: K♥ 3♠ · Lose',
    dealerTone: 'yellow',
    playerTone: 'red',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: '3', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: 'Jack', suit: 'Diamonds' },
      { rank: 'Ace', suit: 'Clubs' },
    ],
  },
  {
    id: 'both-blackjack',
    title: 'Both natural BJ · No insurance',
    dealerLine: 'Dealer: J♦ A♣ · Natural BJ · No Ace up (no insurance)',
    playerLine: 'Player: K♥ A♠ · Natural BJ',
    dealerTone: 'yellow',
    playerTone: 'yellow',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: 'Ace', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: 'Jack', suit: 'Diamonds' },
      { rank: 'Ace', suit: 'Clubs' },
    ],
  },
  {
    id: 'player-bj-dealer-lose',
    title: 'Your natural BJ',
    dealerLine: 'Dealer: 4♦ Q♣ · Lose',
    playerLine: 'Player: K♥ A♠ · Natural BJ',
    dealerTone: 'red',
    playerTone: 'yellow',
    playerCards: [
      { rank: 'King', suit: 'Hearts' },
      { rank: 'Ace', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: '4', suit: 'Diamonds' },
      { rank: 'Queen', suit: 'Clubs' },
    ],
  },
  {
    id: 'player-split',
    title: 'Split pair',
    dealerLine: 'Dealer: 4♦ Q♣',
    playerLine: 'Player: 2♥ 2♠ · Split available',
    dealerTone: 'white',
    playerTone: 'green',
    playerCards: [
      { rank: '2', suit: 'Hearts' },
      { rank: '2', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: '4', suit: 'Diamonds' },
      { rank: 'Queen', suit: 'Clubs' },
    ],
  },
  {
    id: 'player-split-dealer-bj-insurance',
    title: 'Split vs Dealer BJ + Insurance',
    dealerLine: 'Dealer: A♦ Q♣ · Natural BJ · Insurance offered',
    playerLine: 'Player: 2♥ 2♠ · Split available',
    dealerTone: 'yellow',
    playerTone: 'red',
    playerCards: [
      { rank: '2', suit: 'Hearts' },
      { rank: '2', suit: 'Spades' },
    ],
    dealerCards: [
      { rank: 'Ace', suit: 'Diamonds' },
      { rank: 'Queen', suit: 'Clubs' },
    ],
  },
];