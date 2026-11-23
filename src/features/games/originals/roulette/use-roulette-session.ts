'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  addRouletteChip,
  getRandomRouletteNumber,
  settleRouletteBets,
  sumRouletteStake,
  type RouletteBet,
  type RouletteSettleResult,
} from './roulette-engine';
import { ROULETTE_CHIPS, type RouletteWheelNumber } from './roulette.constants';

import {
  playRouletteSound,
  preloadRouletteSounds,
  setRouletteSoundsVolume,
  stopRouletteSounds,
  type RouletteSoundName,
} from './roulette-sounds';

import { getConfiguredMaxRounds } from '#ui/features/games/originals/core/originals-autobet';
import { useGameSocket } from '#ui/features/games/shared/socket/game-socket';
import { useWallet } from '#ui/features/wallet/wallet-provider';

import {
  sendRouletteSpinCommand,
  type RouletteSpinResult,
} from './roulette-socket';

export interface RouletteHistoryItem {
  id: string;
  number: number;
  won: boolean;
}

export interface RouletteSessionState {
  bets: RouletteBet[];
  chip: number;
  mode: 'manual' | 'auto';
  rounds: string;
  remaining: number;
  spinning: boolean;
  isPendingBet?: boolean;
  winningBet: RouletteWheelNumber | '-1';
  result: number | null;
  settlement: RouletteSettleResult | null;
  round: number;
  history: RouletteHistoryItem[];
  showWinModal: boolean;
  /** Formatted total payout (gross return on winning bets) - same kind of value peers pass to GameWinModal. */
  winAmount: string;
  /** Total-return multiplier label, e.g. x2.00 (payout / winningStake). */
  winMultiplier: string;
  balance: number;
  highlightedNumbers: number[];
  wins: number;
}

export interface UseRouletteSessionOptions {
  initialBalance?: number;
  resultHoldMs?: number;
  reducedMotion?: boolean;
}

function formatRouletteWinAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRouletteWinMultiplier(payout: number, winningStake: number): string {
  const mult = winningStake > 0 ? payout / winningStake : 0;
  return `x${mult > 0 ? mult.toFixed(2) : '0.00'}`;
}

function isBusy(state: RouletteSessionState): boolean {
  return state.spinning || Boolean(state.isPendingBet) || state.remaining > 0;
}

