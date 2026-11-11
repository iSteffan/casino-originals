'use client';

import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import {
  DOUBLE_LAST_RESULTS_LIMIT,
  DOUBLE_PHASE_DURATION_MS,
  DOUBLE_SCROLL_SOUND_LEAD_OUT_MS,
  DOUBLE_STATS_WINDOW,
} from './double.constants';
import type {
  DoubleBetType,
  DoubleHistoryItem,
  DoublePhase,
  DoublePlacedBet,
  DoubleResultAnnouncement,
} from './double.types';
import {
  createDoubleBets,
  formatDoubleOutcome,
  getDoubleLast100Stats,
  getDoublePhaseDuration,
  getDoubleTile,
  getDoubleTotalStake,
  rollDoubleTileIndex,
  settleDoubleBets,
  toDoubleOutcome,
  toggleDoubleBetType,
} from './double-engine';
import {
  playDoubleSound,
  preloadDoubleSounds,
  scheduleDoubleScrollSounds,
  setDoubleSoundsVolume,
  stopDoubleSounds,
  type DoubleSoundName,
} from './double-sounds';

import type { CashierCurrencyId } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
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
  getCryptoStakeFloorRate,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from '#ui/features/wallet/wallet-balances';
import { useWallet } from '#ui/features/wallet/wallet-provider';
import { useGameSocket } from '#ui/features/games/shared/socket/game-socket';
import {
  doublePhaseEventSchema,
  doubleResultSchema,
  type DoubleResultPayload,
  doubleStateSchema,
  sendDoubleBetCommand,
} from './double-socket';

interface DoubleRoundState {
  id: number;
  phase: DoublePhase;
  /** Epoch ms; 0 until the loop schedules the first phase (keeps render pure / SSR-safe). */
  phaseEndsAt: number;
  /** Rolled slot (0-13). Between rolls it keeps the previous result so the strip rests on it. */
  tileIndex: number;
}

