'use client';

import BigNumber from 'bignumber.js';

import {
  getConfiguredMaxRounds,
  isAutobetActive,
} from '#ui/features/games/originals/core/originals-autobet';
import type { KenoBoardProps } from '#ui/features/games/originals/keno/keno-board/keno-board.types';
import type { KenoConfigProps } from '#ui/features/games/originals/keno/keno-config/keno-config.types';
import {
  createKenoStoryPaytableItems,
  getKenoStoryCellAriaLabel,
  getKenoStoryPaytableItemAriaLabel,
  kenoStoryBetAmountTooltip,
  kenoStoryCellAssets,
  kenoStoryHitsIconSrc,
  kenoStoryPaytableEmptyLabel,
  kenoStoryRiskLabels,
  kenoStoryRiskOptions,
  kenoStoryStopConditionsLabels,
} from '#ui/features/games/originals/keno/keno-story-helpers';
import type { KenoSession } from '#ui/features/games/originals/keno/use-keno-session';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import type { GameWinModalProps } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal.types';
import {
  formatSignedAmountLabel,
  formatWalletAmount,
  formatWalletAmountLabel,
  formatWinRate,
  getFiatStakeUsd,
  SINGLE_BET_THRESHOLD_USD,
} from '#ui/features/wallet/wallet-balances';
import { useBetAmountDisplay } from '#ui/features/wallet/use-bet-amount-display';
import { useAppLayoutState } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';
import { shouldReduceMotion } from '#ui/lib/motion';
import { Image } from '#ui/primitives/data-display/image/image';

import type { KenoOriginalsViewProps } from './keno-originals-view';

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

function mapAutobetSessionState(
  auto: KenoSession['auto'],
  metrics: KenoSession['metrics'],
): AutobetSessionState {
  if (isAutobetActive(auto)) return 'live';
  if (auto.kind === 'failed' && auto.reason === 'insufficient-balance') {
    return 'insufficient-balance';
  }
  if (auto.kind === 'failed') return 'interrupted';
  if (auto.kind === 'paused') return 'paused';
  if (metrics.roundsCompleted > 0) return 'complete';
  return 'ready-to-start';
}

