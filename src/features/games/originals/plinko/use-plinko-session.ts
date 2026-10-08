'use client';

import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import type { PlinkoBallLandEvent, PlinkoResultAnnouncement } from './plinko-board/plinko-board.types';
import type { PlinkoLastResultItem } from './plinko-last-results/plinko-last-results.types';
import {
  PLINKO_AUTOBET_DELAY_MS,
  PLINKO_CONFIGURATIONS,
  PLINKO_DEFAULT_RISK,
  PLINKO_DEFAULT_ROWS,
  PLINKO_HISTORY_LIMIT,
  PLINKO_WIN_MODAL_HOLD_MS,
} from './plinko.constants';
import {
  formatPlinkoMultiplier,
  resolvePlinkoTable,
  rollPlinkoBucket,
  settlePlinkoDrop,
} from './plinko-engine';
import {
  playPlinkoSound,
  preloadPlinkoSounds,
  setPlinkoSoundsVolume,
  stopPlinkoSounds,
  type PlinkoSoundName,
} from './plinko-sounds';

import {
  canContinueAutobet,
  DEFAULT_ORIGINAL_STOP_CONDITIONS,
  EMPTY_ORIGINAL_AUTOBET_METRICS,
  getConfiguredMaxRounds,
  isAutobetActive,
  type OriginalAutobetMetrics,
  type OriginalAutobetStatus,
  prepareAutobetEdit,
  settleAutobetRound,
} from '#ui/features/games/originals/core/originals-autobet';
import type { OriginalsConfigMode } from '#ui/features/games/originals/originals-config/originals-config.types';
import {
  formatWalletAmount,
  formatWalletAmountLabel,
  getCryptoStakeFloorRate,
  getDefaultCryptoBetAmount,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from '#ui/features/wallet/wallet-balances';
import { useWallet } from '#ui/features/wallet/wallet-provider';
import { shouldReduceMotion } from '#ui/lib/motion';

/** One accepted bet whose ball is still in flight (betstrike `PlinkoDrop`). */
export interface PlinkoSessionDrop {
  id: string;
  bucketIndex: number;
  multiplier: number;
  /** Stake in selected-currency crypto units, settled when the ball lands. */
  betAmount: string;
  payoutAmount: string;
}

interface PlinkoSessionState {
  mode: OriginalsConfigMode;
  /** Always stored in selected-currency crypto units. */
  betAmount: string;
  risk: string;
  rows: number;
  turboMode: boolean;
  rounds: string;
  theatreMode: boolean;
  volume: number;
  drops: PlinkoSessionDrop[];
  history: PlinkoLastResultItem[];
  resultAnnouncement?: PlinkoResultAnnouncement;
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

export interface UsePlinkoSessionOptions {
  initialMode?: OriginalsConfigMode;
  initialRisk?: string;
  initialRows?: number;
  initialTurboMode?: boolean;
  initialRounds?: string;
  initialTheatreMode?: boolean;
  initialVolume?: number;
  /** Forces reduced motion (balls settle instantly, like prefers-reduced-motion). */
  reducedMotion?: boolean;
}

/** Plinko has no stop conditions (removed in betstrike 436d02513); autobet only counts rounds. */
const PLINKO_STOP_CONDITIONS = DEFAULT_ORIGINAL_STOP_CONDITIONS;

function sumPendingStake(drops: readonly PlinkoSessionDrop[]): BigNumber {
  return drops.reduce((sum, drop) => sum.plus(drop.betAmount), new BigNumber(0));
}

/** One more ball must fit on top of every stake still in flight (reserved, not yet settled). */
function canAffordPlinkoDrop(
  wallet: Pick<ReturnType<typeof useWallet>, 'canAfford'>,
  drops: readonly PlinkoSessionDrop[],
  betAmount: string,
): boolean {
  const stake = new BigNumber(betAmount);
  if (!stake.isFinite() || !stake.gt(0)) return false;
  return wallet.canAfford(sumPendingStake(drops).plus(stake).toFixed());
}

/**
 * Frontend-only Plinko session (no server): rolls the bucket locally, keeps
 * overlapping balls in flight like betstrike, reserves in-flight stakes against the
 * wallet and settles each ball (stake + payout) when it lands in its bucket.
 */
export function usePlinkoSession(options: UsePlinkoSessionOptions = {}) {
  const {
    initialMode = 'manual',
    initialRisk = PLINKO_DEFAULT_RISK,
    initialRows = PLINKO_DEFAULT_ROWS,
    initialTurboMode = false,
    initialRounds = '10',
    initialTheatreMode = false,
    initialVolume = 0.75,
    reducedMotion = false,
  } = options;
  const wallet = useWallet();
  const walletRef = useRef(wallet);

  const [state, setState] = useState<PlinkoSessionState>(() => {
    const table = resolvePlinkoTable({ risk: initialRisk, rows: initialRows });
    const betAmount = getDefaultCryptoBetAmount(wallet.currencyId);
    return {
      mode: initialMode,
      betAmount,
      risk: table.configuration?.internalId ?? PLINKO_DEFAULT_RISK,
      rows: table.rows ?? PLINKO_DEFAULT_ROWS,
      turboMode: initialTurboMode,
      rounds: initialRounds,
      theatreMode: initialTheatreMode,
      volume: initialVolume,
      drops: [],
      history: [],
      showWinModal: false,
      winMultiplier: 'x0',
      winAmount: '0.00',
      auto: { kind: 'idle' },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
      initialBet: betAmount,
    };
  });

  const stateRef = useRef(state);
  const dropSeqRef = useRef(0);
  const winModalTimerRef = useRef<number | null>(null);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const volumeRef = useRef(state.volume);
  const reducedMotionRef = useRef(reducedMotion);

  // Handlers read the latest wallet/settings from refs (synced after each render).
  useLayoutEffect(() => {
    walletRef.current = wallet;
    volumeRef.current = state.volume;
    reducedMotionRef.current = reducedMotion;
  });

  /** Synchronous commit so rapid drops / same-frame landings never read stale state. */
  const commit = useCallback((patch: Partial<PlinkoSessionState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const playSound = (name: PlinkoSoundName) => {
    const audio = playPlinkoSound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  const clearWinModalTimer = () => {
    if (winModalTimerRef.current !== null) {
      window.clearTimeout(winModalTimerRef.current);
      winModalTimerRef.current = null;
    }
  };

  useEffect(() => {
    preloadPlinkoSounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      clearWinModalTimer();
      stopPlinkoSounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setPlinkoSoundsVolume(activeSoundsRef.current, state.volume);
  }, [state.volume]);

  const isBusy = (current: PlinkoSessionState) =>
    current.drops.length > 0 || isAutobetActive(current.auto);

  /** Settings edits are blocked while balls are in flight (betstrike `changeSettings`). */
  const applySettingsEdit = (patch: Partial<PlinkoSessionState>) => {
    const current = stateRef.current;
    if (isBusy(current)) return false;
    commit({ ...prepareAutobetEdit(current), ...patch });
    return true;
  };

  const canAffordNextDrop = (current: PlinkoSessionState, betAmount: string) =>
    canAffordPlinkoDrop(walletRef.current, current.drops, betAmount);

  const dropBall = (auto: boolean): boolean => {
    const current = stateRef.current;
    const { betAmount } = current;
    if (!canAffordNextDrop(current, betAmount)) return false;

    const table = resolvePlinkoTable({ risk: current.risk, rows: current.rows });
    if (!table.rows || table.multipliers.length === 0) return false;

    const bucketIndex = rollPlinkoBucket(table.rows);
    const settlement = settlePlinkoDrop(bucketIndex, table.multipliers, betAmount);
    dropSeqRef.current += 1;
    const drop: PlinkoSessionDrop = {
      id: `plinko-drop-${dropSeqRef.current}`,
      bucketIndex,
      multiplier: settlement.multiplier,
      betAmount,
      payoutAmount: settlement.payoutAmount,
    };

    let metrics = current.metrics;
    let autoStatus = current.auto;
    if (auto) {
      // Betstrike settles autobet metrics when the round result is accepted,
      // before the ball presentation finishes.
      metrics = settleAutobetRound(
        { metrics: current.metrics, nextBet: betAmount },
        { win: settlement.win, betAmount, payoutAmount: settlement.payoutAmount },
        {
          auto: true,
          initialBet: current.initialBet,
          stopConditions: PLINKO_STOP_CONDITIONS,
          fiatRate: getCryptoStakeFloorRate(walletRef.current.currencyId),
        },
      ).metrics;
      if (
        !canContinueAutobet(
          { rounds: current.rounds, metrics, stopConditions: PLINKO_STOP_CONDITIONS },
          '1',
        )
      ) {
        autoStatus = { kind: 'idle' };
      }
    }

    commit({ drops: [...current.drops, drop], metrics, auto: autoStatus });
    playSound('drop');
    return true;
  };

  const onBallLand = (event: PlinkoBallLandEvent) => {
    const current = stateRef.current;
    const drop = current.drops.find((entry) => entry.id === event.id);
    if (!drop) return;

    const currentWallet = walletRef.current;
    currentWallet.applyRound({ betAmount: drop.betAmount, payoutAmount: drop.payoutAmount });

    const result: PlinkoLastResultItem = {
      id: drop.id,
      multiplier: drop.multiplier,
      color: event.color,
    };
    // Net win (payout above stake) opens the shared win modal.
    const showWin = drop.multiplier > 1;
    const patch: Partial<PlinkoSessionState> = {
      drops: current.drops.filter((entry) => entry.id !== drop.id),
      history: [result, ...current.history].slice(0, PLINKO_HISTORY_LIMIT),
      resultAnnouncement: { id: drop.id, message: `Landed ${drop.multiplier}x.` },
    };
    if (showWin) {
      patch.showWinModal = true;
      patch.winMultiplier = formatPlinkoMultiplier(drop.multiplier);
      patch.winAmount = formatWalletAmountLabel(
        formatWalletAmount(drop.payoutAmount, currentWallet.currencyId, currentWallet.displayFiat),
      );
    }
    commit(patch);
    playSound('land');

    if (showWin) {
      clearWinModalTimer();
      const holdMs =
        reducedMotionRef.current || shouldReduceMotion()
          ? PLINKO_WIN_MODAL_HOLD_MS.reducedMotion
          : current.turboMode
            ? PLINKO_WIN_MODAL_HOLD_MS.turbo
            : PLINKO_WIN_MODAL_HOLD_MS.normal;
      winModalTimerRef.current = window.setTimeout(() => {
        winModalTimerRef.current = null;
        commit({ showWinModal: false });
      }, holdMs);
    }
  };

  const runAutoRound = useEffectEvent(() => {
    const current = stateRef.current;

    if (current.auto.kind === 'stopping') {
      commit({ auto: { kind: current.metrics.roundsCompleted > 0 ? 'paused' : 'idle' } });
      return;
    }
    if (current.auto.kind !== 'running') return;

    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions: PLINKO_STOP_CONDITIONS },
        '1',
      )
    ) {
      commit({ auto: { kind: 'idle' } });
      return;
    }

    if (!canAffordNextDrop(current, current.betAmount)) {
      commit({ auto: { kind: 'failed', reason: 'insufficient-balance' } });
      return;
    }

    dropBall(true);
  });

  // Autobet drops on a fixed cadence; balls overlap instead of waiting to land.
  // The first ball of a fresh run drops immediately.
  useEffect(() => {
    if (!isAutobetActive(state.auto)) return undefined;
    const cadence = state.turboMode
      ? PLINKO_AUTOBET_DELAY_MS.turbo
      : PLINKO_AUTOBET_DELAY_MS.normal;
    const delay = state.metrics.roundsCompleted === 0 ? 0 : cadence;
    const timer = window.setTimeout(() => runAutoRound(), delay);
    return () => window.clearTimeout(timer);
  }, [state.auto, state.metrics.roundsCompleted, state.turboMode]);

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== 'manual' || isAutobetActive(current.auto)) return;
    dropBall(false);
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      isBusy(current) ||
      current.mode !== 'auto' ||
      !canAffordNextDrop(current, current.betAmount) ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }
    commit({
      initialBet: current.betAmount,
      auto: { kind: 'running' },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    });
  };

  const continueAutobet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== 'paused' && current.auto.kind !== 'failed') return;
    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions: PLINKO_STOP_CONDITIONS },
        '1',
      )
    ) {
      commit({ auto: { kind: 'idle' } });
      return;
    }
    commit({ auto: { kind: 'running' } });
  };

  const stopAutoBet = () => {
    if (stateRef.current.auto.kind !== 'running') return;
    commit({ auto: { kind: 'stopping' } });
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
    if (isBusy(current) || current.mode === mode) return;
    commit({
      mode,
      auto: { kind: 'idle' },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    });
  };

  const setRisk = (risk: string) => {
    if (!PLINKO_CONFIGURATIONS.some((config) => config.internalId === risk)) return;
    if (stateRef.current.risk === risk) return;
    applySettingsEdit({ risk });
  };

  const setRows = (rows: number) => {
    const current = stateRef.current;
    const table = resolvePlinkoTable({ risk: current.risk, rows: current.rows });
    if (!table.rowsOptions.includes(rows) || current.rows === rows) return;
    applySettingsEdit({ rows });
  };

  const setTurboMode = (turboMode: boolean) => {
    if (stateRef.current.turboMode === turboMode) return;
    applySettingsEdit({ turboMode });
  };

  const setRounds = (rounds: string) => {
    const current = stateRef.current;
    if (isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    if (rounds === edited.rounds && edited.auto.kind === current.auto.kind) return;
    commit({ ...edited, rounds });
  };

  const commitCryptoBetAmount = (cryptoAmount: string) => {
    const amount = cryptoAmount || '0';
    if (!applySettingsEdit({ betAmount: amount, initialBet: amount })) {
      return stateRef.current.betAmount;
    }
    return amount;
  };

  const scaleBetAmount = (factor: number) => {
    const current = stateRef.current;
    if (isBusy(current)) return;
    const next = new BigNumber(current.betAmount).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const available = new BigNumber(walletRef.current.balances[walletRef.current.currencyId]);
    const capped = BigNumber.min(next, available);
    const digits = WALLET_CRYPTO_FRACTION_DIGITS[walletRef.current.currencyId];
    commitCryptoBetAmount(capped.toFixed(digits));
  };

  // Currency switch resets the stake to that currency's default (blackjack parity).
  const resetBetForCurrency = useEffectEvent((currencyId: typeof wallet.currencyId) => {
    if (isBusy(stateRef.current)) return;
    const next = getDefaultCryptoBetAmount(currencyId);
    if (stateRef.current.betAmount === next) return;
    applySettingsEdit({ betAmount: next, initialBet: next });
  });
  useEffect(() => {
    resetBetForCurrency(wallet.currencyId);
  }, [wallet.currencyId]);

  const stopAutoBetOnLeave = useEffectEvent(() => stopAutoBet());
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopAutoBetOnLeave();
    };
    const onPageHide = () => stopAutoBetOnLeave();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  const setTheatreMode = useCallback(
    (theatreMode: boolean) => {
      if (stateRef.current.theatreMode !== theatreMode) commit({ theatreMode });
    },
    [commit],
  );
  const setVolume = useCallback(
    (volume: number) => {
      if (stateRef.current.volume !== volume) commit({ volume });
    },
    [commit],
  );

  const table = resolvePlinkoTable({ risk: state.risk, rows: state.rows });
  const pendingStake = sumPendingStake(state.drops).toFixed();
  const hasStake = new BigNumber(state.betAmount).gt(0);

  return {
    ...state,
    wallet,
    configurations: PLINKO_CONFIGURATIONS,
    rowsOptions: table.rowsOptions,
    multipliers: table.multipliers,
    pendingStake,
    hasStake,
    /** Enough balance for one more ball on top of every ball still in flight. */
    canDropBall: canAffordPlinkoDrop(wallet, state.drops, state.betAmount),
    reducedMotion,
    fieldsDisabled: isBusy(state),
    placeManualBet,
    handleAutoAction,
    setMode,
    setRisk,
    setRows,
    setTurboMode,
    setRounds,
    commitCryptoBetAmount,
    scaleBetAmount,
    onBallLand,
    setTheatreMode,
    setVolume,
  };
}

export type PlinkoSession = ReturnType<typeof usePlinkoSession>;