export function useRouletteSession(options: UseRouletteSessionOptions = {}) {
  const {
    initialBalance = 1000,
    resultHoldMs = 2800,
    reducedMotion = false,
  } = options;

  const [state, setState] = useState<RouletteSessionState>({
    bets: [],
    chip: 1,
    mode: 'manual',
    rounds: '10',
    remaining: 0,
    spinning: false,
    winningBet: '-1',
    result: null,
    settlement: null,
    round: 0,
    history: [],
    showWinModal: false,
    winAmount: '0.00',
    winMultiplier: 'x0.00',
    balance: initialBalance,
    highlightedNumbers: [],
    wins: 0,
  });
  const wallet = useWallet();
  const { socket, status: socketStatus, connected } = useGameSocket();
  const cancelSocketRef = useRef<(() => void) | null>(null);
  const pendingServerResultRef = useRef<RouletteSpinResult | null>(null);

  const stateRef = useRef(state);
  const disposedRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(reducedMotion);
  const [theatreMode, setTheatreMode] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const volumeRef = useRef(volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const playSound = useCallback((name: RouletteSoundName) => {
    const audio = playRouletteSound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  }, []);

  useEffect(() => {
    preloadRouletteSounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      stopRouletteSounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setRouletteSoundsVolume(activeSoundsRef.current, volume);
  }, [volume]);

  const update = useCallback((next: RouletteSessionState) => {
    if (disposedRef.current) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      cancelSocketRef.current?.();
      cancelSocketRef.current = null;
      clearHoldTimer();
      if (autoTimerRef.current !== null) clearTimeout(autoTimerRef.current);
    };
  }, []);

  const finishSpin = useCallback(
    (result: number, serverResult?: RouletteSpinResult | null) => {
      const current = stateRef.current;
      const serverRes = serverResult ?? pendingServerResultRef.current;
      pendingServerResultRef.current = null;

      let settlement: RouletteSettleResult;
      let won: boolean;
      let totalStakeStr: string;
      let payoutStr: string;

      if (serverRes && serverRes.winningNumber === result) {
        settlement = {
          profit: Number(serverRes.profit),
          payout: Number(serverRes.payoutAmount),
          winningStake: Number(serverRes.winningStake),
          totalStake: Number(serverRes.totalStake),
        };
        won = serverRes.isWin;
        totalStakeStr = serverRes.totalStake;
        payoutStr = serverRes.payoutAmount;
      } else {
        settlement = settleRouletteBets(current.bets, result);
        won = settlement.payout > 0;
        totalStakeStr = settlement.totalStake.toFixed();
        payoutStr = settlement.payout.toFixed();
      }

      wallet.applyRound({
        betAmount: totalStakeStr,
        payoutAmount: payoutStr,
      });

      const historyItem: RouletteHistoryItem = {
        id: `roll-${current.round + 1}-${result}-${Date.now()}`,
        number: result,
        won,
      };

      update({
        ...current,
        spinning: false,
        isPendingBet: false,
        winningBet: String(result) as RouletteWheelNumber,
        result,
        settlement,
        round: current.round + 1,
        history: [historyItem, ...current.history].slice(0, 29),
        remaining: Math.max(0, current.remaining - 1),
        showWinModal: won,
        winAmount: formatRouletteWinAmount(settlement.payout),
        winMultiplier: formatRouletteWinMultiplier(
          settlement.payout,
          settlement.winningStake,
        ),
        balance: Number((current.balance + settlement.payout).toFixed(2)),
        highlightedNumbers: [result],
        wins: current.wins + (won ? 1 : 0),
      });

      clearHoldTimer();
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null;
        const latest = stateRef.current;
        update({
          ...latest,
          showWinModal: false,
        });
      }, resultHoldMs);
    },
    [resultHoldMs, update, wallet],
  );

  const beginSpin = useCallback(() => {
    const current = stateRef.current;
    if (
      disposedRef.current ||
      current.spinning ||
      current.isPendingBet ||
      current.bets.length === 0
    ) {
      return false;
    }

    const stake = sumRouletteStake(current.bets);
    const stakeStr = stake.toString();
    if (stake > current.balance + 1e-9 && !wallet.canAfford(stakeStr)) {
      if (current.remaining > 0) {
        update({ ...current, remaining: 0 });
      }
      return false;
    }

    clearHoldTimer();
    const nextBalance = Number((current.balance - stake).toFixed(2));

    const triggerLocalSpin = () => {
      const localResult = getRandomRouletteNumber();
      pendingServerResultRef.current = null;
      update({
        ...current,
        spinning: true,
        isPendingBet: false,
        winningBet: String(localResult) as RouletteWheelNumber,
        result: null,
        settlement: null,
        showWinModal: false,
        winAmount: '0.00',
        winMultiplier: 'x0.00',
        highlightedNumbers: [],
        balance: nextBalance,
      });

      playSound('ballSpin');

      if (reducedMotionRef.current) {
        setTimeout(() => finishSpin(localResult, null), 0);
      }
    };

    if (socket && connected) {
      cancelSocketRef.current?.();
      update({
        ...current,
        isPendingBet: true,
        showWinModal: false,
        highlightedNumbers: [],
      });

      cancelSocketRef.current = sendRouletteSpinCommand(
        socket,
        {
          bets: current.bets.map((b) => ({
            cellId: b.cellId,
            amount: b.amount.toString(),
          })),
          currencyId: wallet.currencyId,
        },
        {
          onResult: (res: RouletteSpinResult) => {
            cancelSocketRef.current = null;
            pendingServerResultRef.current = res;
            const latest = stateRef.current;
            update({
              ...latest,
              spinning: true,
              isPendingBet: false,
              winningBet: String(res.winningNumber) as RouletteWheelNumber,
              result: null,
              settlement: null,
              showWinModal: false,
              winAmount: '0.00',
              winMultiplier: 'x0.00',
              highlightedNumbers: [],
              balance: nextBalance,
            });

            playSound('ballSpin');

            if (reducedMotionRef.current) {
              setTimeout(() => finishSpin(res.winningNumber, res), 0);
            }
          },
          onError: (errMsg) => {
            console.warn(
              '[Roulette] Socket spin error, falling back to local RNG:',
              errMsg,
            );
            cancelSocketRef.current = null;
            triggerLocalSpin();
          },
        },
      );
      return true;
    }

    triggerLocalSpin();
    return true;
  }, [connected, finishSpin, playSound, socket, update, wallet]);

  const stopAutoBet = useCallback(() => {
    const current = stateRef.current;
    if (current.remaining > 0) update({ ...current, remaining: 0 });
    if (autoTimerRef.current !== null) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, [update]);

  useEffect(() => {
    if (
      !state.spinning &&
      !state.isPendingBet &&
      state.remaining > 0 &&
      state.bets.length > 0
    ) {
      autoTimerRef.current = setTimeout(() => {
        autoTimerRef.current = null;
        beginSpin();
      }, 900);
      return () => {
        if (autoTimerRef.current !== null) clearTimeout(autoTimerRef.current);
      };
    }
  }, [state.remaining, state.spinning, state.isPendingBet, state.bets.length, beginSpin]);

  const edit = (
    patch: Partial<Pick<RouletteSessionState, 'mode' | 'rounds' | 'chip' | 'bets'>>,
  ) => {
    const current = stateRef.current;
    if (!isBusy(current)) update({ ...current, ...patch });
  };

  return {
    state,
    theatreMode,
    volume,
    setTheatreMode,
    setVolume,
    fieldsDisabled: isBusy(state),
    canStartManualBet: !isBusy(state) && state.bets.length > 0 && state.mode === 'manual',
    canStartAutoBet:
      !isBusy(state) &&
      state.bets.length > 0 &&
      state.mode === 'auto' &&
      getConfiguredMaxRounds(state.rounds) > 0,
    totalStake: sumRouletteStake(state.bets),
    changeMode: (mode: 'manual' | 'auto') => edit({ mode }),
    changeRounds: (rounds: string) => edit({ rounds }),
    changeChip: (chip: number) => {
      if (ROULETTE_CHIPS.some((item) => item.value === chip)) edit({ chip });
    },
    placeChip: (cellId: string) => {
      const current = stateRef.current;
      if (isBusy(current)) return;
      const nextStake = sumRouletteStake(current.bets) + current.chip;
      if (
        nextStake > current.balance + 1e-9 &&
        !wallet.canAfford(nextStake.toString())
      ) {
        return;
      }
      update({
        ...current,
        bets: addRouletteChip(current.bets, cellId, current.chip),
      });
    },
    setHighlightedNumbers: (highlightedNumbers: number[]) => {
      if (stateRef.current.spinning) return;
      update({ ...stateRef.current, highlightedNumbers });
    },
    undo: () => edit({ bets: stateRef.current.bets.slice(0, -1) }),
    clear: () => edit({ bets: [] }),
    startManualBet: () => {
      const current = stateRef.current;
      if (current.mode === 'manual' && !isBusy(current)) beginSpin();
    },
    startAutoBet: () => {
      const current = stateRef.current;
      const remaining = getConfiguredMaxRounds(current.rounds);
      if (
        current.mode === 'auto' &&
        !isBusy(current) &&
        current.bets.length > 0 &&
        remaining > 0
      ) {
        update({ ...current, remaining });
      }
    },
    stopAutoBet,
    onWheelSpinningEnd: (winner: RouletteWheelNumber) => {
      const current = stateRef.current;
      if (!current.spinning) return;
      if (String(current.winningBet) !== winner) return;
      finishSpin(Number(winner), pendingServerResultRef.current);
    },
    socketStatus,
    isPendingBet: Boolean(state.isPendingBet),
  };
}

export type RouletteSession = ReturnType<typeof useRouletteSession>;