interface DoubleSessionState {
  mode: OriginalsConfigMode;
  /** Same stake for every pick, stored in selected-currency crypto units. */
  betAmount: string;
  selectedBetTypes: DoubleBetType[];
  rounds: string;
  theatreMode: boolean;
  volume: number;
  round: DoubleRoundState;
  /** Picks accepted for the current round (stake already deducted). */
  bets: DoublePlacedBet[];
  betCurrencyId: CashierCurrencyId | null;
  betsFromAutobet: boolean;
  isPendingBet: boolean;
  isServerSynced: boolean;
  rollDurationMs: number;
  /** Newest first, capped at the last-100 stats window. */
  history: DoubleHistoryItem[];
  resultAnnouncement?: DoubleResultAnnouncement;
  /** Shared GameWinModal payload; open from FINISHED until the next betting window. */
  win: DoubleWinState;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

export interface DoubleWinState {
  open: boolean;
  /** Total payout of the winning picks (crypto units of `currencyId`). */
  payoutAmount: string;
  /** Effective multiplier: total payout / total stake of the round. */
  multiplier: number;
  currencyId: CashierCurrencyId | null;
}

const CLOSED_DOUBLE_WIN: DoubleWinState = {
  open: false,
  payoutAmount: '0',
  multiplier: 0,
  currencyId: null,
};

export interface UseDoubleSessionOptions {
  initialMode?: OriginalsConfigMode;
  initialBetTypes?: DoubleBetType[];
  initialRounds?: string;
  initialTheatreMode?: boolean;
  initialVolume?: number;
  /** Strip slot the board rests on before the first roll. */
  initialTileIndex?: number;
  /** Skips the strip roll animation (the round timing stays the same). */
  reducedMotion?: boolean;
}

/** Legacy Double has no stop conditions; autobet only counts rounds. */
const DOUBLE_STOP_CONDITIONS = DEFAULT_ORIGINAL_STOP_CONDITIONS;

/** Autobet joins the current betting window only if this much time is left. */
const DOUBLE_AUTOBET_JOIN_MIN_MS = 500;

function canEditSettings(current: DoubleSessionState): boolean {
  return (
    current.round.phase === 'BETTING' &&
    current.bets.length === 0 &&
    !current.isPendingBet &&
    !isAutobetActive(current.auto)
  );
}

/**
 * Double session with WebSocket sync and full local offline fallback.
 * When connected to the Double server room (`game:double`), follows server phases
 * (`double:state`, `double:phase`, `double:result`) and sends bets via `double:bet`.
 * When disconnected or unavailable, runs the local round loop BETTING -> LOCKED -> RESOLVING -> FINISHED.
 */
export function useDoubleSession(options: UseDoubleSessionOptions = {}) {
  const {
    initialMode = 'manual',
    initialBetTypes = [],
    initialRounds = '10',
    initialTheatreMode = false,
    initialVolume = 0.75,
    initialTileIndex = 0,
    reducedMotion = false,
  } = options;
  const wallet = useWallet();
  const walletRef = useRef(wallet);
  const { socket, status: socketStatus } = useGameSocket();

  const [state, setState] = useState<DoubleSessionState>(() => ({
    mode: initialMode,
    // Bet field starts empty (stake 0), same as the other originals.
    betAmount: '0',
    selectedBetTypes: [...initialBetTypes],
    rounds: initialRounds,
    theatreMode: initialTheatreMode,
    volume: initialVolume,
    round: { id: 1, phase: 'BETTING', phaseEndsAt: 0, tileIndex: initialTileIndex },
    bets: [],
    betCurrencyId: null,
    betsFromAutobet: false,
    isPendingBet: false,
    isServerSynced: false,
    rollDurationMs: DOUBLE_PHASE_DURATION_MS.RESOLVING,
    history: [],
    win: CLOSED_DOUBLE_WIN,
    auto: { kind: 'idle' },
    metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    initialBet: '0',
  }));

  const stateRef = useRef(state);
  const volumeRef = useRef(state.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const cancelScrollRef = useRef<(() => void) | null>(null);
  const cancelBetSocketRef = useRef<(() => void) | null>(null);
  const settledRoundIdRef = useRef<number | null>(null);
  const pendingServerResultsRef = useRef<Map<number, DoubleResultPayload>>(new Map());

  useLayoutEffect(() => {
    walletRef.current = wallet;
    volumeRef.current = state.volume;
  });

  /** Synchronous commit so timers, clicks and wallet updates never read stale state. */
  const commit = useCallback((patch: Partial<DoubleSessionState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const playSound = (name: DoubleSoundName) => {
    const audio = playDoubleSound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  const stopScrollSounds = () => {
    cancelScrollRef.current?.();
    cancelScrollRef.current = null;
  };

  useEffect(() => {
    preloadDoubleSounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      cancelBetSocketRef.current?.();
      cancelBetSocketRef.current = null;
      cancelScrollRef.current?.();
      cancelScrollRef.current = null;
      stopDoubleSounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setDoubleSoundsVolume(activeSoundsRef.current, state.volume);
  }, [state.volume]);

  const commitPlacedBets = (
    bets: DoublePlacedBet[],
    currencyId: CashierCurrencyId,
    fromAutobet: boolean,
  ): boolean => {
    const total = bets.reduce((acc, bet) => acc.plus(bet.amount), new BigNumber(0)).toFixed();
    if (!walletRef.current.applyRound({ betAmount: total, payoutAmount: '0' })) {
      commit({ isPendingBet: false });
      return false;
    }

    commit({
      bets,
      betCurrencyId: currencyId,
      betsFromAutobet: fromAutobet,
      isPendingBet: false,
    });
    return true;
  };

  /** Places every selected pick with the same stake; all or nothing. */
  const placeBets = (fromAutobet: boolean): boolean => {
    const current = stateRef.current;
    const { round } = current;
    if (
      round.phase !== 'BETTING' ||
      round.phaseEndsAt <= Date.now() ||
      current.bets.length > 0 ||
      current.isPendingBet
    ) {
      return false;
    }
    const currentWallet = walletRef.current;
    const currencyId = currentWallet.currencyId;
    const betTypesSnapshot = [...current.selectedBetTypes];
    const bets = createDoubleBets({
      amount: current.betAmount,
      types: betTypesSnapshot,
      available: currentWallet.balances[currencyId],
    });
    if (!bets) return false;

    if (socketStatus === 'connected' && socket && current.isServerSynced) {
      commit({ isPendingBet: true });
      cancelBetSocketRef.current?.();
      cancelBetSocketRef.current = sendDoubleBetCommand(
        socket,
        {
          amount: current.betAmount,
          currencyId,
          types: betTypesSnapshot,
          roundId: round.id,
        },
        {
          onAccepted: () => {
            cancelBetSocketRef.current = null;
            commitPlacedBets(bets, currencyId, fromAutobet);
          },
          onError: (errMsg, { isRejection }) => {
            cancelBetSocketRef.current = null;
            if (isRejection) {
              console.warn('[Double] Bet rejected by server:', errMsg);
              commit({ isPendingBet: false });
              return;
            }
            console.warn('[Double] Socket bet failed, falling back to local round:', errMsg);
            commitPlacedBets(bets, currencyId, fromAutobet);
          },
        },
      );
      return true;
    }

    return commitPlacedBets(bets, currencyId, fromAutobet);
  };

  const placeAutoBet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== 'running') return;
    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions: DOUBLE_STOP_CONDITIONS },
        '1',
      )
    ) {
      commit({ auto: { kind: 'idle' } });
      return;
    }
    if (!placeBets(true)) {
      commit({ auto: { kind: 'failed', reason: 'insufficient-balance' } });
    }
  };