export function useKenoOriginalsController(
  session: KenoSession,
): KenoOriginalsViewProps {
  const { theatreLayoutActive, theatreModeActive } = useAppLayoutState();
  const { wallet } = session;

  const amountDisplay = useBetAmountDisplay({
    cryptoValue: session.betAmount,
    currencyId: wallet.currencyId,
    displayFiat: wallet.displayFiat,
    commitCryptoValue: session.commitCryptoBetAmount,
  });

  const hasStake = new BigNumber(session.betAmount).gt(0);
  const exceedsWallet = hasStake && !wallet.canAfford(session.betAmount);
  const showThresholdWarning = getFiatStakeUsd(
    session.betAmount,
    wallet.currencyId,
  ).gt(SINGLE_BET_THRESHOLD_USD);

  const maxRounds = getConfiguredMaxRounds(session.rounds);
  const remainingRounds = Math.max(
    0,
    maxRounds - session.metrics.roundsCompleted,
  );
  const showRemainingRounds =
    (isAutobetActive(session.auto) ||
      session.auto.kind === 'paused' ||
      session.auto.kind === 'failed') &&
    !(isAutobetActive(session.auto) && remainingRounds === 0);
  const displayedRoundsValue = showRemainingRounds
    ? remainingRounds === Number.POSITIVE_INFINITY
      ? 'Infinity'
      : String(remainingRounds)
    : session.rounds;

  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: session.auto.kind === 'running',
    isGracefulStopPending: session.auto.kind === 'stopping',
    isInsufficientBalance:
      session.auto.kind === 'failed' &&
      session.auto.reason === 'insufficient-balance',
    isInterrupted:
      session.auto.kind === 'failed' &&
      session.auto.reason !== 'insufficient-balance',
    isPaused: session.auto.kind === 'paused',
    rounds: session.rounds,
    roundsCompleted: session.metrics.roundsCompleted,
  });

  const sessionState = mapAutobetSessionState(session.auto, session.metrics);
  const canStart =
    hasStake && !exceedsWallet && session.hasSelection && maxRounds > 0;

  const config: KenoConfigProps = {
    shell: {
      mode: session.mode,
      onModeChange: session.setMode,
      tabsDisabled: session.fieldsDisabled,
      autobetSession: {
        state: sessionState,
        totalWagered: formatWalletAmountLabel(
          formatWalletAmount(
            session.metrics.totalWagered,
            wallet.currencyId,
            true,
          ),
        ),
        netProfit: formatSignedAmountLabel(
          session.metrics.netProfit,
          wallet.currencyId,
          true,
        ),
        winRate: formatWinRate(session.metrics.wins, session.metrics.losses),
      },
      manualActionLabel: session.isRoundPlaying ? 'Playing...' : 'Place Bet',
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: !hasStake || exceedsWallet || !session.hasSelection,
      manualActionPending: session.isRoundPlaying,
      autoActionDisabled:
        session.auto.kind === 'stopping' ||
        (session.isRoundPlaying && autobetAction.variant !== 'stop') ||
        (autobetAction.variant === 'start' && !canStart),
      theatreMode: theatreLayoutActive,
      onManualAction: session.placeManualBet,
      onAutoAction: session.handleAutoAction,
    },
    betAmount: {
      value: amountDisplay.displayValue,
      onChange: amountDisplay.onDisplayChange,
      conversionText: amountDisplay.conversionText,
      tooltip: kenoStoryBetAmountTooltip,
      currencyIcon: <CurrencyIcon src={wallet.currentBalance.icon} size={20} />,
      precision: amountDisplay.precision,
      error:
        exceedsWallet && !isAutobetActive(session.auto)
          ? 'Amount exceeds balance'
          : undefined,
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
    risk: {
      value: session.risk,
      onChange: session.setRisk,
      options: [...kenoStoryRiskOptions],
      labels: kenoStoryRiskLabels,
    },
    stopConditions: {
      labels: kenoStoryStopConditionsLabels,
      onWinValue: session.onWinValue,
      onLossValue: session.onLossValue,
      stopProfitValue: session.stopProfitValue,
      stopLossValue: session.stopLossValue,
      isActiveOnWin: session.isActiveOnWin,
      isActiveOnLoss: session.isActiveOnLoss,
      onWinChange: session.setOnWinValue,
      onLossChange: session.setOnLossValue,
      onStopProfitChange: session.setStopProfitValue,
      onStopLossChange: session.setStopLossValue,
      onWinToggle: session.setIsActiveOnWin,
      onLossToggle: session.setIsActiveOnLoss,
    },
    actions: {
      autoPick: {
        label: 'Auto Pick',
        disabled: session.fieldsDisabled,
        onClick: session.autoPick,
      },
      clearTable: {
        label: 'Clear Table',
        disabled: session.fieldsDisabled || !session.hasBoardState,
        onClick: session.clearTable,
      },
    },
  };

  const board: KenoBoardProps = {
    cells: session.cells,
    assets: kenoStoryCellAssets,
    theatreMode: theatreLayoutActive,
    reducedMotion: shouldReduceMotion(),
    disabled: session.fieldsDisabled,
    gridAriaLabel: 'Keno grid',
    getCellAriaLabel: getKenoStoryCellAriaLabel,
    paytable: {
      items: createKenoStoryPaytableItems(
        Math.max(session.pickedCount, 1),
        session.risk,
      ),
      reachedHits: session.reachedHits,
      empty: session.pickedCount === 0,
      emptyLabel: kenoStoryPaytableEmptyLabel,
      hitsIconSrc: kenoStoryHitsIconSrc,
      'aria-label': 'Keno paytable',
      getItemAriaLabel: getKenoStoryPaytableItemAriaLabel,
    },
    resultAnnouncement: session.showWinModal
      ? undefined
      : session.resultAnnouncement,
    onCellClick: session.toggleCell,
  };

  const winOverlay: GameWinModalProps = {
    open: session.showWinModal,
    title: 'You win!',
    multiplierLabel: 'Multiplier',
    multiplier: session.winMultiplier,
    formattedWinAmount: session.winAmount,
    volume: session.volume,
    currencyIcon: (
      <CurrencyIcon src={wallet.currentBalance.icon} size={32} />
    ),
  };

  const header: KenoOriginalsViewProps['header'] = {
    title: 'Keno',
    volume: session.volume,
    isTheatreMode: session.theatreMode,
    onVolumeChange: session.setVolume,
    onTheatreToggle: () => session.setTheatreMode(!session.theatreMode),
    onBackClick: () => undefined,
  };

  return {
    config,
    board,
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
