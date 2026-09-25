'use client';

import BigNumber from 'bignumber.js';

import {
  getConfiguredMaxRounds,
  isAutobetActive,
} from '#ui/features/games/originals/core/originals-autobet';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import type { GameWinModalProps } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal.types';
import type { TowersCellState } from '#ui/features/games/originals/towers/towers-cell/towers-cell.types';
import type { TowersConfigProps } from '#ui/features/games/originals/towers/towers-config/towers-config.types';
import type { TowersGridProps } from '#ui/features/games/originals/towers/towers-grid/towers-grid.types';
import {
  getTowersStoryGridConfigFromDifficulty,
  getTowersStoryMultiplierValue,
  toTowersPotentialWin,
  towersStoryBetAmountTooltip,
  towersStoryBoardAriaLabel,
  towersStoryCellAssets,
  towersStoryCellAssetsCompact,
  towersStoryDifficultyLabels,
  towersStoryDifficultyOptions,
  towersStoryStopConditionsLabels,
} from '#ui/features/games/originals/towers/towers-story-helpers';
import type { TowersSession } from '#ui/features/games/originals/towers/use-towers-session';
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

import type { TowersOriginalsViewProps } from './towers-originals-view';

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
  auto: TowersSession['auto'],
  metrics: TowersSession['metrics'],
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

function getCellState({
  tile,
  picked,
  selected,
  selecting,
  active,
  rowHasSelection,
}: {
  tile: boolean | null;
  picked: boolean;
  selected: boolean;
  selecting: boolean;
  active: boolean;
  /** True when this row already has a chosen cell in the Auto path. */
  rowHasSelection: boolean;
}): TowersCellState {
  if (tile !== null) {
    if (picked) return tile ? 'trap' : 'safe';
    return tile ? 'revealed-trap' : 'revealed-safe';
  }
  if (selecting) {
    if (selected) return 'auto-selected';
    // Filled rows: only the chosen cell glows; siblings stay idle (no pulse).
    // Empty unlocked row: remaining cells pulse as auto-selectable.
    return rowHasSelection ? 'idle' : 'auto-selectable';
  }
  if (active) return selected ? 'auto-planned-active' : 'active';
  return selected ? 'auto-planned' : 'idle';
}

export function useTowersOriginalsController(
  session: TowersSession,
): TowersOriginalsViewProps {
  const { theatreLayoutActive, theatreModeActive } = useAppLayoutState();
  const { wallet } = session;
  const gridConfig = getTowersStoryGridConfigFromDifficulty(session.difficulty);

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
  const canStartAuto =
    hasStake && !exceedsWallet && session.hasSelection && maxRounds > 0;

  const formatPayout = (cryptoAmount: string) =>
    formatWalletAmountLabel(
      formatWalletAmount(cryptoAmount, wallet.currencyId, wallet.displayFiat),
    );

  const stakeCrypto =
    session.isRoundPlaying || session.showWinModal
      ? session.roundStake
      : session.betAmount;

  const config: TowersConfigProps = {
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
      manualActionLabel: session.isRoundPlaying ? 'Cashout' : 'Place Bet',
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: session.isRoundPlaying
        ? !session.canCashout
        : !hasStake || exceedsWallet,
      manualActionPending: false,
      autoActionDisabled:
        session.auto.kind === 'stopping' ||
        (session.isRoundPlaying && autobetAction.variant !== 'stop') ||
        (autobetAction.variant === 'start' && !canStartAuto),
      theatreMode: theatreLayoutActive,
      onManualAction: session.placeManualBet,
      onAutoAction: session.handleAutoAction,
    },
    betAmount: {
      value: amountDisplay.displayValue,
      onChange: amountDisplay.onDisplayChange,
      conversionText: amountDisplay.conversionText,
      tooltip: towersStoryBetAmountTooltip,
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
        { label: '\u00BD', onClick: () => session.scaleBetAmount(0.5) },
        { label: '2x', onClick: () => session.scaleBetAmount(2) },
      ],
    },
    rounds: {
      value: displayedRoundsValue,
      onChange: session.setRounds,
    },
    fieldsDisabled: session.fieldsDisabled,
    difficulty: {
      value: session.difficulty,
      onChange: session.setDifficulty,
      options: towersStoryDifficultyOptions,
      labels: towersStoryDifficultyLabels,
    },
    stopConditions: {
      labels: towersStoryStopConditionsLabels,
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
      clearSelection: {
        label: 'Clear Selection',
        onClick: session.clearSelection,
        disabled: session.fieldsDisabled || !session.hasSelection,
      },
      random: {
        label: 'Random',
        onClick: session.randomPick,
        visible: session.isRoundPlaying && session.mode === 'manual',
        disabled: !session.isRoundPlaying,
      },
    },
  };

  const board: TowersGridProps = {
    rows: session.matrix.map((row, rowIndex) => {
      const active =
        session.isRoundPlaying && rowIndex === session.clicked.length;
      const multiplier = getTowersStoryMultiplierValue(gridConfig, rowIndex);
      const potentialCrypto = new BigNumber(stakeCrypto || '0')
        .times(multiplier)
        .toFixed();
      const potentialLabel = formatPayout(potentialCrypto);
      const potentialParts = formatWalletAmount(
        potentialCrypto,
        wallet.currencyId,
        wallet.displayFiat,
      );
      const selecting =
        session.mode === 'auto' &&
        !session.isRoundPlaying &&
        !session.fieldsDisabled &&
        rowIndex <= session.selection.length;

      return {
        multiplier: {
          label: `x${multiplier.toFixed(2)}`,
          highlight: active
            ? ('active' as const)
            : rowIndex < session.clicked.length
              ? ('passed' as const)
              : ('upcoming' as const),
        },
        cells: row.map((tile, columnIndex) => {
          const selected = session.selection[rowIndex] === columnIndex;
          const picked = session.clicked[rowIndex] === columnIndex;
          const rowHasSelection = rowIndex < session.selection.length;
          return {
            state: getCellState({
              tile,
              picked,
              selected,
              selecting,
              active,
              rowHasSelection,
            }),
            amountLabel: tile === false && picked ? potentialLabel : undefined,
            potentialWin: active
              ? toTowersPotentialWin(potentialParts)
              : undefined,
            disabled: session.mode === 'auto' ? !selecting : !active,
            'aria-label': `Row ${rowIndex + 1}, tile ${columnIndex + 1}${
              tile === null ? '' : tile ? ', bomb' : ', safe'
            }`,
          };
        }),
      };
    }),
    assets: towersStoryCellAssets,
    mobileAssets: towersStoryCellAssetsCompact,
    theatreMode: theatreLayoutActive,
    reducedMotion: shouldReduceMotion(),
    'aria-label': towersStoryBoardAriaLabel,
    resultAnnouncement: session.showWinModal
      ? undefined
      : session.resultAnnouncement,
    onCellClick: session.clickCell,
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

  const header: TowersOriginalsViewProps['header'] = {
    title: 'Towers',
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