  const creditPayout = (currencyId: CashierCurrencyId, payoutAmount: string) => {
    const currentWallet = walletRef.current;
    currentWallet.setBalance(
      currencyId,
      new BigNumber(currentWallet.balances[currencyId]).plus(payoutAmount).toFixed(),
    );
  };

  const finishRound = (
    now: number,
    targetRoundId?: number,
    targetTileIndex?: number,
    serverPhaseEndsAt?: number,
  ) => {
    stopScrollSounds();
    const current = stateRef.current;
    const { round } = current;
    const roundId = targetRoundId ?? round.id;
    const tileIndex = targetTileIndex ?? round.tileIndex;

    if (settledRoundIdRef.current === roundId) return;
    settledRoundIdRef.current = roundId;

    const serverResult = pendingServerResultsRef.current.get(roundId);
    pendingServerResultsRef.current.delete(roundId);

    const outcome = serverResult?.outcome ?? toDoubleOutcome(getDoubleTile(tileIndex));
    const historyItem: DoubleHistoryItem = { id: `double-roll-${roundId}`, ...outcome };
    let message = `Rolled ${formatDoubleOutcome(outcome)}.`;
    let metrics = current.metrics;
    let auto = current.auto;
    let won = false;
    let win = current.win;

    if (current.bets.length > 0 && current.betCurrencyId) {
      const settlement = serverResult
        ? {
            betAmount: serverResult.betAmount,
            payoutAmount: serverResult.payoutAmount,
            win: serverResult.isWin,
          }
        : settleDoubleBets(current.bets, outcome);
      won = settlement.win;
      if (settlement.win) {
        creditPayout(current.betCurrencyId, settlement.payoutAmount);
        const stake = new BigNumber(settlement.betAmount);
        win = {
          open: true,
          payoutAmount: settlement.payoutAmount,
          multiplier: stake.gt(0)
            ? new BigNumber(settlement.payoutAmount).div(stake).toNumber()
            : 0,
          currencyId: current.betCurrencyId,
        };
      }
      message += settlement.win ? ' You won.' : ' You lost.';

      if (current.betsFromAutobet) {
        metrics = settleAutobetRound(
          { metrics: current.metrics, nextBet: current.betAmount },
          {
            win: settlement.win,
            betAmount: settlement.betAmount,
            payoutAmount: settlement.payoutAmount,
          },
          {
            auto: true,
            initialBet: current.initialBet,
            stopConditions: DOUBLE_STOP_CONDITIONS,
            fiatRate: getCryptoStakeFloorRate(current.betCurrencyId),
          },
        ).metrics;
        if (auto.kind === 'stopping') {
          auto = { kind: metrics.roundsCompleted > 0 ? 'paused' : 'idle' };
        } else if (
          auto.kind === 'running' &&
          !canContinueAutobet(
            { rounds: current.rounds, metrics, stopConditions: DOUBLE_STOP_CONDITIONS },
            '1',
          )
        ) {
          auto = { kind: 'idle' };
        }
      }
    }

    commit({
      round: {
        id: roundId,
        phase: 'FINISHED',
        phaseEndsAt: serverPhaseEndsAt ?? now + DOUBLE_PHASE_DURATION_MS.FINISHED,
        tileIndex,
      },
      history: [historyItem, ...current.history].slice(0, DOUBLE_STATS_WINDOW),
      resultAnnouncement: { id: historyItem.id, message },
      win,
      metrics,
      auto,
    });
    if (won) playSound('win');
  };

