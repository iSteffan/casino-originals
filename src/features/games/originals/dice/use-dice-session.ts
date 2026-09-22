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
import type { DiceBoardProps } from '#ui/features/games/originals/dice/dice-board/dice-board.types';
import {
  applyDiceDirectionToggle,
  applyDiceDisplayValueUpdate,
  applyDiceMultiplierUpdate,
  applyDiceWinChanceUpdate,
  DICE_DEFAULT_RTP,
  isDiceStoryWin,
  normalizeDiceRtp,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.story-math';
import type {
  DiceControlsActiveField,
  DiceControlsDirection,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.types';
import type {
  DiceCubeAnimationDirection,
  DiceCubeMarkerState,
} from '#ui/features/games/originals/dice/dice-cube/dice-cube.types';
import { DICE_CUBE_ANIMATION_DURATION_MS } from '#ui/features/games/originals/dice/dice-cube/dice-cube.utils';
import type { DiceLastResultItem } from '#ui/features/games/originals/dice/dice-last-results/dice-last-results.types';
import {
  createDiceStoryLastResult,
  playDiceStorySound,
  preloadDiceStorySounds,
  setDiceStorySoundsVolume,
  stopDiceStorySounds,
  type DiceStorySoundName,
} from '#ui/features/games/originals/dice/dice-story-helpers';
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
const WIN_MODAL_MANUAL_HIDE_MS = 2000;
const WIN_MODAL_AUTO_HIDE_MS = 1000;

const INITIAL_LINKED = applyDiceDisplayValueUpdate(
  50.25,
  'UNDER',
  DICE_DEFAULT_RTP,
);

interface PendingRoll {
  rolledValue: number;
  threshold: number;
  direction: DiceControlsDirection;
  betAmount: string;
  multiplier: number;
  auto: boolean;
}

interface DiceSessionState {
  mode: OriginalsConfigMode;
  /** Always stored in selected-currency crypto units. */
  betAmount: string;
  direction: DiceControlsDirection;
  displayValue: number;
  winChance: number;
  multiplier: number;
  activeField: DiceControlsActiveField;
  rtp: number;
  rounds: string;
  theatreMode: boolean;
  volume: number;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  rolledNumber: number;
  markerValue: number | null;
  markerState: DiceCubeMarkerState;
  isAnimating: boolean;
  animationDirection: DiceCubeAnimationDirection;
  lastResults: DiceLastResultItem[];
  resultAnnouncement?: DiceBoardProps['resultAnnouncement'];
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

function getStopConditions(state: DiceSessionState): OriginalStopConditions {
  return {
    isActiveOnWin: state.isActiveOnWin,
    isActiveOnLoss: state.isActiveOnLoss,
    onWin: state.onWinValue,
    onLoss: state.onLossValue,
    stopProfit: state.stopProfitValue,
    stopLoss: state.stopLossValue,
  };
}

function rollDiceValue(): number {
  return Math.random() * 94 + 3;
}

export function useDiceSession() {
  const wallet = useWallet();
  const [state, setState] = useState<DiceSessionState>(() => ({
    mode: 'manual',
    betAmount: '0',
    direction: 'UNDER',
    displayValue: INITIAL_LINKED.displayValue,
    winChance: INITIAL_LINKED.winChance,
    multiplier: INITIAL_LINKED.multiplier,
    activeField: null,
    rtp: DICE_DEFAULT_RTP,
    rounds: '0',
    theatreMode: false,
    volume: 0.75,
    onWinValue: 50,
    onLossValue: 50,
    stopProfitValue: '',
    stopLossValue: '',
    isActiveOnWin: false,
    isActiveOnLoss: false,
    rolledNumber: INITIAL_LINKED.displayValue,
    markerValue: INITIAL_LINKED.displayValue,
    markerState: 'play',
    isAnimating: false,
    animationDirection: 'right',
    lastResults: [],
    showWinModal: false,
    winMultiplier: `x${INITIAL_LINKED.multiplier.toFixed(2)}`,
    winAmount: '0.00',
    auto: { kind: 'idle' },
    metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    initialBet: '0',
  }));

  const pendingRollRef = useRef<PendingRoll | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  const volumeRef = useRef(state.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  stateRef.current = state;
  volumeRef.current = state.volume;

  const playSound = (name: DiceStorySoundName) => {
    const audio = playDiceStorySound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  useEffect(() => {
    preloadDiceStorySounds();
    return () => stopDiceStorySounds(activeSoundsRef.current);
  }, []);

  useEffect(() => {
    setDiceStorySoundsVolume(activeSoundsRef.current, state.volume);
  }, [state.volume]);

  const patchState = (patch: Partial<DiceSessionState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      stateRef.current = next;
      return next;
    });
  };

  const clearSettleTimeout = () => {
    if (settleTimeoutRef.current !== null) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  const applyAutobetEdit = (patch: Partial<DiceSessionState> = {}) => {
    const current = stateRef.current;
    if (current.isAnimating || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    const next = { ...current, ...edited, ...patch };
    stateRef.current = next;
    setState(next);
  };

  const applyLinked = (linked: {
    direction?: DiceControlsDirection;
    displayValue: number;
    winChance: number;
    multiplier: number;
  }) => {
    const current = stateRef.current;
    if (current.isAnimating || isAutobetActive(current.auto)) return;

    const changed =
      (linked.direction !== undefined && linked.direction !== current.direction) ||
      linked.displayValue !== current.displayValue ||
      linked.winChance !== current.winChance ||
      linked.multiplier !== current.multiplier;

    applyAutobetEdit({
      ...(linked.direction ? { direction: linked.direction } : {}),
      displayValue: linked.displayValue,
      winChance: linked.winChance,
      multiplier: linked.multiplier,
    });
    if (changed) playSound('scroll');
  };

  const settleRoll = useEffectEvent(() => {
    const pending = pendingRollRef.current;
    pendingRollRef.current = null;
    settleTimeoutRef.current = null;
    const current = stateRef.current;

    if (!pending) {
      patchState({ isAnimating: false });
      return;
    }

    const { rolledValue, threshold, direction, betAmount, multiplier, auto } =
      pending;
    const isWin = isDiceStoryWin(rolledValue, threshold, direction);
    const bet = new BigNumber(betAmount);
    const payoutAmount = isWin ? bet.times(multiplier).toFixed() : '0';

    const applied = wallet.applyRound({ betAmount, payoutAmount });
    if (!applied) {
      patchState({
        isAnimating: false,
        markerState: 'lose',
        auto: auto
          ? { kind: 'failed', reason: 'insufficient-balance' }
          : current.auto,
      });
      return;
    }

    const result = createDiceStoryLastResult(
      rolledValue,
      isWin ? 'green' : 'red',
    );
    const winLabel = formatWalletAmountLabel(
      formatWalletAmount(payoutAmount, wallet.currencyId, wallet.displayFiat),
    );

    let metrics = current.metrics;
    let nextBet = current.betAmount;
    let autoStatus = current.auto;

    if (auto) {
      const settled = settleAutobetRound(
        { metrics: current.metrics, nextBet: current.betAmount },
        { win: isWin, betAmount, payoutAmount },
        {
          auto: true,
          initialBet: current.initialBet,
          stopConditions: getStopConditions(current),
          fiatRate: getCryptoStakeFloorRate(wallet.currencyId),
        },
      );
      metrics = settled.metrics;
      nextBet = settled.nextBet;

      const canContinue = canContinueAutobet(
        {
          rounds: current.rounds,
          metrics,
          stopConditions: getStopConditions(current),
        },
        '1',
      );

      if (current.auto.kind === 'stopping') {
        autoStatus = { kind: metrics.roundsCompleted > 0 ? 'paused' : 'idle' };
      } else if (!canContinue) {
        autoStatus = { kind: 'idle' };
      }
    }

    patchState({
      isAnimating: false,
      markerState: isWin ? 'win' : 'lose',
      lastResults: [result, ...current.lastResults].slice(0, 40),
      resultAnnouncement: {
        id: result.id,
        message: `${rolledValue.toFixed(2)}. ${isWin ? 'Win' : 'Loss'}.`,
      },
      showWinModal: isWin,
      winMultiplier: `x${multiplier.toFixed(2)}`,
      winAmount: winLabel,
      metrics,
      betAmount: nextBet,
      auto: autoStatus,
    });
  });

  const startRoll = (betAmount: string, auto: boolean) => {
    const current = stateRef.current;
    if (current.isAnimating) return false;
    if (!wallet.canAfford(betAmount)) return false;

    clearSettleTimeout();

    const rolledValue = rollDiceValue();
    const threshold = current.displayValue;
    const prev = current.markerValue ?? threshold;
    const animationDirection: DiceCubeAnimationDirection =
      rolledValue > prev ? 'right' : 'left';

    pendingRollRef.current = {
      rolledValue,
      threshold,
      direction: current.direction,
      betAmount,
      multiplier: current.multiplier,
      auto,
    };

    playSound('roll');

    if (shouldReduceMotion()) {
      patchState({
        markerState: 'play',
        isAnimating: false,
        animationDirection,
        rolledNumber: rolledValue,
        markerValue: rolledValue,
        resultAnnouncement: undefined,
        showWinModal: false,
      });
      settleRoll();
      return true;
    }

    patchState({
      markerState: 'play',
      isAnimating: true,
      animationDirection,
      rolledNumber: rolledValue,
      markerValue: rolledValue,
      resultAnnouncement: undefined,
      showWinModal: false,
    });

    settleTimeoutRef.current = setTimeout(
      settleRoll,
      DICE_CUBE_ANIMATION_DURATION_MS,
    );
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

    if (!wallet.canAfford(current.betAmount)) {
      patchState({
        auto: { kind: 'failed', reason: 'insufficient-balance' },
      });
      return;
    }

    startRoll(current.betAmount, true);
  });

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== 'manual' || current.isAnimating) return;
    if (!new BigNumber(current.betAmount).gt(0)) return;
    if (!wallet.canAfford(current.betAmount)) return;
    startRoll(current.betAmount, false);
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      current.isAnimating ||
      current.mode !== 'auto' ||
      !new BigNumber(current.betAmount).gt(0) ||
      !wallet.canAfford(current.betAmount) ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }

    const next: DiceSessionState = {
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
      current.isAnimating ||
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
    if (current.isAnimating || current.mode === mode) return;
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
    if (current.isAnimating || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    if (rounds === edited.rounds && edited.auto.kind === current.auto.kind) {
      return;
    }
    const next = { ...current, ...edited, rounds };
    stateRef.current = next;
    setState(next);
  };

  const rtpValue = normalizeDiceRtp(state.rtp);

  const toggleDirection = () =>
    applyLinked(
      applyDiceDirectionToggle(state.direction, state.displayValue, rtpValue),
    );

  const changeDisplayValue = (value: number) =>
    applyLinked(
      applyDiceDisplayValueUpdate(value, state.direction, rtpValue),
    );

  const changeWinChance = (value: number) =>
    applyLinked(applyDiceWinChanceUpdate(value, state.direction, rtpValue));

  const changeMultiplier = (value: number) =>
    applyLinked(applyDiceMultiplierUpdate(value, state.direction, rtpValue));

  const continueAfterPresentation = useEffectEvent(runAutoRound);
  useEffect(() => {
    if (!isAutobetActive(state.auto) || state.isAnimating) return undefined;
    const timer = window.setTimeout(
      continueAfterPresentation,
      AUTOBET_CONTINUE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [state.auto, state.isAnimating, state.metrics.roundsCompleted]);

  useEffect(() => {
    if (!state.showWinModal) return undefined;
    const hideMs = isAutobetActive(state.auto)
      ? WIN_MODAL_AUTO_HIDE_MS
      : WIN_MODAL_MANUAL_HIDE_MS;
    const timer = window.setTimeout(() => {
      patchState({ showWinModal: false });
    }, hideMs);
    return () => window.clearTimeout(timer);
  }, [state.showWinModal, state.auto, state.winAmount]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopAutoBet();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopAutoBet);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', stopAutoBet);
      clearSettleTimeout();
    };
  }, []);

  useEffect(() => {
    if (
      isAutobetActive(stateRef.current.auto) ||
      stateRef.current.isAnimating
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
    if (current.isAnimating || isAutobetActive(current.auto)) return;
    const next = new BigNumber(current.betAmount).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const available = new BigNumber(wallet.balances[wallet.currencyId]);
    const capped = BigNumber.min(next, available);
    const digits = WALLET_CRYPTO_FRACTION_DIGITS[wallet.currencyId];
    commitCryptoBetAmount(capped.toFixed(digits));
  };

  return {
    ...state,
    wallet,
    rtpValue,
    fieldsDisabled: state.isAnimating || isAutobetActive(state.auto),
    placeManualBet,
    handleAutoAction,
    setMode,
    setRounds,
    setTheatreMode: (theatreMode: boolean) => patchState({ theatreMode }),
    setVolume: (volume: number) => patchState({ volume }),
    setActiveField: (activeField: DiceControlsActiveField) =>
      applyAutobetEdit({ activeField }),
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
    toggleDirection,
    changeDisplayValue,
    changeWinChance,
    changeMultiplier,
    commitCryptoBetAmount,
    scaleBetAmount,
  };
}

export type DiceSession = ReturnType<typeof useDiceSession>;
