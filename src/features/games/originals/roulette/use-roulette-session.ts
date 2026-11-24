'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

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

import type { CashierCurrencyId } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
import { getConfiguredMaxRounds } from '#ui/features/games/originals/core/originals-autobet';
import { useGameSocket } from '#ui/features/games/shared/socket/game-socket';
import {
  fiatToCryptoAmount,
  WALLET_FIAT_RATES,
} from '#ui/features/wallet/wallet-balances';
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
  totalWagered: number;
  totalProfit: number;
}

export interface UseRouletteSessionOptions {
  initialBalance?: number;
  resultHoldMs?: number;
  reducedMotion?: boolean;
}

function getWalletFiatBalance(
  cryptoBalance: string | undefined,
  currencyId: CashierCurrencyId,
): number {
  if (!cryptoBalance) return 0;
  const crypto = new BigNumber(cryptoBalance);
  const rate = new BigNumber(WALLET_FIAT_RATES[currencyId] ?? 1);
  if (!crypto.isFinite() || crypto.lte(0) || !rate.isFinite() || rate.lte(0)) {
    return 0;
  }
  return Number(crypto.times(rate).toFixed(2, BigNumber.ROUND_DOWN));
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

  const wallet = useWallet();
  const initialFiat =
    getWalletFiatBalance(wallet?.balances?.[wallet?.currencyId], wallet?.currencyId) ||
    initialBalance;

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
    balance: initialFiat,
    highlightedNumbers: [],
    wins: 0,
    totalWagered: 0,
    totalProfit: 0,
  });
  const { socket, status: socketStatus, connected } = useGameSocket();
  const cancelSocketRef = useRef<(() => void) | null>(null);
  const pendingServerResultRef = useRef<RouletteSpinResult | null>(null);

  const stateRef = useRef(state);
  const disposedRef = useRef(false);
  const prevCurrencyIdRef = useRef(wallet.currencyId);
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

  // Keep available balance in sync with wallet.balances updates
  useEffect(() => {
    const current = stateRef.current;
    if (isBusy(current)) return;
    const fiat = getWalletFiatBalance(
      wallet.balances[wallet.currencyId],
      wallet.currencyId,
    );
    const stake = sumRouletteStake(current.bets);
    const available = Math.max(0, Number((fiat - stake).toFixed(2)));
    if (Math.abs(current.balance - available) > 0.001) {
      update({
        ...current,
        balance: available,
      });
    }
  }, [wallet.balances, wallet.currencyId, update]);

  // When cashier currency changes, reset bets and sync balance
  useEffect(() => {
    if (prevCurrencyIdRef.current !== wallet.currencyId) {
      prevCurrencyIdRef.current = wallet.currencyId;
      const current = stateRef.current;
      if (!isBusy(current)) {
        const fiat = getWalletFiatBalance(
          wallet.balances[wallet.currencyId],
          wallet.currencyId,
        );
        update({
          ...current,
          bets: [],
          balance: fiat,
        });
      }
    }
  }, [wallet.currencyId, wallet.balances, update]);

  const finishSpin = useCallback(
    (result: number, serverResult?: RouletteSpinResult | null) => {
      const current = stateRef.current;
      const serverRes = serverResult ?? pendingServerResultRef.current;
      pendingServerResultRef.current = null;

      let settlement: RouletteSettleResult;
      let won: boolean;

      if (serverRes && serverRes.winningNumber === result) {
        settlement = {
          profit: Number(serverRes.profit),
          payout: Number(serverRes.payoutAmount),
          winningStake: Number(serverRes.winningStake),
          totalStake: Number(serverRes.totalStake),
        };
        won = serverRes.isWin;
      } else {
        settlement = settleRouletteBets(current.bets, result);
        won = settlement.payout > 0;
      }

      // Convert fiat amounts to crypto units for wallet.applyRound
      const totalStakeNum = settlement.totalStake;
      const payoutNum = settlement.payout;
      const betCrypto = fiatToCryptoAmount(totalStakeNum.toFixed(2), wallet.currencyId);
      const payoutCrypto = payoutNum > 0
        ? fiatToCryptoAmount(payoutNum.toFixed(2), wallet.currencyId)
        : '0';

      if (betCrypto) {
        wallet.applyRound({
          betAmount: betCrypto,
          payoutAmount: payoutCrypto || '0',
        });
      }

      const currentFiat = getWalletFiatBalance(
        wallet.balances[wallet.currencyId],
        wallet.currencyId,
      );
      const postRoundFiat = Number(
        (currentFiat - totalStakeNum + payoutNum).toFixed(2),
      );
      const currentStake = sumRouletteStake(current.bets);
      const endBalance = Math.max(0, Number((postRoundFiat - currentStake).toFixed(2)));

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
        balance: endBalance,
        highlightedNumbers: [result],
        wins: current.wins + (won ? 1 : 0),
        totalWagered: Number((current.totalWagered + totalStakeNum).toFixed(2)),
        totalProfit: Number((current.totalProfit + settlement.profit).toFixed(2)),
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
    const currentFiat = getWalletFiatBalance(
      wallet.balances[wallet.currencyId],
      wallet.currencyId,
    );
    const effectiveBalance = currentFiat > 0 ? currentFiat : current.balance;

    if (stake <= 0 || stake > effectiveBalance + 1e-9) {
      if (current.remaining > 0) {
        update({ ...current, remaining: 0 });
      }
      return false;
    }

    const stakeCrypto = fiatToCryptoAmount(stake.toFixed(2), wallet.currencyId);
    if (stakeCrypto && !wallet.canAfford(stakeCrypto)) {
      if (current.remaining > 0) {
        update({ ...current, remaining: 0 });
      }
      return false;
    }

    clearHoldTimer();
    const nextBalance = Math.max(0, Number((effectiveBalance - stake).toFixed(2)));

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
      const currentFiat = getWalletFiatBalance(
        wallet.balances[wallet.currencyId],
        wallet.currencyId,
      );
      const effectiveFiat = currentFiat > 0 ? currentFiat : current.balance;
      const nextStake = sumRouletteStake(current.bets) + current.chip;
      if (nextStake > effectiveFiat + 1e-9) {
        return;
      }
      const nextBets = addRouletteChip(current.bets, cellId, current.chip);
      const newTotalStake = sumRouletteStake(nextBets);
      update({
        ...current,
        bets: nextBets,
        balance: Math.max(0, Number((effectiveFiat - newTotalStake).toFixed(2))),
      });
    },
    setHighlightedNumbers: (highlightedNumbers: number[]) => {
      if (stateRef.current.spinning) return;
      update({ ...stateRef.current, highlightedNumbers });
    },
    undo: () => {
      const current = stateRef.current;
      if (isBusy(current)) return;
      const currentFiat = getWalletFiatBalance(
        wallet.balances[wallet.currencyId],
        wallet.currencyId,
      );
      const effectiveFiat = currentFiat > 0 ? currentFiat : current.balance;
      const nextBets = current.bets.slice(0, -1);
      const newTotalStake = sumRouletteStake(nextBets);
      update({
        ...current,
        bets: nextBets,
        balance: Math.max(0, Number((effectiveFiat - newTotalStake).toFixed(2))),
      });
    },
    clear: () => {
      const current = stateRef.current;
      if (isBusy(current)) return;
      const currentFiat = getWalletFiatBalance(
        wallet.balances[wallet.currencyId],
        wallet.currencyId,
      );
      const effectiveFiat = currentFiat > 0 ? currentFiat : current.balance;
      update({
        ...current,
        bets: [],
        balance: effectiveFiat,
      });
    },
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