  const handleServerState = useEffectEvent((raw: unknown) => {
    const parsed = doubleStateSchema.safeParse(raw);
    if (!parsed.success) return;
    const data = parsed.data;
    const now = Date.now();
    const current = stateRef.current;
    const phaseEndsAt = now + Math.max(0, data.remainingMs);
    const sameRound = current.round.id === data.roundId;

    const rollMs =
      data.phase === 'RESOLVING'
        ? Math.max(200, data.remainingMs)
        : DOUBLE_PHASE_DURATION_MS.RESOLVING;

    stopScrollSounds();
    if (
      data.phase === 'RESOLVING' &&
      data.remainingMs > DOUBLE_SCROLL_SOUND_LEAD_OUT_MS + 200
    ) {
      playSound('start');
      cancelScrollRef.current = scheduleDoubleScrollSounds(() => playSound('scroll'), {
        totalDuration: data.remainingMs - DOUBLE_SCROLL_SOUND_LEAD_OUT_MS,
      });
    }

    commit({
      isServerSynced: true,
      rollDurationMs: rollMs,
      round: {
        id: data.roundId,
        phase: data.phase,
        phaseEndsAt,
        tileIndex: data.tileIndex,
      },
      history:
        data.history.length > 0
          ? data.history.slice(0, DOUBLE_STATS_WINDOW)
          : current.history,
      bets: sameRound ? current.bets : [],
      betCurrencyId: sameRound ? current.betCurrencyId : null,
      betsFromAutobet: sameRound ? current.betsFromAutobet : false,
      win: data.phase === 'BETTING' ? { ...current.win, open: false } : current.win,
    });

    if (
      data.phase === 'BETTING' &&
      data.remainingMs > DOUBLE_AUTOBET_JOIN_MIN_MS &&
      !sameRound
    ) {
      placeAutoBet();
    }
  });

  const handleServerPhase = useEffectEvent((raw: unknown) => {
    const parsed = doublePhaseEventSchema.safeParse(raw);
    if (!parsed.success) return;
    const data = parsed.data;
    const now = Date.now();
    const current = stateRef.current;
    const phaseEndsAt = now + Math.max(0, data.remainingMs);

    if (data.phase === 'BETTING') {
      stopScrollSounds();
      commit({
        isServerSynced: true,
        rollDurationMs: DOUBLE_PHASE_DURATION_MS.RESOLVING,
        round: {
          id: data.roundId,
          phase: 'BETTING',
          phaseEndsAt,
          tileIndex: data.tileIndex,
        },
        bets: [],
        betCurrencyId: null,
        betsFromAutobet: false,
        isPendingBet: false,
        win: { ...current.win, open: false },
      });
      placeAutoBet();
      return;
    }

    if (data.phase === 'LOCKED') {
      commit({
        isServerSynced: true,
        round: {
          id: data.roundId,
          phase: 'LOCKED',
          phaseEndsAt,
          tileIndex: current.round.tileIndex,
        },
      });
      return;
    }

    if (data.phase === 'RESOLVING') {
      const rollMs =
        data.remainingMs > 0 ? data.remainingMs : DOUBLE_PHASE_DURATION_MS.RESOLVING;
      commit({
        isServerSynced: true,
        rollDurationMs: rollMs,
        round: {
          id: data.roundId,
          phase: 'RESOLVING',
          phaseEndsAt: now + rollMs,
          tileIndex: data.tileIndex,
        },
      });
      playSound('start');
      stopScrollSounds();
      cancelScrollRef.current = scheduleDoubleScrollSounds(() => playSound('scroll'), {
        totalDuration: Math.max(100, rollMs - DOUBLE_SCROLL_SOUND_LEAD_OUT_MS),
      });
      return;
    }

    if (data.phase === 'FINISHED') {
      commit({ isServerSynced: true });
      finishRound(now, data.roundId, data.tileIndex, phaseEndsAt);
    }
  });

