'use client';

import type { DoubleBoardProps } from './double-board/double-board.types';
import type { DoubleConfigProps } from './double-config/double-config.types';
import type { DoubleOriginalsViewProps } from './double-originals-view';
import {
  doubleStoryBetAmountTooltip,
  doubleStoryBetTypeOptions,
  doubleStoryLabels,
  doubleStoryRoundStatusLabels,
} from './double-story-helpers';
import type { DoubleSession } from './use-double-session';

import {
  getConfiguredMaxRounds,
  isAutobetActive,
} from '#ui/features/games/originals/core/originals-autobet';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { useBetAmountDisplay } from '#ui/features/wallet/use-bet-amount-display';
import { getFiatStakeUsd, SINGLE_BET_THRESHOLD_USD } from '#ui/features/wallet/wallet-balances';
import { useAppLayoutState } from '#ui/layouts/app-header/app-layout-provider';
import { shouldReduceMotion } from '#ui/lib/motion';
import { Image } from '#ui/primitives/data-display/image/image';

function CurrencyIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      wrapperClassName="size-5 shrink-0 rounded-ds-full"
      className="size-5 object-contain"
      showSkeleton={false}
    />
  );
}

function getManualActionLabel(session: DoubleSession): string {
  if (session.phase !== 'BETTING') return doubleStoryLabels.rolling;
  return session.hasPlacedBet ? doubleStoryLabels.betPlaced : doubleStoryLabels.placeBet;
}

/** Maps a Double session to presentational props (wallet-backed, offline round loop). */
export function useDoubleOriginalsController(session: DoubleSession): DoubleOriginalsViewProps {
  const { theatreLayoutActive, theatreModeActive } = useAppLayoutState();
  const { wallet } = session;
  const reducedMotion = session.reducedMotion || shouldReduceMotion();

  const amountDisplay = useBetAmountDisplay({
    cryptoValue: session.betAmount,
    currencyId: wallet.currencyId,
    displayFiat: wallet.displayFiat,
    commitCryptoValue: session.commitCryptoBetAmount,
  });

  const autoBetActive = isAutobetActive(session.auto);
  // Every pick uses the same stake, so the wallet must cover stake x picks.
  const exceedsWallet =
    session.hasStake && !session.hasPlacedBet && !wallet.canAfford(session.totalStake);
  const showThresholdWarning = getFiatStakeUsd(session.betAmount, wallet.currencyId).gt(
    SINGLE_BET_THRESHOLD_USD,
  );

  const maxRounds = getConfiguredMaxRounds(session.rounds);
  const remainingRounds = Math.max(0, maxRounds - session.metrics.roundsCompleted);
  const showRemainingRounds =
    (autoBetActive || session.auto.kind === 'paused' || session.auto.kind === 'failed') &&
    !(autoBetActive && remainingRounds === 0);
  const displayedRoundsValue = showRemainingRounds
    ? remainingRounds === Number.POSITIVE_INFINITY
      ? 'Infinity'
      : String(remainingRounds)
    : session.rounds;

  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: session.auto.kind === 'running',
    isGracefulStopPending: session.auto.kind === 'stopping',
    isInsufficientBalance:
      session.auto.kind === 'failed' && session.auto.reason === 'insufficient-balance',
    isInterrupted:
      session.auto.kind === 'failed' && session.auto.reason !== 'insufficient-balance',
    isPaused: session.auto.kind === 'paused',
    rounds: session.rounds,
    roundsCompleted: session.metrics.roundsCompleted,
  });

  const config: DoubleConfigProps = {
    shell: {
      mode: session.mode,
      onModeChange: session.setMode,
      tabsDisabled: session.fieldsDisabled,
      manualActionLabel: getManualActionLabel(session),
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: !session.canPlaceBet,
      autoActionDisabled:
        session.auto.kind === 'stopping' ||
        (autobetAction.variant === 'start' &&
          (!session.canAffordBet || maxRounds <= 0 || session.hasPlacedBet)),
      theatreMode: theatreLayoutActive,
      onManualAction: session.placeManualBet,
      onAutoAction: session.handleAutoAction,
    },
    betAmount: {
      value: amountDisplay.displayValue,
      onChange: amountDisplay.onDisplayChange,
      conversionText: amountDisplay.conversionText,
      tooltip: doubleStoryBetAmountTooltip,
      currencyIcon: <CurrencyIcon src={wallet.currentBalance.icon} />,
      precision: amountDisplay.precision,
      error: exceedsWallet && !autoBetActive ? 'Amount exceeds balance' : undefined,
      thresholdWarning: showThresholdWarning
        ? {
            title: 'High payout warning',
            description: 'This bet exceeds the recommended payout threshold.',
          }
        : null,
      quickActions: [
        { label: '½', onClick: () => session.scaleBetAmount(0.5) },
        { label: '2x', onClick: () => session.scaleBetAmount(2) },
      ],
    },
    rounds: {
      value: displayedRoundsValue,
      onChange: session.setRounds,
    },
    fieldsDisabled: session.fieldsDisabled,
    betTypes: {
      value: session.selectedBetTypes,
      onToggle: session.toggleBetType,
      options: doubleStoryBetTypeOptions,
      label: doubleStoryLabels.yourBet,
    },
  };

  const board: DoubleBoardProps = {
    phase: session.phase,
    phaseEndsAt: session.phaseEndsAt,
    bettingDurationMs: session.bettingDurationMs,
    rollDurationMs: session.rollDurationMs,
    tileIndex: session.tileIndex,
    lastResults: session.lastResults,
    stats: session.stats,
    title: doubleStoryLabels.boardTitle,
    statusLabels: doubleStoryRoundStatusLabels,
    lastResultsLabels: {
      previousRolls: doubleStoryLabels.previousRolls,
      last100: doubleStoryLabels.last100,
    },
    lastResultsAriaLabel: doubleStoryLabels.lastResults,
    resultAnnouncement: session.resultAnnouncement,
    reducedMotion,
    theatreMode: theatreLayoutActive,
  };

  return {
    config,
    board,
    header: {
      title: doubleStoryLabels.title,
      volume: session.volume,
      isTheatreMode: session.theatreMode,
      onVolumeChange: session.setVolume,
      onTheatreToggle: () => session.setTheatreMode(!session.theatreMode),
      onBackClick: () => undefined,
    },
    theatreMode: theatreLayoutActive,
    theatreModeActive,
    theatreLayoutActive,
    theatreSync: {
      theatreMode: session.theatreMode,
      onExitTheatre: () => session.setTheatreMode(false),
    },
  };
}
