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

import { getConfiguredMaxRounds } from '#ui/features/games/originals/core/originals-autobet';

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
  winningBet: RouletteWheelNumber | '-1';
  result: number | null;
  settlement: RouletteSettleResult | null;
  round: number;
  history: RouletteHistoryItem[];
  showWinModal: boolean;
  balance: number;
  highlightedNumbers: number[];
  wins: number;
}

export interface UseRouletteSessionOptions {
  initialBalance?: number;
  resultHoldMs?: number;
  reducedMotion?: boolean;
}

function isBusy(state: RouletteSessionState): boolean {
  return state.spinning || state.remaining > 0;
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
    balance: initialBalance,
    highlightedNumbers: [],
    wins: 0,
  });
  const stateRef = useRef(state);
  const disposedRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

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
      clearHoldTimer();
      if (autoTimerRef.current !== null) clearTimeout(autoTimerRef.current);
    };
  }, []);

  const finishSpin = useCallback(
    (result: number) => {
      const current = stateRef.current;
      const settlement = settleRouletteBets(current.bets, result);
      const won = settlement.payout > 0;
      const historyItem: RouletteHistoryItem = {
        id: `roll-${current.round + 1}-${result}-${Date.now()}`,
        number: result,
        won,
      };
      update({
        ...current,
        spinning: false,
        winningBet: String(result) as RouletteWheelNumber,
        result,
        settlement,
        round: current.round + 1,
        history: [historyItem, ...current.history].slice(0, 29),
        remaining: Math.max(0, current.remaining - 1),
        showWinModal: won,
        balance: Number((current.balance + settlement.profit).toFixed(2)),
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
    [resultHoldMs, update],
  );

  const beginSpin = useCallback(() => {
    const current = stateRef.current;
    if (disposedRef.current || current.spinning || current.bets.length === 0) return false;
    const stake = sumRouletteStake(current.bets);
    if (stake > current.balance + 1e-9) return false;

    const result = getRandomRouletteNumber();
    clearHoldTimer();
    update({
      ...current,
      spinning: true,
      winningBet: String(result) as RouletteWheelNumber,
      result: null,
      settlement: null,
      showWinModal: false,
      highlightedNumbers: [],
    });

    if (reducedMotionRef.current) {
      setTimeout(() => finishSpin(result), 0);
    }
    return true;
  }, [finishSpin, update]);

  const stopAutoBet = useCallback(() => {
    const current = stateRef.current;
    if (current.remaining > 0) update({ ...current, remaining: 0 });
    if (autoTimerRef.current !== null) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, [update]);

  useEffect(() => {
    if (!state.spinning && state.remaining > 0 && state.bets.length > 0) {
      autoTimerRef.current = setTimeout(() => {
        autoTimerRef.current = null;
        beginSpin();
      }, 900);
      return () => {
        if (autoTimerRef.current !== null) clearTimeout(autoTimerRef.current);
      };
    }
  }, [state.remaining, state.spinning, state.bets.length, beginSpin]);

  const edit = (
    patch: Partial<Pick<RouletteSessionState, 'mode' | 'rounds' | 'chip' | 'bets'>>,
  ) => {
    const current = stateRef.current;
    if (!isBusy(current)) update({ ...current, ...patch });
  };

  return {
    state,
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
      if (nextStake > current.balance + 1e-9) return;
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
      finishSpin(Number(winner));
    },
  };
}

export type RouletteSession = ReturnType<typeof useRouletteSession>;