  const handleServerResult = useEffectEvent((raw: unknown) => {
    const parsed = doubleResultSchema.safeParse(raw);
    if (!parsed.success) return;
    pendingServerResultsRef.current.set(parsed.data.roundId, parsed.data);
  });

  useEffect(() => {
    if (socketStatus !== 'connected' || !socket) {
      cancelBetSocketRef.current?.();
      cancelBetSocketRef.current = null;
      if (stateRef.current.isServerSynced || stateRef.current.isPendingBet) {
        commit({ isServerSynced: false, isPendingBet: false });
      }
      return undefined;
    }

    socket.on('double:state', handleServerState);
    socket.on('double:phase', handleServerPhase);
    socket.on('double:result', handleServerResult);
    socket.emit('double:join');

    return () => {
      socket.off('double:state', handleServerState);
      socket.off('double:phase', handleServerPhase);
      socket.off('double:result', handleServerResult);
      if (socket.connected) {
        socket.emit('double:leave');
      }
    };
  }, [socketStatus, socket, commit]);

  const advancePhase = useEffectEvent(() => {
    const current = stateRef.current;
    const { round } = current;
    const now = Date.now();

    if (round.phaseEndsAt === 0) {
      commit({ round: { ...round, phaseEndsAt: now + getDoublePhaseDuration(round.phase) } });
      return;
    }

    switch (round.phase) {
      case 'BETTING':
        commit({
          round: { ...round, phase: 'LOCKED', phaseEndsAt: now + DOUBLE_PHASE_DURATION_MS.LOCKED },
        });
        return;
      case 'LOCKED': {
        const rollMs = DOUBLE_PHASE_DURATION_MS.RESOLVING;
        commit({
          rollDurationMs: rollMs,
          round: {
            ...round,
            phase: 'RESOLVING',
            tileIndex: rollDoubleTileIndex(),
            phaseEndsAt: now + rollMs,
          },
        });
        playSound('start');
        stopScrollSounds();
        cancelScrollRef.current = scheduleDoubleScrollSounds(() => playSound('scroll'), {
          totalDuration: rollMs - DOUBLE_SCROLL_SOUND_LEAD_OUT_MS,
        });
        return;
      }
      case 'RESOLVING':
        finishRound(now);
        return;
      case 'FINISHED':
        commit({
          rollDurationMs: DOUBLE_PHASE_DURATION_MS.RESOLVING,
          round: {
            id: round.id + 1,
            phase: 'BETTING',
            phaseEndsAt: now + DOUBLE_PHASE_DURATION_MS.BETTING,
            tileIndex: round.tileIndex,
          },
          bets: [],
          betCurrencyId: null,
          betsFromAutobet: false,
          // Modal hides when the next betting window opens (keeps the payload for the fade-out).
          win: { ...current.win, open: false },
        });
        placeAutoBet();
        return;
    }
  });

