export type BlackjackRank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'Jack'
  | 'Queen'
  | 'King'
  | 'Ace';
export interface BlackjackCard {
  rank: BlackjackRank;
  suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
}
export type BlackjackResult =
  | 'playing'
  | 'stand'
  | 'busted'
  | 'win'
  | 'lose'
  | 'push'
  | 'blackjack';
export type BlackjackAction = 'hit' | 'stand' | 'double' | 'split';
export interface BlackjackHand {
  cards: BlackjackCard[];
  stake: number;
  result: BlackjackResult;
}
export interface BlackjackState {
  phase: 'idle' | 'insurance' | 'playing' | 'finished';
  deck: BlackjackCard[];
  dealer: BlackjackCard[];
  hands: BlackjackHand[];
  activeHand: number;
  insurance: number;
  profit: number;
}
export const EMPTY_BLACKJACK: BlackjackState = {
  phase: 'idle',
  deck: [],
  dealer: [],
  hands: [],
  activeHand: 0,
  insurance: 0,
  profit: 0,
};

export function isBlackjackPlaying(state: BlackjackState): boolean {
  return state.phase === 'playing' || state.phase === 'insurance';
}

export function canStartBlackjackDemo(state: BlackjackState, stake: number): boolean {
  return (
    !isBlackjackPlaying(state) &&
    Number.isFinite(stake) &&
    stake > 0 &&
    stake <= 1_000_000
  );
}

export function blackjackScore(cards: readonly BlackjackCard[]): number {
  let score = 0;
  let aces = 0;
  for (const { rank } of cards) {
    if (rank === 'Ace') {
      score += 11;
      aces += 1;
    } else
      score += rank === 'Jack' || rank === 'Queen' || rank === 'King' ? 10 : Number(rank);
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
}

/** Local demo deck only; this function never represents a server wager. */
export function createBlackjackDemoDeck(): BlackjackCard[] {
  const ranks: BlackjackRank[] = [
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
  ];
  const suits: BlackjackCard['suit'][] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const deck = suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

function settle(state: BlackjackState, natural = false): BlackjackState {
  const dealerScore = blackjackScore(state.dealer);
  const hands = state.hands.map((hand) => {
    const score = blackjackScore(hand.cards);
    const result: BlackjackResult =
      score > 21
        ? 'busted'
        : natural && score === 21 && dealerScore !== 21
          ? 'blackjack'
          : score === dealerScore
            ? 'push'
            : dealerScore > 21 || score > dealerScore
              ? 'win'
              : 'lose';
    return { ...hand, result };
  });
  const insuranceProfit =
    state.insurance === 0
      ? 0
      : state.dealer.length === 2 && dealerScore === 21
        ? state.insurance * 2
        : -state.insurance;
  const profit = hands.reduce(
    (sum, hand) =>
      sum +
      hand.stake *
        (hand.result === 'blackjack'
          ? 1.5
          : hand.result === 'win'
            ? 1
            : hand.result === 'push'
              ? 0
              : -1),
    insuranceProfit,
  );
  return { ...state, phase: 'finished', hands, profit };
}

function checkNaturals(state: BlackjackState): BlackjackState {
  return blackjackScore(state.dealer) === 21 ||
    blackjackScore(state.hands[0]?.cards ?? []) === 21
    ? settle(state, true)
    : { ...state, phase: 'playing' };
}

export function startBlackjackDemo(deck: BlackjackCard[], stake: number): BlackjackState {
  if (!Number.isFinite(stake) || stake <= 0) return EMPTY_BLACKJACK;
  const [first, dealerFirst, second, dealerSecond, ...remaining] = deck;
  if (!first || !dealerFirst || !second || !dealerSecond) return EMPTY_BLACKJACK;
  const state: BlackjackState = {
    phase: 'playing',
    deck: remaining,
    dealer: [dealerFirst, dealerSecond],
    hands: [{ cards: [first, second], stake, result: 'playing' }],
    activeHand: 0,
    insurance: 0,
    profit: 0,
  };
  return dealerFirst.rank === 'Ace'
    ? { ...state, phase: 'insurance' }
    : checkNaturals(state);
}

export function chooseBlackjackInsurance(
  state: BlackjackState,
  accepted: boolean,
): BlackjackState {
  if (state.phase !== 'insurance') return state;
  return checkNaturals({
    ...state,
    insurance: accepted ? (state.hands[0]?.stake ?? 0) / 2 : 0,
  });
}

export function canSplitBlackjack(state: BlackjackState): boolean {
  const cards = state.hands[0]?.cards;
  return (
    state.phase === 'playing' &&
    state.hands.length === 1 &&
    state.deck.length >= 2 &&
    cards?.length === 2 &&
    cards[0]?.rank === cards[1]?.rank
  );
}

export function canDoubleBlackjack(state: BlackjackState): boolean {
  return (
    state.phase === 'playing' &&
    state.hands.length === 1 &&
    state.hands[0]?.cards.length === 2 &&
    state.deck.length > 0
  );
}

function advanceHand(state: BlackjackState): BlackjackState {
  const next = state.hands.findIndex((hand) => hand.result === 'playing');
  if (next >= 0) return { ...state, activeHand: next };
  const deck = [...state.deck];
  const dealer = [...state.dealer];
  if (state.hands.some((hand) => hand.result !== 'busted')) {
    while (blackjackScore(dealer) < 17 && deck.length > 0) {
      const card = deck.shift();
      if (card) dealer.push(card);
    }
  }
  return settle({ ...state, deck, dealer });
}

export function actBlackjack(
  state: BlackjackState,
  action: BlackjackAction,
): BlackjackState {
  if (state.phase !== 'playing') return state;
  const hand = state.hands[state.activeHand];
  if (!hand || hand.result !== 'playing') return state;
  const deck = [...state.deck];
  const hands = state.hands.map((item) => ({ ...item, cards: [...item.cards] }));
  if (action === 'split') {
    if (!canSplitBlackjack(state)) return state;
    const first = hand.cards[0];
    const second = hand.cards[1];
    const drawFirst = deck.shift();
    const drawSecond = deck.shift();
    if (!first || !second || !drawFirst || !drawSecond) return state;
    return {
      ...state,
      deck,
      activeHand: 0,
      hands: [first, second].map((card, i) => ({
        cards: [card, i === 0 ? drawFirst : drawSecond],
        stake: hand.stake,
        result: 'playing',
      })),
    };
  }
  const current = hands[state.activeHand];
  if (!current) return state;
  if (action === 'stand') current.result = 'stand';
  else {
    if (action === 'double' && !canDoubleBlackjack(state)) return state;
    const card = deck.shift();
    if (!card) return state;
    current.cards.push(card);
    if (action === 'double') current.stake *= 2;
    if (blackjackScore(current.cards) > 21) current.result = 'busted';
    else if (action === 'double') current.result = 'stand';
  }
  return advanceHand({ ...state, deck, hands });
}
