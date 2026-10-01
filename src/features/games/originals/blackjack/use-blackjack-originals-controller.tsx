'use client';

import type { BlackjackConfigProps } from '#ui/features/games/originals/blackjack/blackjack-config/blackjack-config.types';
import { blackjackStoryLabels } from '#ui/features/games/originals/blackjack/blackjack-story-helpers';
import type { BlackjackSession } from '#ui/features/games/originals/blackjack/use-blackjack-session';
import type { GameWinModalProps } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal.types';
import { useBetAmountDisplay } from '#ui/features/wallet/use-bet-amount-display';
import { useAppLayoutState } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';
import { Image } from '#ui/primitives/data-display/image/image';

import type { BlackjackOriginalsViewProps } from './blackjack-originals-view';

function CurrencyIcon({ src, size }: { src: string; size: 20 | 32 }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      wrapperClassName={cn(
        'shrink-0 rounded-ds-full',
        size === 20 ? 'size-5' : 'size-8',
      )}
      className={cn(size === 20 ? 'size-5' : 'size-8', 'object-contain')}
      showSkeleton={false}
    />
  );
}

const blackjackBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export function useBlackjackOriginalsController(
  session: BlackjackSession,
): BlackjackOriginalsViewProps {
  const { theatreLayoutActive, theatreModeActive } = useAppLayoutState();
  const { wallet, game } = session;

  const amountDisplay = useBetAmountDisplay({
    cryptoValue: session.betAmount,
    currencyId: wallet.currencyId,
    displayFiat: wallet.displayFiat,
    commitCryptoValue: session.commitCryptoBetAmount,
  });

  const config: BlackjackConfigProps = {
    amount: amountDisplay.displayValue,
    onAmountChange: amountDisplay.onDisplayChange,
    amountLabel: 'Bet Amount',
    amountTooltip: blackjackBetAmountTooltip,
    conversionText: amountDisplay.conversionText,
    currencyIcon: <CurrencyIcon src={wallet.currentBalance.icon} size={20} />,
    amountQuickActions: [
      { label: '\u00BD', onClick: () => session.scaleBetAmount(0.5) },
      { label: '2x', onClick: () => session.scaleBetAmount(2) },
    ],
    amountError:
      session.exceedsWallet && !game.isGameRunning
        ? 'Amount exceeds balance'
        : undefined,
    thresholdWarning: session.showThresholdWarning
      ? {
          title: 'High payout warning',
          description: 'This bet exceeds the recommended payout threshold.',
        }
      : null,
    startLabel: game.isGameRunning ? 'Hand in play' : 'Deal',
    onStart: session.placeBet,
    startDisabled: !session.canStart,
    playing: game.isGameRunning,
    insurance: game.insuranceOffered
      ? {
          label: blackjackStoryLabels.insuranceTerms,
          acceptLabel: blackjackStoryLabels.insuranceAccept,
          declineLabel: blackjackStoryLabels.insuranceDecline,
          onChoose: (accepted) => session.setInsuranceAccepted(accepted),
        }
      : null,
    actions: session.actions,
  };

  const winOverlay: GameWinModalProps = {
    open: session.winOverlay.open,
    title: 'You win!',
    multiplierLabel: 'Profit',
    multiplier: session.winOverlay.profitLabel,
    formattedWinAmount: session.winOverlay.formattedWinAmount,
    volume: session.volume,
    currencyIcon: (
      <CurrencyIcon src={wallet.currentBalance.icon} size={32} />
    ),
  };

  const header: BlackjackOriginalsViewProps['header'] = {
    title: 'Blackjack',
    volume: session.volume,
    isTheatreMode: session.theatreMode,
    onVolumeChange: session.setVolume,
    onTheatreToggle: () => session.setTheatreMode(!session.theatreMode),
    onBackClick: () => undefined,
  };

  return {
    config,
    winOverlay,
    header,
    theatreMode: theatreLayoutActive,
    theatreModeActive,
    theatreLayoutActive,
    theatreSync: {
      theatreMode: session.theatreMode,
      onExitTheatre: () => session.setTheatreMode(false),
    },
  };
}