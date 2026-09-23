'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import {
  canContinueAutobet,
  EMPTY_ORIGINAL_AUTOBET_METRICS,
  getConfiguredMaxRounds,
  isAutobetActive,
  type OriginalAutobetMetrics,
  type OriginalAutobetStatus,
  type OriginalStopConditions,
  prepareAutobetEdit,
  settleAutobetRound,
} from '#ui/features/games/originals/core/originals-autobet';
import type { KenoBoardProps } from '#ui/features/games/originals/keno/keno-board/keno-board.types';
import type { KenoGridCell } from '#ui/features/games/originals/keno/keno-grid/keno-grid.types';
import {
  autoPickKenoStoryCells,
  countKenoStoryPickedCells,
  createKenoGridCells,
  getKenoStoryPickedNumbers,
  playKenoStorySound,
  preloadKenoStorySounds,
  scheduleKenoStoryManualRound,
  setKenoStorySoundsVolume,
  stopKenoStorySounds,
  toggleKenoStoryCell,
  type KenoStorySoundName,
} from '#ui/features/games/originals/keno/keno-story-helpers';
import type { OriginalsConfigMode } from '#ui/features/games/originals/originals-config/originals-config.types';
import {
  formatWalletAmount,
  formatWalletAmountLabel,
  getCryptoStakeFloorRate,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from '#ui/features/wallet/wallet-balances';
import { useWallet } from '#ui/features/wallet/wallet-provider';
import { shouldReduceMotion } from '#ui/lib/motion';

const AUTOBET_CONTINUE_DELAY_MS = 300;

interface PendingRound {
  betAmount: string;
  multiplier: number;
  isWin: boolean;
  auto: boolean;
}

interface KenoSessionState {
  mode: OriginalsConfigMode;
  /** Always stored in selected-currency crypto units. */
  betAmount: string;
  risk: string;
  rounds: string;
  theatreMode: boolean;
  volume: number;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  cells: KenoGridCell[];
  isRoundPlaying: boolean;
  reachedHits: number | null;
  resultAnnouncement?: KenoBoardProps['resultAnnouncement'];
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

function getStopConditions(state: KenoSessionState): OriginalStopConditions {
  return {
    isActiveOnWin: state.isActiveOnWin,
    isActiveOnLoss: state.isActiveOnLoss,
    onWin: state.onWinValue,
    onLoss: state.onLossValue,
    stopProfit: state.stopProfitValue,
    stopLoss: state.stopLossValue,
  };
}

export function useKenoSession() {
  const wallet = useWallet();
  const [state, setState] = useState<KenoSessionState>(() => ({
    mode: 'manual',
    betAmount: '0',
    risk: 'medium',
    rounds: '0',
    theatreMode: false,
    volume: 0.75,
    onWinValue: 50,
    onLossValue: 50,
    stopProfitValue: '',
    stopLossValue: '',
    isActiveOnWin: false,
    isActiveOnLoss: false,
    cells: createKenoGridCells(),
    isRoundPlaying: false,
    reachedHits: null,
    showWinModal: false,
    winMultiplier: 'x0.00',
    winAmount: '0.00',
    auto: { kind: 'idle' },
    metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    initialBet: '0',
  }));

  const stateRef = useRef(state);
  const volumeRef = useRef(state.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const roundRunIdRef = useRef(0);
  const roundTimersRef = useRef<number[]>([]);
  const pendingRoundRef = useRef<PendingRound | null>(null);
  stateRef.current = state;
  volumeRef.current = state.volume;

  const playSound = (name: KenoStorySoundName) => {
    const audio = playKenoStorySound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  const clearRoundTimers = () => {
    roundTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    roundTimersRef.current = [];
  };

  const cancelRound = () => {
    roundRunIdRef.current += 1;
    clearRoundTimers();
    stopKenoStorySounds(activeSoundsRef.current);
    pendingRoundRef.current = null;
    patchState({
      isRoundPlaying: false,
      reachedHits: null,
      showWinModal: false,
      resultAnnouncement: undefined,
    });
  };

  useEffect(() => {
    preloadKenoStorySounds();
    return () => {
      roundRunIdRef.current += 1;
      clearRoundTimers();
      stopKenoStorySounds(activeSoundsRef.current);
    };
  }, []);

  useEffect(() => {
    setKenoStorySoundsVolume(activeSoundsRef.current, state.volume);
  }, [state.volume]);

  const patchState = (patch: Partial<KenoSessionState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      stateRef.current = next;
      return next;
    });
  };

  const applyAutobetEdit = (patch: Partial<KenoSessionState> = {}) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    const next = { ...current, ...edited, ...patch };
    stateRef.current = next;
    setState(next);
  };

  const startRound = (betAmount: string, auto: boolean) => {
    const current = stateRef.current;
    if (current.isRoundPlaying) return false;

    const pickedNumbers = getKenoStoryPickedNumbers(current.cells);
    if (pickedNumbers.length === 0) return false;
    if (!wallet.canAfford(betAmount)) return false;

    roundRunIdRef.current += 1;
    const runId = roundRunIdRef.current;
    clearRoundTimers();

    pendingRoundRef.current = {
      betAmount,
      multiplier: 0,
      isWin: false,
      auto,
    };

    patchState({ isRoundPlaying: true });

    scheduleKenoStoryManualRound({
      cells: current.cells,
      pickedNumbers,
      risk: current.risk,
      reducedMotion: shouldReduceMotion(),
      betAmount,
      isActive: () => roundRunIdRef.current === runId,
      schedule: (callback, delayMs) => {
        const timer = window.setTimeout(callback, delayMs);
        roundTimersRef.current.push(timer);
      },
      onUpdate: (patch) => {
        if (roundRunIdRef.current !== runId) return;

        const nextPatch: Partial<KenoSessionState> = {
          cells: patch.cells,
          reachedHits: patch.reachedHits,
          showWinModal: patch.showWinModal,
          resultAnnouncement: patch.resultAnnouncement,
        };

        if (patch.winMultiplier !== undefined) {
          nextPatch.winMultiplier = patch.winMultiplier;
        }

        if (patch.reachedHits === null) {
          nextPatch.isRoundPlaying = false;
        }

        if (patch.winMultiplier !== undefined && pendingRoundRef.current) {
          const pending = pendingRoundRef.current;
          pendingRoundRef.current = null;
          const label = patch.winMultiplier.replace(/^x/i, '');
          const multiplier = Number.parseFloat(label);
          const isWin = Number.isFinite(multiplier) && multiplier > 0;
          const bet = new BigNumber(pending.betAmount);
          const payoutAmount = isWin
            ? bet.times(Number.isFinite(multiplier) ? multiplier : 0).toFixed()
            : '0';

          const applied = wallet.applyRound({
            betAmount: pending.betAmount,
            payoutAmount,
          });
          const latest = stateRef.current;

          if (!applied) {
            patchState({
              ...nextPatch,
              isRoundPlaying: false,
              showWinModal: false,
              auto: pending.auto
                ? { kind: 'failed', reason: 'insufficient-balance' }
                : latest.auto,
            });
            return;
          }

          let metrics = latest.metrics;
          let nextBet = latest.betAmount;
          let autoStatus = latest.auto;

          if (pending.auto) {
            const settled = settleAutobetRound(
              { metrics: latest.metrics, nextBet: latest.betAmount },
              {
                win: isWin,
                betAmount: pending.betAmount,
                payoutAmount,
              },
              {
                auto: true,
                initialBet: latest.initialBet,
                stopConditions: getStopConditions(latest),
                fiatRate: getCryptoStakeFloorRate(wallet.currencyId),
              },
            );
            metrics = settled.metrics;
            nextBet = settled.nextBet;

            const canContinue = canContinueAutobet(
              {
                rounds: latest.rounds,
                metrics,
                stopConditions: getStopConditions(latest),
              },
              '1',
            );

            if (latest.auto.kind === 'stopping') {
              autoStatus = {
                kind: metrics.roundsCompleted > 0 ? 'paused' : 'idle',
              };
            } else if (!canContinue) {
              autoStatus = { kind: 'idle' };
            }
          }

          patchState({
            ...nextPatch,
            winAmount: formatWalletAmountLabel(
              formatWalletAmount(
                payoutAmount,
                wallet.currencyId,
                wallet.displayFiat,
              ),
            ),
            metrics,
            betAmount: nextBet,
            auto: autoStatus,
          });
          return;
        }

        patchState(nextPatch);
      },
      onReveal: (result) => {
        playSound(result === 'win' ? 'win' : 'lose');
      },
    });

    return true;
  };

  const runAutoRound = useEffectEvent(() => {
    const current = stateRef.current;
    const stopConditions = getStopConditions(current);

    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions },
        '1',
      )
    ) {
      patchState({ auto: { kind: 'idle' } });
      return;
    }

    if (current.auto.kind === 'stopping') {
      patchState({
        auto: { kind: current.metrics.roundsCompleted > 0 ? 'paused' : 'idle' },
      });
      return;
    }

    if (current.auto.kind !== 'running') return;

    if (getKenoStoryPickedNumbers(current.cells).length === 0) {
      patchState({ auto: { kind: 'idle' } });
      return;
    }

    if (!wallet.canAfford(current.betAmount)) {
      patchState({
        auto: { kind: 'failed', reason: 'insufficient-balance' },
      });
      return;
    }

    startRound(current.betAmount, true);
  });

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== 'manual' || current.isRoundPlaying) return;
    if (!new BigNumber(current.betAmount).gt(0)) return;
    if (getKenoStoryPickedNumbers(current.cells).length === 0) return;
    if (!wallet.canAfford(current.betAmount)) return;
    startRound(current.betAmount, false);
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      current.isRoundPlaying ||
      current.mode !== 'auto' ||
      !new BigNumber(current.betAmount).gt(0) ||
      getKenoStoryPickedNumbers(current.cells).length === 0 ||
      !wallet.canAfford(current.betAmount) ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }

    const next: KenoSessionState = {
      ...current,
      initialBet: current.betAmount,
      auto: { kind: 'running' },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    };
    stateRef.current = next;
    setState(next);
    queueMicrotask(() => runAutoRound());
  };

  const continueAutobet = () => {
    const current = stateRef.current;
    if (
      current.isRoundPlaying ||
      (current.auto.kind !== 'paused' && current.auto.kind !== 'failed')
    ) {
      return;
    }
    if (
      !canContinueAutobet(
        {
          rounds: current.rounds,
          metrics: current.metrics,
          stopConditions: getStopConditions(current),
        },
        '1',
      )
    ) {
      const idle = { ...current, auto: { kind: 'idle' as const } };
      stateRef.current = idle;
      setState(idle);
      return;
    }
    const next = { ...current, auto: { kind: 'running' as const } };
    stateRef.current = next;
    setState(next);
    queueMicrotask(() => runAutoRound());
  };

  const stopAutoBet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== 'running') return;
    const next = { ...current, auto: { kind: 'stopping' as const } };
    stateRef.current = next;
    setState(next);
  };

  const handleAutoAction = () => {
    const current = stateRef.current;
    if (isAutobetActive(current.auto)) {
      stopAutoBet();
      return;
    }
    if (current.auto.kind === 'paused' || current.auto.kind === 'failed') {
      continueAutobet();
      return;
    }
    startAutoBet();
  };

  const setMode = (mode: OriginalsConfigMode) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || current.mode === mode) return;
    if (isAutobetActive(current.auto)) stopAutoBet();
    const next = {
      ...current,
      mode,
      auto: { kind: 'idle' as const },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    };
    stateRef.current = next;
    setState(next);
  };

  const setRounds = (rounds: string) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    if (rounds === edited.rounds && edited.auto.kind === current.auto.kind) {
      return;
    }
    const next = { ...current, ...edited, rounds };
    stateRef.current = next;
    setState(next);
  };

  const setRisk = (risk: string) => {
    applyAutobetEdit({ risk });
  };

  const toggleCell = (number: number) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const nextCells = toggleKenoStoryCell(current.cells, number);
    const didChange = nextCells.some(
      (cell, index) => cell.state !== current.cells[index]?.state,
    );
    if (!didChange) return;

    cancelRound();
    playSound('cell');
    applyAutobetEdit({
      cells: nextCells,
      reachedHits: null,
      showWinModal: false,
      resultAnnouncement: undefined,
    });
  };

  const autoPick = () => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    cancelRound();
    playSound('cell');
    applyAutobetEdit({
      cells: autoPickKenoStoryCells(current.cells),
      reachedHits: null,
      showWinModal: false,
      resultAnnouncement: undefined,
    });
  };

  const clearTable = () => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    cancelRound();
    applyAutobetEdit({
      cells: createKenoGridCells(),
      reachedHits: null,
      showWinModal: false,
      resultAnnouncement: undefined,
    });
  };

  const continueAfterPresentation = useEffectEvent(runAutoRound);
  useEffect(() => {
    if (!isAutobetActive(state.auto) || state.isRoundPlaying) return undefined;
    const timer = window.setTimeout(
      continueAfterPresentation,
      AUTOBET_CONTINUE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [state.auto, state.isRoundPlaying, state.metrics.roundsCompleted]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopAutoBet();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopAutoBet);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', stopAutoBet);
    };
  }, []);

  useEffect(() => {
    if (
      isAutobetActive(stateRef.current.auto) ||
      stateRef.current.isRoundPlaying
    ) {
      return;
    }
    const next = '0';
    applyAutobetEdit({ betAmount: next, initialBet: next });
  }, [wallet.currencyId]);

  const commitCryptoBetAmount = (cryptoAmount: string) => {
    const amount = cryptoAmount || '0';
    applyAutobetEdit({ betAmount: amount, initialBet: amount });
    return amount;
  };

  const scaleBetAmount = (factor: number) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const next = new BigNumber(current.betAmount).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const available = new BigNumber(wallet.balances[wallet.currencyId]);
    const capped = BigNumber.min(next, available);
    const digits = WALLET_CRYPTO_FRACTION_DIGITS[wallet.currencyId];
    commitCryptoBetAmount(capped.toFixed(digits));
  };

  const pickedCount = countKenoStoryPickedCells(state.cells);
  const hasSelection = pickedCount > 0;
  const hasBoardState = state.cells.some(
    (cell) => (cell.state ?? 'idle') !== 'idle',
  );

  return {
    ...state,
    wallet,
    pickedCount,
    hasSelection,
    hasBoardState,
    fieldsDisabled: state.isRoundPlaying || isAutobetActive(state.auto),
    placeManualBet,
    handleAutoAction,
    setMode,
    setRounds,
    setRisk,
    setTheatreMode: (theatreMode: boolean) => patchState({ theatreMode }),
    setVolume: (volume: number) => patchState({ volume }),
    setOnWinValue: (onWinValue: number) => applyAutobetEdit({ onWinValue }),
    setOnLossValue: (onLossValue: number) => applyAutobetEdit({ onLossValue }),
    setStopProfitValue: (stopProfitValue: string) =>
      applyAutobetEdit({ stopProfitValue }),
    setStopLossValue: (stopLossValue: string) =>
      applyAutobetEdit({ stopLossValue }),
    setIsActiveOnWin: (isActiveOnWin: boolean) =>
      applyAutobetEdit({ isActiveOnWin }),
    setIsActiveOnLoss: (isActiveOnLoss: boolean) =>
      applyAutobetEdit({ isActiveOnLoss }),
    toggleCell,
    autoPick,
    clearTable,
    commitCryptoBetAmount,
    scaleBetAmount,
  };
}

export type KenoSession = ReturnType<typeof useKenoSession>;