  // Offline round loop: active whenever not driven by server phases.
  useEffect(() => {
    if (state.isServerSynced) return undefined;
    const delay =
      state.round.phaseEndsAt === 0 ? 0 : Math.max(0, state.round.phaseEndsAt - Date.now());
    const timer = window.setTimeout(() => advancePhase(), delay);
    return () => window.clearTimeout(timer);
  }, [state.isServerSynced, state.round.id, state.round.phase, state.round.phaseEndsAt]);

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== 'manual' || isAutobetActive(current.auto)) return;
    placeBets(false);
  };

  const canAffordSelection = (current: DoubleSessionState) => {
    const currentWallet = walletRef.current;
    return (
      createDoubleBets({
        amount: current.betAmount,
        types: current.selectedBetTypes,
        available: currentWallet.balances[currentWallet.currencyId],
      }) !== null
    );
  };

  const joinCurrentWindow = () => {
    const { round } = stateRef.current;
    if (
      round.phase === 'BETTING' &&
      round.phaseEndsAt - Date.now() > DOUBLE_AUTOBET_JOIN_MIN_MS
    ) {
      placeAutoBet();
    }
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      current.mode !== 'auto' ||
      isAutobetActive(current.auto) ||
      current.bets.length > 0 ||
      current.isPendingBet ||
      !canAffordSelection(current) ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }
    commit({
      initialBet: current.betAmount,
      auto: { kind: 'running' },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    });
    joinCurrentWindow();
  };

  const continueAutobet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== 'paused' && current.auto.kind !== 'failed') return;
    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions: DOUBLE_STOP_CONDITIONS },
        '1',
      )
    ) {
      commit({ auto: { kind: 'idle' } });
      return;
    }
    commit({ auto: { kind: 'running' } });
    joinCurrentWindow();
  };

  const stopAutoBet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== 'running') return;
    // A bet already in this round still settles before the run pauses.
    if ((current.bets.length > 0 || current.isPendingBet) && current.betsFromAutobet) {
      commit({ auto: { kind: 'stopping' } });
      return;
    }
    commit({ auto: { kind: current.metrics.roundsCompleted > 0 ? 'paused' : 'idle' } });
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

  /** Edits are allowed only while bets are open and nothing is placed yet (legacy form). */
  const applySettingsEdit = (patch: Partial<DoubleSessionState>) => {
    const current = stateRef.current;
    if (!canEditSettings(current)) return false;
    commit({ ...prepareAutobetEdit(current), ...patch });
    return true;
  };

  const setMode = (mode: OriginalsConfigMode) => {
    const current = stateRef.current;
    if (!canEditSettings(current) || current.mode === mode) return;
    commit({ mode, auto: { kind: 'idle' }, metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS } });
  };

  const toggleBetType = (type: DoubleBetType) => {
    const current = stateRef.current;
    applySettingsEdit({ selectedBetTypes: toggleDoubleBetType(current.selectedBetTypes, type) });
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
    if (!canEditSettings(current)) return;
    const next = new BigNumber(current.betAmount).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const currentWallet = walletRef.current;
    const available = new BigNumber(currentWallet.balances[currentWallet.currencyId]);
    const capped = BigNumber.min(next, available);
    commitCryptoBetAmount(capped.toFixed(WALLET_CRYPTO_FRACTION_DIGITS[currentWallet.currencyId]));
  };

  // Currency switch clears the stake (empty bet field), same as the other originals.
  // Bets already placed keep settling in the currency they were placed with.
  const resetBetForCurrency = useEffectEvent(() => {
    const current = stateRef.current;
    if (isAutobetActive(current.auto)) stopAutoBet();
    if (current.betAmount === '0') return;
    commit({ betAmount: '0', initialBet: '0' });
  });
  useEffect(() => {
    resetBetForCurrency();
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

  const hasStake = new BigNumber(state.betAmount).gt(0);
  const totalStake = getDoubleTotalStake(state.betAmount, state.selectedBetTypes);
  const canAffordBet =
    createDoubleBets({
      amount: state.betAmount,
      types: state.selectedBetTypes,
      available: wallet.balances[wallet.currencyId],
    }) !== null;
  const editable = canEditSettings(state);

  return {
    ...state,
    socketStatus,
    wallet,
    phase: state.round.phase,
    phaseEndsAt: state.round.phaseEndsAt,
    tileIndex: state.round.tileIndex,
    bettingDurationMs: DOUBLE_PHASE_DURATION_MS.BETTING,
    lastResults: state.history.slice(0, DOUBLE_LAST_RESULTS_LIMIT),
    stats: getDoubleLast100Stats(state.history),
    hasStake,
    /** Stake x picks for the current selection. */
    totalStake,
    hasPlacedBet: state.bets.length > 0,
    /** Stake > 0, at least one pick and enough balance for every pick. */
    canAffordBet,
    canPlaceBet:
      editable && state.round.phaseEndsAt > 0 && state.mode === 'manual' && canAffordBet,
    reducedMotion,
    fieldsDisabled: !editable,
    placeManualBet,
    handleAutoAction,
    setMode,
    toggleBetType,
    setRounds,
    commitCryptoBetAmount,
    scaleBetAmount,
    setTheatreMode,
    setVolume,
  };
}

export type DoubleSession = ReturnType<typeof useDoubleSession>;
