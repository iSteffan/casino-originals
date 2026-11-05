"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import BigNumber from "bignumber.js";

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
} from "#ui/features/games/originals/core/originals-autobet";
import type { OriginalsConfigMode } from "#ui/features/games/originals/originals-config/originals-config.types";
import {
  createRandomTowersTrapColumns,
  createTowersEmptyMatrix,
  createTowersStoryAnnouncement,
  getTowersStoryBombAnnouncementMessage,
  getTowersStoryGridConfigFromDifficulty,
  getTowersStoryMultiplierValue,
  getTowersStoryTopReachedAnnouncementMessage,
  playTowersStorySound,
  preloadTowersStorySounds,
  revealTowersRowValues,
  setTowersStorySoundsVolume,
  stopTowersStorySounds,
  TOWERS_STORY_AUTOBET_NEXT_ROUND_DELAY_MS,
  TOWERS_STORY_AUTOBET_REVEAL_DELAY_MS,
  TOWERS_STORY_CLEAR_BOARD_DELAY_MS,
  type TowersStoryGridConfig,
  type TowersStorySoundName,
} from "#ui/features/games/originals/towers/towers-story-helpers";
import {
  formatWalletAmount,
  formatWalletAmountLabel,
  getCryptoStakeFloorRate,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from "#ui/features/wallet/wallet-balances";
import { useWallet } from "#ui/features/wallet/wallet-provider";
import { shouldReduceMotion } from "#ui/lib/motion";
import { useGameSocket } from "#ui/features/games/shared/socket/game-socket";
import {
  sendTowersStartCommand,
  sendTowersRevealCommand,
  sendTowersCashoutCommand,
  sendTowersAutobetCommand,
} from "./towers-socket";

const AUTOBET_CONTINUE_DELAY_MS =
  TOWERS_STORY_CLEAR_BOARD_DELAY_MS + TOWERS_STORY_AUTOBET_NEXT_ROUND_DELAY_MS;

interface TowersSessionState {
  mode: OriginalsConfigMode;
  betAmount: string;
  rounds: string;
  theatreMode: boolean;
  volume: number;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  difficulty: number;
  selection: number[];
  matrix: (boolean | null)[][];
  trapColumns: number[][];
  clicked: number[];
  isRoundPlaying: boolean;
  isPendingBet: boolean;
  roundStake: string;
  resultAnnouncement?: { id: string; message: string };
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

function getStopConditions(state: TowersSessionState): OriginalStopConditions {
  return {
    isActiveOnWin: state.isActiveOnWin,
    isActiveOnLoss: state.isActiveOnLoss,
    onWin: state.onWinValue,
    onLoss: state.onLossValue,
    stopProfit: state.stopProfitValue,
    stopLoss: state.stopLossValue,
  };
}

export function useTowersSession() {
  const wallet = useWallet();
  const { socket, connected, status: socketStatus } = useGameSocket();
  const cancelSocketRef = useRef<(() => void) | null>(null);
  const [state, setState] = useState<TowersSessionState>(() => {
    const difficulty = 0;
    const config = getTowersStoryGridConfigFromDifficulty(difficulty);
    return {
      mode: "manual",
      betAmount: "0",
      rounds: "0",
      theatreMode: false,
      volume: 0.75,
      onWinValue: 50,
      onLossValue: 50,
      stopProfitValue: "",
      stopLossValue: "",
      isActiveOnWin: false,
      isActiveOnLoss: false,
      difficulty,
      selection: [],
      matrix: createTowersEmptyMatrix(config),
      trapColumns: [],
      clicked: [],
      isRoundPlaying: false,
      isPendingBet: false,
      roundStake: "0",
      showWinModal: false,
      winMultiplier: "x0.00",
      winAmount: "0.00",
      auto: { kind: "idle" },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
      initialBet: "0",
    };
  });

  const stateRef = useRef(state);
  const volumeRef = useRef(state.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const boardClearTimerRef = useRef<number | null>(null);
  const autobetTimersRef = useRef<number[]>([]);
  const autobetGenerationRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
    volumeRef.current = state.volume;
  });

  const playSound = (name: TowersStorySoundName) => {
    const audio = playTowersStorySound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  const patchState = (patch: Partial<TowersSessionState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      stateRef.current = next;
      return next;
    });
  };

  const clearBoardClearTimer = () => {
    if (boardClearTimerRef.current !== null) {
      window.clearTimeout(boardClearTimerRef.current);
      boardClearTimerRef.current = null;
    }
  };

  const clearAutobetTimers = () => {
    autobetTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    autobetTimersRef.current = [];
  };

  const queueAutobetTimer = (callback: () => void, delayMs: number) => {
    const timer = window.setTimeout(() => {
      autobetTimersRef.current = autobetTimersRef.current.filter(
        (entry) => entry !== timer,
      );
      callback();
    }, delayMs);
    autobetTimersRef.current.push(timer);
  };

  const scheduleBoardClear = () => {
    clearBoardClearTimer();
    const config = getTowersStoryGridConfigFromDifficulty(
      stateRef.current.difficulty,
    );
    boardClearTimerRef.current = window.setTimeout(() => {
      boardClearTimerRef.current = null;
      const current = stateRef.current;
      const keepSelection = current.mode === "auto" ? current.selection : [];
      const auto =
        current.auto.kind === "stopping"
          ? {
              kind:
                current.metrics.roundsCompleted > 0
                  ? ("paused" as const)
                  : ("idle" as const),
            }
          : current.auto;
      patchState({
        matrix: createTowersEmptyMatrix(config),
        trapColumns: [],
        clicked: [],
        selection: [...keepSelection],
        showWinModal: false,
        resultAnnouncement: undefined,
        auto,
      });
    }, TOWERS_STORY_CLEAR_BOARD_DELAY_MS);
  };

  useEffect(() => {
    preloadTowersStorySounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      cancelSocketRef.current?.();
      clearBoardClearTimer();
      clearAutobetTimers();
      stopTowersStorySounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setTowersStorySoundsVolume(activeSoundsRef.current, state.volume);
  }, [state.volume]);

  const applyAutobetEdit = (patch: Partial<TowersSessionState> = {}) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    const next = { ...current, ...edited, ...patch };
    stateRef.current = next;
    setState(next);
  };

  const formatWinAmount = (payoutAmount: string) =>
    formatWalletAmountLabel(
      formatWalletAmount(payoutAmount, wallet.currencyId, wallet.displayFiat),
    );

  const settleFinishedRound = ({
    betAmount,
    payoutAmount,
    multiplier,
    isWin,
    auto,
    matrix,
    clicked,
    announcement,
  }: {
    betAmount: string;
    payoutAmount: string;
    multiplier: number;
    isWin: boolean;
    auto: boolean;
    matrix: (boolean | null)[][];
    clicked: number[];
    announcement: string;
  }) => {
    const applied = wallet.applyRound({ betAmount, payoutAmount });
    const latest = stateRef.current;

    if (!applied) {
      patchState({
        matrix,
        clicked,
        isRoundPlaying: false,
        showWinModal: false,
        resultAnnouncement: createTowersStoryAnnouncement(announcement),
        auto: auto
          ? { kind: "failed", reason: "insufficient-balance" }
          : latest.auto,
      });
      scheduleBoardClear();
      return;
    }

    let metrics = latest.metrics;
    let nextBet = latest.betAmount;
    let autoStatus = latest.auto;

    if (auto) {
      const settled = settleAutobetRound(
        { metrics: latest.metrics, nextBet: latest.betAmount },
        { win: isWin, betAmount, payoutAmount },
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
        getCryptoStakeFloorRate(wallet.currencyId),
      );

      if (latest.auto.kind === "stopping") {
        autoStatus = { kind: "stopping" };
      } else if (!canContinue) {
        autoStatus = { kind: "idle" };
      }
    }

    patchState({
      matrix,
      clicked,
      isRoundPlaying: false,
      showWinModal: isWin,
      winMultiplier: `x${multiplier.toFixed(2)}`,
      winAmount: formatWinAmount(payoutAmount),
      resultAnnouncement: createTowersStoryAnnouncement(announcement),
      metrics,
      betAmount: nextBet,
      auto: autoStatus,
    });
    scheduleBoardClear();
  };

  const startManualRound = () => {
    const current = stateRef.current;
    if (
      current.isRoundPlaying ||
      current.isPendingBet ||
      current.mode !== "manual"
    ) {
      return false;
    }
    if (!new BigNumber(current.betAmount).gt(0)) return false;
    if (!wallet.canAfford(current.betAmount)) return false;

    clearBoardClearTimer();
    stopTowersStorySounds(activeSoundsRef.current);
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);

    if (socket && connected) {
      cancelSocketRef.current?.();
      patchState({ isPendingBet: true });

      cancelSocketRef.current = sendTowersStartCommand(
        socket,
        {
          amount: current.betAmount,
          currencyId: wallet.currencyId,
          difficulty: current.difficulty,
        },
        {
          onResult: (result) => {
            cancelSocketRef.current = null;
            patchState({
              matrix: createTowersEmptyMatrix(config),
              trapColumns: [],
              clicked: [],
              isRoundPlaying: true,
              isPendingBet: false,
              roundStake: result.betAmount,
              showWinModal: false,
              resultAnnouncement: createTowersStoryAnnouncement(
                "Round started. Climb the tower.",
              ),
            });
          },
          onError: (errorMessage) => {
            console.warn(
              "[Towers] Socket start error, fallback to local:",
              errorMessage,
            );
            cancelSocketRef.current = null;
            const trapColumns = createRandomTowersTrapColumns(config);
            patchState({
              matrix: createTowersEmptyMatrix(config),
              trapColumns,
              clicked: [],
              isRoundPlaying: true,
              isPendingBet: false,
              roundStake: current.betAmount,
              showWinModal: false,
              resultAnnouncement: createTowersStoryAnnouncement(
                "Round started. Climb the tower.",
              ),
            });
          },
        },
      );
      return true;
    }

    const trapColumns = createRandomTowersTrapColumns(config);
    patchState({
      matrix: createTowersEmptyMatrix(config),
      trapColumns,
      clicked: [],
      isRoundPlaying: true,
      isPendingBet: false,
      roundStake: current.betAmount,
      showWinModal: false,
      resultAnnouncement: createTowersStoryAnnouncement(
        "Round started. Climb the tower.",
      ),
    });
    return true;
  };

  const performLocalReveal = (
    rowIndex: number,
    columnIndex: number,
    auto: boolean,
  ) => {
    const current = stateRef.current;
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
    const trapColumns =
      current.trapColumns.length > 0
        ? current.trapColumns
        : createRandomTowersTrapColumns(config);

    const rowValues = revealTowersRowValues(
      trapColumns,
      rowIndex,
      config.cols,
    );
    const matrix = current.matrix.map((row, index) =>
      index === rowIndex ? rowValues : row,
    );
    const clicked = [...current.clicked, columnIndex];
    const hitTrap = rowValues[columnIndex] === true;
    const betAmount = current.roundStake || current.betAmount;

    if (hitTrap) {
      playSound("lose");
      const fullMatrix = matrix.map((row, rIndex) => {
        if (row.some((tile) => tile !== null)) return row;
        return revealTowersRowValues(trapColumns, rIndex, config.cols);
      });
      settleFinishedRound({
        betAmount,
        payoutAmount: "0",
        multiplier: 0,
        isWin: false,
        auto,
        matrix: fullMatrix,
        clicked,
        announcement: getTowersStoryBombAnnouncementMessage(rowIndex),
      });
      return;
    }

    playSound("win");
    const multiplier = getTowersStoryMultiplierValue(config, rowIndex);
    const reachedTop = rowIndex + 1 >= config.rows;

    if (reachedTop) {
      const payoutAmount = new BigNumber(betAmount).times(multiplier).toFixed();
      settleFinishedRound({
        betAmount,
        payoutAmount,
        multiplier,
        isWin: true,
        auto,
        matrix,
        clicked,
        announcement: getTowersStoryTopReachedAnnouncementMessage(),
      });
      return;
    }

    patchState({
      matrix,
      clicked,
      trapColumns,
      isPendingBet: false,
      resultAnnouncement: createTowersStoryAnnouncement(
        `Safe on row ${rowIndex + 1}.`,
      ),
    });
  };

  const revealAt = (rowIndex: number, columnIndex: number, auto: boolean) => {
    const current = stateRef.current;
    if (!current.isRoundPlaying || current.isPendingBet) return;
    if (rowIndex !== current.clicked.length) return;
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
    if (
      rowIndex < 0 ||
      rowIndex >= config.rows ||
      columnIndex < 0 ||
      columnIndex >= config.cols
    ) {
      return;
    }

    if (!auto && socket && connected) {
      cancelSocketRef.current?.();
      patchState({ isPendingBet: true });

      cancelSocketRef.current = sendTowersRevealCommand(
        socket,
        { rowIndex, columnIndex },
        {
          onStep: (result) => {
            cancelSocketRef.current = null;
            const latest = stateRef.current;
            const rowValues = Array.from({ length: config.cols }, (_, colIdx) =>
              result.rowTrapColumns.includes(colIdx),
            );
            const matrix = latest.matrix.map((row, index) =>
              index === rowIndex ? rowValues : row,
            );
            const clicked = [...latest.clicked, columnIndex];
            playSound("win");
            patchState({
              matrix,
              clicked,
              isPendingBet: false,
              resultAnnouncement: createTowersStoryAnnouncement(
                `Safe on row ${rowIndex + 1}.`,
              ),
            });
          },
          onEnd: (result) => {
            cancelSocketRef.current = null;
            const latest = stateRef.current;
            const clicked = [...latest.clicked, columnIndex];
            const betAmount = latest.roundStake || latest.betAmount;

            if (result.isTrap) {
              playSound("lose");
              const fullMatrix = latest.matrix.map((row, rIndex) =>
                revealTowersRowValues(result.trapColumns, rIndex, config.cols),
              );
              settleFinishedRound({
                betAmount,
                payoutAmount: "0",
                multiplier: 0,
                isWin: false,
                auto: false,
                matrix: fullMatrix,
                clicked,
                announcement: getTowersStoryBombAnnouncementMessage(rowIndex),
              });
            } else {
              playSound("win");
              const fullMatrix = latest.matrix.map((row, rIndex) => {
                if (rIndex <= rowIndex) {
                  return revealTowersRowValues(
                    result.trapColumns,
                    rIndex,
                    config.cols,
                  );
                }
                return row;
              });
              settleFinishedRound({
                betAmount,
                payoutAmount: result.payoutAmount,
                multiplier: result.payoutMultiplier,
                isWin: true,
                auto: false,
                matrix: fullMatrix,
                clicked,
                announcement: getTowersStoryTopReachedAnnouncementMessage(),
              });
            }
          },
          onError: (errorMessage) => {
            console.warn(
              "[Towers] Reveal error, fallback to local:",
              errorMessage,
            );
            cancelSocketRef.current = null;
            patchState({ isPendingBet: false });
            performLocalReveal(rowIndex, columnIndex, auto);
          },
        },
      );
      return;
    }

    performLocalReveal(rowIndex, columnIndex, auto);
  };

  const performLocalCashout = () => {
    const current = stateRef.current;
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
    const lastRow = current.clicked.length - 1;
    const multiplier = getTowersStoryMultiplierValue(config, lastRow);
    const betAmount = current.roundStake || current.betAmount;
    const payoutAmount = new BigNumber(betAmount).times(multiplier).toFixed();
    playSound("win");
    settleFinishedRound({
      betAmount,
      payoutAmount,
      multiplier,
      isWin: true,
      auto: false,
      matrix: current.matrix,
      clicked: current.clicked,
      announcement: "Cashed out.",
    });
  };

  const cashout = () => {
    const current = stateRef.current;
    if (
      !current.isRoundPlaying ||
      current.isPendingBet ||
      current.mode !== "manual"
    ) {
      return;
    }
    if (current.clicked.length === 0) return;
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);

    if (socket && connected) {
      cancelSocketRef.current?.();
      patchState({ isPendingBet: true });

      cancelSocketRef.current = sendTowersCashoutCommand(
        socket,
        {
          onResult: (result) => {
            cancelSocketRef.current = null;
            const latest = stateRef.current;
            playSound("win");
            const fullMatrix = latest.matrix.map((row, rIndex) => {
              if (row.some((tile) => tile !== null)) return row;
              return revealTowersRowValues(
                result.trapColumns,
                rIndex,
                config.cols,
              );
            });
            settleFinishedRound({
              betAmount: result.betAmount,
              payoutAmount: result.payoutAmount,
              multiplier: result.payoutMultiplier,
              isWin: true,
              auto: false,
              matrix: fullMatrix,
              clicked: latest.clicked,
              announcement: "Cashed out.",
            });
          },
          onError: (errorMessage) => {
            console.warn(
              "[Towers] Cashout error, fallback to local:",
              errorMessage,
            );
            cancelSocketRef.current = null;
            patchState({ isPendingBet: false });
            performLocalCashout();
          },
        },
      );
      return;
    }

    performLocalCashout();
  };

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== "manual" || current.isPendingBet) return;
    if (current.isRoundPlaying) {
      cashout();
      return;
    }
    startManualRound();
  };

  const clickCell = (rowIndex: number, columnIndex: number) => {
    const current = stateRef.current;
    if (current.mode === "auto" && !current.isRoundPlaying) {
      const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
      if (
        rowIndex < 0 ||
        rowIndex > current.selection.length ||
        rowIndex >= config.rows ||
        columnIndex < 0 ||
        columnIndex >= config.cols
      ) {
        return;
      }
      const selection = [...current.selection];
      selection[rowIndex] = columnIndex;
      // Trim path after edited row
      selection.splice(rowIndex + 1);
      applyAutobetEdit({ selection });
      return;
    }
    if (
      current.mode === "manual" &&
      current.isRoundPlaying &&
      !current.isPendingBet
    ) {
      revealAt(rowIndex, columnIndex, false);
    }
  };

  const randomPick = () => {
    const current = stateRef.current;
    if (
      !current.isRoundPlaying ||
      current.isPendingBet ||
      current.mode !== "manual"
    ) {
      return;
    }
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
    const columnIndex = Math.floor(Math.random() * config.cols);
    revealAt(current.clicked.length, columnIndex, false);
  };

  const runLocalAutoRound = (
    generation: number,
    config: TowersStoryGridConfig,
    selection: readonly number[],
    betAmount: string,
    reduceMotion: boolean,
  ) => {
    const trapColumns = createRandomTowersTrapColumns(config);
    patchState({ trapColumns });

    const step = (stepIndex: number) => {
      if (autobetGenerationRef.current !== generation) return;
      const latest = stateRef.current;
      if (latest.auto.kind !== "running" && latest.auto.kind !== "stopping") {
        patchState({ isRoundPlaying: false });
        return;
      }

      if (stepIndex >= selection.length) {
        // Path complete — cashout at last safe row
        const lastRow = latest.clicked.length - 1;
        if (lastRow < 0) {
          settleFinishedRound({
            betAmount,
            payoutAmount: "0",
            multiplier: 0,
            isWin: false,
            auto: true,
            matrix: latest.matrix,
            clicked: latest.clicked,
            announcement: "Autobet round lost.",
          });
          return;
        }
        const multiplier = getTowersStoryMultiplierValue(config, lastRow);
        const payoutAmount = new BigNumber(betAmount)
          .times(multiplier)
          .toFixed();
        playSound("win");
        settleFinishedRound({
          betAmount,
          payoutAmount,
          multiplier,
          isWin: true,
          auto: true,
          matrix: latest.matrix,
          clicked: latest.clicked,
          announcement: "Autobet round won.",
        });
        return;
      }

      const columnIndex = selection[stepIndex]!;
      const rowIndex = latest.clicked.length;
      revealAt(rowIndex, columnIndex, true);

      const after = stateRef.current;
      if (!after.isRoundPlaying) return; // settled (win/lose)

      queueAutobetTimer(
        () => step(stepIndex + 1),
        reduceMotion ? 0 : TOWERS_STORY_AUTOBET_REVEAL_DELAY_MS,
      );
    };

    queueAutobetTimer(
      () => step(0),
      reduceMotion ? 0 : TOWERS_STORY_AUTOBET_REVEAL_DELAY_MS,
    );
  };

  const runAutoRound = () => {
    const current = stateRef.current;
    const stopConditions = getStopConditions(current);

    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions },
        getCryptoStakeFloorRate(wallet.currencyId),
      )
    ) {
      patchState({ auto: { kind: "idle" } });
      return;
    }

    if (current.auto.kind === "stopping") {
      patchState({
        auto: {
          kind: current.metrics.roundsCompleted > 0 ? "paused" : "idle",
        },
      });
      return;
    }

    if (current.auto.kind !== "running") return;
    if (current.selection.length === 0) {
      patchState({ auto: { kind: "idle" } });
      return;
    }
    if (!wallet.canAfford(current.betAmount)) {
      patchState({ auto: { kind: "failed", reason: "insufficient-balance" } });
      return;
    }

    clearBoardClearTimer();
    clearAutobetTimers();
    const generation = ++autobetGenerationRef.current;
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
    const selection = [...current.selection];
    const betAmount = current.betAmount;
    const reduceMotion = shouldReduceMotion();

    patchState({
      matrix: createTowersEmptyMatrix(config),
      trapColumns: [],
      clicked: [],
      isRoundPlaying: true,
      roundStake: betAmount,
      showWinModal: false,
      resultAnnouncement: createTowersStoryAnnouncement(
        "Autobet round started.",
      ),
    });

    if (socket && connected) {
      cancelSocketRef.current?.();
      cancelSocketRef.current = sendTowersAutobetCommand(
        socket,
        {
          amount: betAmount,
          currencyId: wallet.currencyId,
          difficulty: current.difficulty,
          selection,
        },
        {
          onResult: (result) => {
            cancelSocketRef.current = null;
            if (autobetGenerationRef.current !== generation) return;
            const latest = stateRef.current;
            if (
              latest.auto.kind !== "running" &&
              latest.auto.kind !== "stopping"
            ) {
              patchState({ isRoundPlaying: false, isPendingBet: false });
              return;
            }

            const step = (stepIndex: number) => {
              if (autobetGenerationRef.current !== generation) return;
              const currentStepState = stateRef.current;
              if (
                currentStepState.auto.kind !== "running" &&
                currentStepState.auto.kind !== "stopping"
              ) {
                patchState({ isRoundPlaying: false });
                return;
              }

              if (result.win && stepIndex >= selection.length) {
                playSound("win");
                settleFinishedRound({
                  betAmount,
                  payoutAmount: result.payoutAmount,
                  multiplier: result.payoutMultiplier,
                  isWin: true,
                  auto: true,
                  matrix: currentStepState.matrix,
                  clicked: currentStepState.clicked,
                  announcement: "Autobet round won.",
                });
                return;
              }

              if (!result.win && stepIndex === result.hitRow) {
                const columnIndex = selection[stepIndex]!;
                const rowValues = revealTowersRowValues(
                  result.trapColumns,
                  stepIndex,
                  config.cols,
                );
                const matrix = currentStepState.matrix.map((row, index) =>
                  index === stepIndex ? rowValues : row,
                );
                const clicked = [...currentStepState.clicked, columnIndex];
                playSound("lose");
                const fullMatrix = matrix.map((row, rIndex) =>
                  revealTowersRowValues(
                    result.trapColumns,
                    rIndex,
                    config.cols,
                  ),
                );
                settleFinishedRound({
                  betAmount,
                  payoutAmount: "0",
                  multiplier: 0,
                  isWin: false,
                  auto: true,
                  matrix: fullMatrix,
                  clicked,
                  announcement:
                    getTowersStoryBombAnnouncementMessage(stepIndex),
                });
                return;
              }

              const columnIndex = selection[stepIndex]!;
              const rowValues = revealTowersRowValues(
                result.trapColumns,
                stepIndex,
                config.cols,
              );
              const matrix = currentStepState.matrix.map((row, index) =>
                index === stepIndex ? rowValues : row,
              );
              const clicked = [...currentStepState.clicked, columnIndex];
              playSound("win");
              patchState({
                matrix,
                clicked,
                resultAnnouncement: createTowersStoryAnnouncement(
                  `Safe on row ${stepIndex + 1}.`,
                ),
              });

              queueAutobetTimer(
                () => step(stepIndex + 1),
                reduceMotion ? 0 : TOWERS_STORY_AUTOBET_REVEAL_DELAY_MS,
              );
            };

            queueAutobetTimer(
              () => step(0),
              reduceMotion ? 0 : TOWERS_STORY_AUTOBET_REVEAL_DELAY_MS,
            );
          },
          onError: (errorMessage) => {
            console.warn(
              "[Towers:Autobet] Socket error, fallback to local:",
              errorMessage,
            );
            cancelSocketRef.current = null;
            runLocalAutoRound(
              generation,
              config,
              selection,
              betAmount,
              reduceMotion,
            );
          },
        },
      );
      return;
    }

    runLocalAutoRound(
      generation,
      config,
      selection,
      betAmount,
      reduceMotion,
    );
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      current.isRoundPlaying ||
      current.mode !== "auto" ||
      !new BigNumber(current.betAmount).gt(0) ||
      current.selection.length === 0 ||
      !wallet.canAfford(current.betAmount) ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }

    const next: TowersSessionState = {
      ...current,
      initialBet: current.betAmount,
      auto: { kind: "running" },
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
      (current.auto.kind !== "paused" && current.auto.kind !== "failed")
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
        getCryptoStakeFloorRate(wallet.currencyId),
      )
    ) {
      const idle = { ...current, auto: { kind: "idle" as const } };
      stateRef.current = idle;
      setState(idle);
      return;
    }
    const next = { ...current, auto: { kind: "running" as const } };
    stateRef.current = next;
    setState(next);
    queueMicrotask(() => runAutoRound());
  };

  const stopAutoBet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== "running") return;

    if (!current.isRoundPlaying && boardClearTimerRef.current === null) {
      const next = {
        ...current,
        auto: {
          kind:
            current.metrics.roundsCompleted > 0
              ? ("paused" as const)
              : ("idle" as const),
        },
      };
      stateRef.current = next;
      setState(next);
      return;
    }

    const next = { ...current, auto: { kind: "stopping" as const } };
    stateRef.current = next;
    setState(next);
  };

  const handleAutoAction = () => {
    const current = stateRef.current;
    if (isAutobetActive(current.auto)) {
      stopAutoBet();
      return;
    }
    if (current.auto.kind === "paused" || current.auto.kind === "failed") {
      continueAutobet();
      return;
    }
    startAutoBet();
  };

  const setMode = (mode: OriginalsConfigMode) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || current.mode === mode) return;
    if (isAutobetActive(current.auto)) stopAutoBet();
    clearAutobetTimers();
    clearBoardClearTimer();
    const config = getTowersStoryGridConfigFromDifficulty(current.difficulty);
    const next: TowersSessionState = {
      ...current,
      mode,
      auto: { kind: "idle" },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
      matrix: createTowersEmptyMatrix(config),
      trapColumns: [],
      clicked: [],
      selection: [],
      showWinModal: false,
      resultAnnouncement: undefined,
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

  const setDifficulty = (difficulty: number) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const config = getTowersStoryGridConfigFromDifficulty(difficulty);
    clearBoardClearTimer();
    clearAutobetTimers();
    applyAutobetEdit({
      difficulty,
      selection: [],
      matrix: createTowersEmptyMatrix(config),
      trapColumns: [],
      clicked: [],
      showWinModal: false,
      resultAnnouncement: undefined,
    });
  };

  const clearSelection = () => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    applyAutobetEdit({ selection: [] });
  };

  const continueAfterPresentation = useEffectEvent(runAutoRound);
  useEffect(() => {
    if (!isAutobetActive(state.auto) || state.isRoundPlaying) return undefined;
    if (state.auto.kind === "stopping") return undefined;
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
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", stopAutoBet);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", stopAutoBet);
    };
  }, []);

  useEffect(() => {
    if (
      isAutobetActive(stateRef.current.auto) ||
      stateRef.current.isRoundPlaying
    ) {
      return;
    }
    const next = "0";
    applyAutobetEdit({ betAmount: next, initialBet: next });
  }, [wallet.currencyId]);

  const commitCryptoBetAmount = (cryptoAmount: string) => {
    const amount = cryptoAmount || "0";
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

  return {
    ...state,
    wallet,
    socketStatus,
    fieldsDisabled:
      state.isRoundPlaying ||
      state.isPendingBet ||
      isAutobetActive(state.auto),
    canCashout:
      state.isRoundPlaying &&
      !state.isPendingBet &&
      state.clicked.length > 0,
    hasSelection: state.selection.length > 0,
    placeManualBet,
    handleAutoAction,
    setMode,
    setRounds,
    setDifficulty,
    clearSelection,
    clickCell,
    randomPick,
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
    commitCryptoBetAmount,
    scaleBetAmount,
  };
}

export type TowersSession = ReturnType<typeof useTowersSession>;