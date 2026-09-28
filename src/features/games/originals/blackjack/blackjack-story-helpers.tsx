import type { ReactNode } from 'react';

import type { BlackjackCardVisual } from './blackjack-card/blackjack-card.types';
import type { BlackjackHandVisual } from './blackjack-hand/blackjack-hand.types';
import {
  type BlackjackAction,
  type BlackjackCard,
  type BlackjackState,
  blackjackScore,
  canDoubleBlackjack,
  canSplitBlackjack,
  canStartBlackjackDemo,
  EMPTY_BLACKJACK,
  isBlackjackPlaying,
} from './blackjack-engine';

import { Image } from '#ui/primitives/data-display/image/image';

export const blackjackStoryCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    wrapperClassName="size-5 shrink-0 rounded-ds-full"
    className="size-5 object-contain"
    showSkeleton={false}
  />
);

export const blackjackStoryWinCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={32}
    height={32}
    wrapperClassName="size-8 shrink-0 rounded-ds-full"
    className="size-8 object-contain"
    showSkeleton={false}
  />
);

export const blackjackStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Demo stake only',
  description:
    'Blackjack Storybook runs a local demo deck. No wallet funds are wagered or paid out.',
};

export const blackjackStoryLabels = {
  tableLabel: 'Blackjack table',
  dealerIdle: 'Dealer',
  emptyLabel: 'Deal a demo hand to begin.',
  demoNotice: 'Demo only. No wallet funds are wagered or paid out.',
  amountLabel: 'Demo stake (credits)',
  startLabel: 'Deal demo hand',
  insuranceOffer: 'Insurance available',
  insuranceTerms: 'Dealer shows an Ace. Take insurance for half your stake?',
  insuranceAccept: 'Accept insurance',
  insuranceDecline: 'Decline',
  hit: 'Hit',
  stand: 'Stand',
  double: 'Double',
  split: 'Split',
  hiddenCard: 'Face-down card',
} as const;

const FACE_LABELS: Record<'Jack' | 'Queen' | 'King' | 'Ace', string> = {
  Jack: 'Jack',
  Queen: 'Queen',
  King: 'King',
  Ace: 'Ace',
};

function formatRank(rank: BlackjackCard['rank']): string {
  return rank === 'Jack' || rank === 'Queen' || rank === 'King' || rank === 'Ace'
    ? FACE_LABELS[rank]
    : rank;
}

export function getBlackjackCardSrc(card: BlackjackCard, concealed = false): string {
  return `/img/games/blackjack/cards/${concealed ? 'back' : `${card.rank}-of-${card.suit}`}.png`;
}

export function getBlackjackCardLabel(card: BlackjackCard, concealed = false): string {
  if (concealed) return blackjackStoryLabels.hiddenCard;
  return `${formatRank(card.rank)} of ${card.suit}`;
}

export function toBlackjackCardVisual(
  card: BlackjackCard,
  id: string,
  concealed = false,
): BlackjackCardVisual {
  return {
    id,
    src: getBlackjackCardSrc(card, concealed),
    label: getBlackjackCardLabel(card, concealed),
  };
}

export function buildBlackjackBoardFromState(
  game: BlackjackState,
  round: number,
): {
  dealer: BlackjackCardVisual[];
  dealerLabel: string;
  hands: BlackjackHandVisual[];
  announcement: string;
  announcementId: string;
  emptyLabel: string;
  demoNotice: string;
  tableLabel: string;
  backgroundSrc: string;
} {
  const hideHole = game.phase !== 'finished' && game.dealer.length > 1;
  const dealerVisible = hideHole ? game.dealer.slice(0, 1) : game.dealer;

  return {
    tableLabel: blackjackStoryLabels.tableLabel,
    backgroundSrc: '/img/games/blackjack/blackjack-bg.png',
    dealer: game.dealer.map((card, index) =>
      toBlackjackCardVisual(card, `dealer-${index}`, hideHole && index === 1),
    ),
    dealerLabel:
      game.dealer.length === 0
        ? blackjackStoryLabels.dealerIdle
        : `Dealer - ${blackjackScore(dealerVisible)}`,
    hands: game.hands.map((hand, index) => ({
      id: `hand-${index}`,
      active: game.hands.length > 1 && game.phase === 'playing' && game.activeHand === index,
      score: blackjackScore(hand.cards),
      result: hand.result,
      label: `Hand ${index + 1}`,
      cards: hand.cards.map((card, cardIndex) =>
        toBlackjackCardVisual(card, `hand-${index}-${cardIndex}`),
      ),
    })),
    emptyLabel: blackjackStoryLabels.emptyLabel,
    demoNotice: blackjackStoryLabels.demoNotice,
    announcementId: `${round}:${game.phase}`,
    announcement:
      game.phase === 'finished'
        ? `Demo result: ${game.profit >= 0 ? '+' : ''}${game.profit.toFixed(2)} credits`
        : game.phase === 'insurance'
          ? blackjackStoryLabels.insuranceOffer
          : '',
  };
}

export function getBlackjackStoryActionItems(
  game: BlackjackState,
  onAct: (action: BlackjackAction) => void,
) {
  return (['hit', 'stand', 'double', 'split'] as const).map((action) => ({
    id: action,
    label: blackjackStoryLabels[action],
    disabled:
      game.phase !== 'playing' ||
      (action === 'split' && !canSplitBlackjack(game)) ||
      (action === 'double' && !canDoubleBlackjack(game)),
    onClick: () => onAct(action),
  }));
}

export {
  canDoubleBlackjack,
  canSplitBlackjack,
  canStartBlackjackDemo,
  EMPTY_BLACKJACK,
  isBlackjackPlaying,
};
