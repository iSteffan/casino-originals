'use client';

import type { PlinkoBoardProps } from './plinko-board/plinko-board.types';
import type { PlinkoConfigProps } from './plinko-config/plinko-config.types';
import type { PlinkoOriginalsViewProps } from './plinko-originals-view';
import {
  plinkoStoryBetAmountTooltip,
  plinkoStoryLabels,
  plinkoStoryRiskLabels,
  plinkoStoryRowsLabels,
} from './plinko-story-helpers';
import type { PlinkoSession } from './use-plinko-session';

import {
  getConfiguredMaxRounds,
  isAutobetActive,
} from '#ui/features/games/originals/core/originals-autobet';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import type { GameWinModalProps } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal.types';
import { useBetAmountDisplay } from '#ui/features/wallet/use-bet-amount-display';
import {
  formatSignedAmountLabel,
  formatWalletAmount,
  formatWalletAmountLabel,
  formatWinRate,
  getFiatStakeUsd,
  SINGLE_BET_THRESHOLD_USD,
} from '#ui/features/wallet/wallet-balances';
import { useAppLayoutState } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';
import { shouldReduceMotion } from '#ui/lib/motion';
import { Image } from '#ui/primitives/data-display/image/image';

function CurrencyIcon({ src, size }: { src: string; size: 20 | 32 }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      wrapperClassName={cn('shrink-0 rounded-ds-full', size === 20 ? 'size-5' : 'size-8')}
      className={cn(size === 20 ? 'size-5' : 'size-8', 'object-contain')}
      showSkeleton={false}
    />
  );
}

function mapAutobetSessionState(
  auto: PlinkoSession['auto'],
  metrics: PlinkoSession['metrics'],
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

/**
 * Maps a Plinko session to presentational props (betstrike
 * `use-plinko-originals-controller` + shared config controls, wallet-backed here).
 */
export function usePlinkoOriginalsController(session: PlinkoSession): PlinkoOriginalsViewProps {
  const { theatreLayoutActive, theatreModeActive } = useAppLayoutState();
  const { wallet } = session;
  const reducedMotion = session.reducedMotion || shouldReduceMotion();

  const amountDisplay = useBetAmountDisplay({
    cryptoValue: session.betAmount,
    currencyId: wallet.currencyId,
    displayFiat: wallet.displayFiat,
    commitCryptoValue: session.commitCryptoBetAmount,
  });

  const exceedsWallet = session.hasStake && !wallet.canAfford(session.betAmount);
  const showThresholdWarning = getFiatStakeUsd(session.betAmount, wallet.currencyId).gt(
    SINGLE_BET_THRESHOLD_USD,
  );

  const maxRounds = getConfiguredMaxRounds(session.rounds);
  const remainingRounds = Math.max(0, maxRounds - session.metrics.roundsCompleted);
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
      session.auto.kind === 'failed' && session.auto.reason === 'insufficient-balance',
    isInterrupted:
      session.auto.kind === 'failed' && session.auto.reason !== 'insufficient-balance',
    isPaused: session.auto.kind === 'paused',
    rounds: session.rounds,
    roundsCompleted: session.metrics.roundsCompleted,
  });
  const autoBetActive = isAutobetActive(session.auto);
  const hasDrops = session.drops.length > 0;

  const config: PlinkoConfigProps = {
    shell: {
      mode: session.mode,
      onModeChange: session.setMode,
      tabsDisabled: session.fieldsDisabled,
      autobetSession: {
        state: mapAutobetSessionState(session.auto, session.metrics),
        totalWagered: formatWalletAmountLabel(
          formatWalletAmount(session.metrics.totalWagered, wallet.currencyId, true),
        ),
        netProfit: formatSignedAmountLabel(session.metrics.netProfit, wallet.currencyId, true),
        winRate: formatWinRate(session.metrics.wins, session.metrics.losses),
      },
      // Betstrike keeps the manual button live while balls fall: each click drops another ball.
      manualActionLabel: plinkoStoryLabels.dropBall,
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: !session.canDropBall || autoBetActive,
      autoActionDisabled:
        session.auto.kind === 'stopping' ||
        (autobetAction.variant !== 'stop' && hasDrops) ||
        (autobetAction.variant === 'start' && (!session.canDropBall || maxRounds <= 0)),
      theatreMode: theatreLayoutActive,
      onManualAction: session.placeManualBet,
      onAutoAction: session.handleAutoAction,
    },
    betAmount: {
      value: amountDisplay.displayValue,
      onChange: amountDisplay.onDisplayChange,
      conversionText: amountDisplay.conversionText,
      tooltip: plinkoStoryBetAmountTooltip,
      currencyIcon: <CurrencyIcon src={wallet.currentBalance.icon} size={20} />,
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
    risk: {
      value: session.risk,
      onChange: session.setRisk,
      options: session.configurations.map((risk) => ({
        value: risk.internalId,
        label: risk.label.split(/\s+/)[0] ?? risk.label,
        ariaLabel: risk.label,
      })),
      labels: plinkoStoryRiskLabels,
    },
    rows: {
      value: session.rows,
      onChange: session.setRows,
      options: session.rowsOptions.map((rows) => ({ value: rows, label: String(rows) })),
      labels: plinkoStoryRowsLabels,
    },
    turboMode: {
      checked: session.turboMode,
      onCheckedChange: session.setTurboMode,
      label: plinkoStoryLabels.turboMode,
    },
  };

  const board: PlinkoBoardProps = {
    rows: session.rows,
    multipliers: session.multipliers,
    drops: session.drops,
    onBallLand: session.onBallLand,
    turboMode: session.turboMode,
    reducedMotion,
    theatreMode: theatreLayoutActive,
    lastResults: session.history,
    lastResultsAriaLabel: plinkoStoryLabels.lastResults,
    resultAnnouncement: session.showWinModal ? undefined : session.resultAnnouncement,
  };

  const winOverlay: GameWinModalProps = {
    open: session.showWinModal,
    title: plinkoStoryLabels.winTitle,
    multiplierLabel: plinkoStoryLabels.multiplier,
    multiplier: session.winMultiplier,
    formattedWinAmount: session.winAmount,
    volume: session.volume,
    reducedMotion,
    currencyIcon: <CurrencyIcon src={wallet.currentBalance.icon} size={32} />,
  };

  return {
    config,
    board,
    winOverlay,
    header: {
      title: plinkoStoryLabels.title,
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

