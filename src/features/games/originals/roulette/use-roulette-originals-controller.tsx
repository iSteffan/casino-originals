'use client';

import { useMemo } from 'react';

import type { RouletteBoardProps } from '#ui/features/games/originals/roulette/roulette-board/roulette-board.types';
import type { RouletteConfigProps } from '#ui/features/games/originals/roulette/roulette-config/roulette-config.types';
import {
  betsToRouletteFieldMap,
  formatRouletteMoney,
  historyToRouletteLastResults,
  rouletteStoryCellAssets,
  rouletteStoryChipOptions,
  rouletteStoryClearIconSrc,
  rouletteStoryLastResultsAssets,
  rouletteStoryUndoIconSrc,
} from '#ui/features/games/originals/roulette/roulette-story-helpers';
import type { RouletteSession } from '#ui/features/games/originals/roulette/use-roulette-session';
import type { OriginalsConfigMode } from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import type { GameWinModalProps } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal.types';
import { useAppLayoutState } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';
import { shouldReduceMotion } from '#ui/lib/motion';
import { Image } from '#ui/primitives/data-display/image/image';

import type { RouletteOriginalsViewProps } from './roulette-originals-view';

function IconImg({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={16}
      height={16}
      wrapperClassName="size-4 shrink-0"
      className="size-4 object-contain"
      showSkeleton={false}
    />
  );
}

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

/**
 * Maps RouletteSession -> RouletteOriginalsView props for the live /games/roulette page.
 * Mirrors the Storybook composition mapping; keep both in sync for shell/board/win overlay.
 */
export function useRouletteOriginalsController(
  session: RouletteSession,
): RouletteOriginalsViewProps {
  const { theatreLayoutActive, theatreModeActive, effectiveSideMenuExpanded } =
    useAppLayoutState();
  const reducedMotion = shouldReduceMotion();
  const { state } = session;
  const autoBetActive = state.remaining > 0;
  const fieldsDisabled = session.fieldsDisabled;
  const fieldCompact = effectiveSideMenuExpanded;
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: autoBetActive,
    startAutobetLabel: 'Start autobet',
  });

  const fieldBets = useMemo(() => betsToRouletteFieldMap(state.bets), [state.bets]);
  const lastResults = useMemo(
    () => historyToRouletteLastResults(state.history),
    [state.history],
  );

  const winRatePct =
    state.round === 0 ? 0 : Math.round((state.wins / state.round) * 100);

  const balanceDelta = state.balance - 1000;
  const netProfitLabel = `${balanceDelta >= 0 ? '+' : ''}${formatRouletteMoney(balanceDelta)}`;
  const totalLabel = `Stake ${formatRouletteMoney(session.totalStake)} | Balance ${formatRouletteMoney(state.balance)}`;

  const undoIcon = <IconImg src={rouletteStoryUndoIconSrc} />;
  const clearIcon = <IconImg src={rouletteStoryClearIconSrc} />;
  const currencyIconSrc = '/icon/animate-icons/strike-coin.svg';

  const config: RouletteConfigProps = {
    shell: {
      mode: state.mode,
      onModeChange: (mode: OriginalsConfigMode) => session.changeMode(mode),
      tabsDisabled: fieldsDisabled,
      theatreMode: theatreLayoutActive,
      manualTabLabel: 'Manual',
      autoTabLabel: 'Auto',
      manualActionLabel: state.spinning ? 'Spinning...' : 'Spin',
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: !session.canStartManualBet,
      manualActionPending: state.spinning && state.mode === 'manual',
      autoActionDisabled: autoBetActive ? false : !session.canStartAutoBet,
      onManualAction: session.startManualBet,
      onAutoAction: autoBetActive ? session.stopAutoBet : session.startAutoBet,
      autobetSession: {
        state: autoBetActive ? 'live' : 'ready-to-start',
        totalWagered: formatRouletteMoney(
          Math.max(0, 1000 - state.balance + session.totalStake),
        ),
        netProfit: netProfitLabel,
        winRate: `${winRatePct}%`,
      },
    },
    chips: rouletteStoryChipOptions,
    selectedChip: state.chip,
    onSelectChip: session.changeChip,
    onUndo: session.undo,
    onClear: session.clear,
    fieldsDisabled,
    totalLabel,
    rounds: state.rounds,
    onRoundsChange: session.changeRounds,
    undoIcon,
    clearIcon,
    labels: {
      chips: 'Chips',
      undo: 'Undo',
      clear: 'Clear',
      rounds: 'Number of Bets',
    },
  };

  const board: RouletteBoardProps = {
    lastResults: {
      items: lastResults,
      assets: rouletteStoryLastResultsAssets,
      label: 'Previous rolls',
    },
    wheel: {
      start: state.spinning && !reducedMotion,
      winningBet: state.winningBet,
      onSpinningEnd: session.onWheelSpinningEnd,
      spinLaps: 5,
      spinDuration: 5,
      spinEaseFunction: 'cubic-bezier(0.73, 0.03, 0.14, 0.96)',
      automaticSpinning: !reducedMotion,
    },
    field: {
      assets: rouletteStoryCellAssets,
      bets: fieldBets,
      highlightedNumbers: state.highlightedNumbers,
      winningNumber: state.result,
      disabled: fieldsDisabled,
      compact: fieldCompact,
      onCellClick: (cellId) => session.placeChip(cellId),
      onHoverNumbersChange: (numbers) => {
        if (state.spinning) return;
        session.setHighlightedNumbers([...numbers]);
      },
    },
  };

  const winOverlay: GameWinModalProps = {
    open: state.showWinModal,
    title: 'You win',
    multiplierLabel: 'Multiplier',
    multiplier: state.winMultiplier,
    // Total payout (settle.payout), not net profit - matches Mines/Keno/Dice/Towers.
    formattedWinAmount: state.winAmount,
    currencyIcon: <CurrencyIcon src={currencyIconSrc} size={32} />,
    volume: session.volume,
    reducedMotion,
  };

  const header: RouletteOriginalsViewProps['header'] = {
    title: 'Roulette',
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