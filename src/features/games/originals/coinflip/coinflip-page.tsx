"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import BigNumber from "bignumber.js";

import type { CoinflipSide } from "#ui/features/games/originals/coinflip/coinflip.types";
import { CoinflipBoard } from "#ui/features/games/originals/coinflip/coinflip-board/coinflip-board";
import type { CoinflipBoardProps } from "#ui/features/games/originals/coinflip/coinflip-board/coinflip-board.types";
import {
  COINFLIP_DEFAULT_VIDEO_SRC,
  type CoinflipAnimationVideo,
  type CoinflipCoinColor,
  getCoinflipEndColorFromSide,
  getCoinflipIdleVideoSrc,
  getCoinflipVideoSrc,
} from "#ui/features/games/originals/coinflip/coinflip-coin/coinflip-coin.utils";
import { CoinflipConfig } from "#ui/features/games/originals/coinflip/coinflip-config/coinflip-config";
import type { CoinflipConfigProps } from "#ui/features/games/originals/coinflip/coinflip-config/coinflip-config.types";
import type { CoinflipLastResultItem } from "#ui/features/games/originals/coinflip/coinflip-last-results/coinflip-last-results.types";
import {
  coinflipStoryBetAmountTooltip,
  coinflipStoryLastResultsAriaLabel,
  coinflipStoryLastResultsAssets,
  coinflipStoryLastResultsLabels,
  coinflipStorySelectSideOptions,
  coinflipStoryStopConditionsLabels,
  createCoinflipStoryLastResult,
  getCoinflipStoryEndColor,
  getCoinflipStoryStartColor,
} from "#ui/features/games/originals/coinflip/coinflip-story-helpers";
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
import { resolveOriginalsAutobetAction } from "#ui/features/games/originals/originals-config/originals-config-autobet.utils";
import type { OriginalsConfigMode } from "#ui/features/games/originals/originals-config/originals-config.types";
import { OriginalsGameShell } from "#ui/features/games/originals/originals-game-shell/originals-game-shell";
import type { AutobetSessionState } from "#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types";
import { GameWinModal } from "#ui/features/games/originals/shared/game-win-modal/game-win-modal";
import { GameHeader } from "#ui/features/games/shared/game-player/game-header/game-header";
import {
  formatSignedAmountLabel,
  formatWalletAmount,
  formatWalletAmountLabel,
  formatWinRate,
  getCryptoStakeFloorRate,
  getFiatStakeUsd,
  SINGLE_BET_THRESHOLD_USD,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from "#ui/features/wallet/wallet-balances";
import { useBetAmountDisplay } from "#ui/features/wallet/use-bet-amount-display";
import { useWallet } from "#ui/features/wallet/wallet-provider";
import { TheatreModeSync, useAppLayoutState } from "#ui/layouts/app-header/app-layout-provider";
import { cn } from "#ui/lib/cn";
import { Image } from "#ui/primitives/data-display/image/image";

const COINFLIP_PAYOUT_MULTIPLIER = 2;
const AUTOBET_CONTINUE_DELAY_MS = 300;
/** Payload `coinflip-win-overlay`: manual 2s, auto 2s. */
const WIN_MODAL_MANUAL_HIDE_MS = 2000;
const WIN_MODAL_AUTO_HIDE_MS = 2000;

interface PendingFlip {
  pickedSide: CoinflipSide;
  landedSide: CoinflipSide;
  startColor: CoinflipCoinColor;
  betAmount: string;
  auto: boolean;
}

interface CoinflipPageState {
  mode: OriginalsConfigMode;
  /** Always stored in selected-currency crypto units. */
  betAmount: string;
  side: CoinflipSide;
  turboMode: boolean;
  rounds: string;
  theatreMode: boolean;
  volume: number;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  videoSrc: CoinflipAnimationVideo;
  isVideoPlaying: boolean;
  lastResults: CoinflipLastResultItem[];
  resultAnnouncement?: CoinflipBoardProps["resultAnnouncement"];
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

function mapAutobetSessionState(
  auto: OriginalAutobetStatus,
  metrics: OriginalAutobetMetrics,
): AutobetSessionState {
  if (isAutobetActive(auto)) return "live";
  if (auto.kind === "failed" && auto.reason === "insufficient-balance") {
    return "insufficient-balance";
  }
  if (auto.kind === "failed") return "interrupted";
  if (auto.kind === "paused") return "paused";
  if (metrics.roundsCompleted > 0) return "complete";
  return "ready-to-start";
}

function getStopConditions(state: CoinflipPageState): OriginalStopConditions {
  return {
    isActiveOnWin: state.isActiveOnWin,
    isActiveOnLoss: state.isActiveOnLoss,
    onWin: state.onWinValue,
    onLoss: state.onLossValue,
    stopProfit: state.stopProfitValue,
    stopLoss: state.stopLossValue,
  };
}

function CurrencyIcon({ src, size }: { src: string; size: 20 | 32 }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      wrapperClassName={cn(
        "shrink-0 rounded-ds-full",
        size === 20 ? "size-5" : "size-8",
      )}
      className={cn(size === 20 ? "size-5" : "size-8", "object-contain")}
      showSkeleton={false}
    />
  );
}

export function CoinflipPage() {
  const wallet = useWallet();
  const { theatreLayoutActive, theatreModeActive } = useAppLayoutState();
  const [state, setState] = useState<CoinflipPageState>(() => ({
    mode: "manual",
    betAmount: "0",
    side: "HEADS",
    turboMode: false,
    rounds: "0",
    theatreMode: false,
    volume: 0.75,
    onWinValue: 50,
    onLossValue: 50,
    stopProfitValue: "",
    stopLossValue: "",
    isActiveOnWin: false,
    isActiveOnLoss: false,
    videoSrc: COINFLIP_DEFAULT_VIDEO_SRC,
    isVideoPlaying: false,
    lastResults: [],
    showWinModal: false,
    winMultiplier: "x2.00",
    winAmount: "0.00",
    auto: { kind: "idle" },
    metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    initialBet: "0",
  }));

  const pendingFlipRef = useRef<PendingFlip | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const patchState = (patch: Partial<CoinflipPageState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      stateRef.current = next;
      return next;
    });
  };

  const applyAutobetEdit = (patch: Partial<CoinflipPageState> = {}) => {
    const current = stateRef.current;
    if (current.isVideoPlaying || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    const next = { ...current, ...edited, ...patch };
    stateRef.current = next;
    setState(next);
  };

  const startFlip = (betAmount: string, auto: boolean) => {
    const current = stateRef.current;
    if (current.isVideoPlaying) return false;
    if (!wallet.canAfford(betAmount)) return false;

    const landedSide: CoinflipSide = Math.random() < 0.5 ? "HEADS" : "TAILS";
    const startColor = getCoinflipStoryEndColor(current.videoSrc);
    pendingFlipRef.current = {
      pickedSide: current.side,
      landedSide,
      startColor,
      betAmount,
      auto,
    };
    patchState({
      videoSrc: getCoinflipVideoSrc({
        startColor,
        endColor: getCoinflipEndColorFromSide(landedSide),
      }),
      isVideoPlaying: true,
      resultAnnouncement: undefined,
      showWinModal: false,
    });
    return true;
  };

  const runAutoRound = useEffectEvent(() => {
    const current = stateRef.current;
    const stopConditions = getStopConditions(current);

    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions },
        "1",
      )
    ) {
      patchState({ auto: { kind: "idle" } });
      return;
    }

    if (current.auto.kind === "stopping") {
      patchState({
        auto: { kind: current.metrics.roundsCompleted > 0 ? "paused" : "idle" },
      });
      return;
    }

    if (current.auto.kind !== "running") return;

    if (!wallet.canAfford(current.betAmount)) {
      patchState({
        auto: { kind: "failed", reason: "insufficient-balance" },
      });
      return;
    }

    startFlip(current.betAmount, true);
  });

  const handleVideoEnd = () => {
    const pendingFlip = pendingFlipRef.current;
    pendingFlipRef.current = null;
    const current = stateRef.current;

    if (!pendingFlip) {
      patchState({ isVideoPlaying: false });
      return;
    }

    const { pickedSide, landedSide, betAmount, auto } = pendingFlip;
    const isWin = landedSide === pickedSide;
    const bet = new BigNumber(betAmount);
    const payoutAmount = isWin
      ? bet.times(COINFLIP_PAYOUT_MULTIPLIER).toFixed()
      : "0";

    const applied = wallet.applyRound({ betAmount, payoutAmount });
    if (!applied) {
      patchState({
        isVideoPlaying: false,
        videoSrc: getCoinflipIdleVideoSrc(
          getCoinflipEndColorFromSide(landedSide),
        ),
        auto: auto
          ? { kind: "failed", reason: "insufficient-balance" }
          : current.auto,
      });
      return;
    }

    const result = createCoinflipStoryLastResult(landedSide);
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
        "1",
      );

      if (current.auto.kind === "stopping") {
        autoStatus = { kind: metrics.roundsCompleted > 0 ? "paused" : "idle" };
      } else if (!canContinue) {
        autoStatus = { kind: "idle" };
      }
    }

    patchState({
      videoSrc: getCoinflipIdleVideoSrc(
        getCoinflipEndColorFromSide(landedSide),
      ),
      isVideoPlaying: false,
      lastResults: [result, ...current.lastResults].slice(0, 40),
      resultAnnouncement: isWin
        ? undefined
        : {
            id: result.id,
            message: landedSide === "HEADS" ? "Heads." : "Tails.",
          },
      showWinModal: isWin,
      winMultiplier: `x${COINFLIP_PAYOUT_MULTIPLIER.toFixed(2)}`,
      winAmount: winLabel,
      metrics,
      betAmount: nextBet,
      auto: autoStatus,
    });
  };

  const handlePlaybackError = () => {
    const startColor =
      pendingFlipRef.current?.startColor ??
      getCoinflipStoryStartColor(state.videoSrc);
    const wasAuto = pendingFlipRef.current?.auto ?? false;
    pendingFlipRef.current = null;
    patchState({
      videoSrc: getCoinflipIdleVideoSrc(startColor),
      isVideoPlaying: false,
      auto: wasAuto
        ? { kind: "failed", reason: "generic" }
        : stateRef.current.auto,
    });
  };

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== "manual" || current.isVideoPlaying) return;
    if (!wallet.canAfford(current.betAmount)) return;
    startFlip(current.betAmount, false);
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      current.isVideoPlaying ||
      current.mode !== "auto" ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }

    const next: CoinflipPageState = {
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
      current.isVideoPlaying ||
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
        "1",
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
    if (!isAutobetActive(current.auto)) return;
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

  const continueAfterPresentation = useEffectEvent(runAutoRound);
  useEffect(() => {
    if (!isAutobetActive(state.auto) || state.isVideoPlaying) return undefined;
    const timer = window.setTimeout(
      continueAfterPresentation,
      AUTOBET_CONTINUE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [state.auto, state.isVideoPlaying, state.metrics.roundsCompleted]);

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
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", stopAutoBet);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", stopAutoBet);
    };
  }, []);

  // Reset stake when switching wallet currency (not when toggling fiat display).
  useEffect(() => {
    if (
      isAutobetActive(stateRef.current.auto) ||
      stateRef.current.isVideoPlaying
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
    if (current.isVideoPlaying || isAutobetActive(current.auto)) return;
    const next = new BigNumber(current.betAmount).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const available = new BigNumber(wallet.balances[wallet.currencyId]);
    const capped = BigNumber.min(next, available);
    const digits = WALLET_CRYPTO_FRACTION_DIGITS[wallet.currencyId];
    commitCryptoBetAmount(capped.toFixed(digits));
  };

  const amountDisplay = useBetAmountDisplay({
    cryptoValue: state.betAmount,
    currencyId: wallet.currencyId,
    displayFiat: wallet.displayFiat,
    commitCryptoValue: commitCryptoBetAmount,
  });

  const exceedsWallet =
    new BigNumber(state.betAmount).gt(0) && !wallet.canAfford(state.betAmount);
  const showThresholdWarning = getFiatStakeUsd(
    state.betAmount,
    wallet.currencyId,
  ).gt(SINGLE_BET_THRESHOLD_USD);

  const maxRounds = getConfiguredMaxRounds(state.rounds);
  const remainingRounds = Math.max(
    0,
    maxRounds - state.metrics.roundsCompleted,
  );
  const showRemainingRounds =
    (isAutobetActive(state.auto) ||
      state.auto.kind === "paused" ||
      state.auto.kind === "failed") &&
    !(isAutobetActive(state.auto) && remainingRounds === 0);
  const displayedRoundsValue = showRemainingRounds
    ? remainingRounds === Number.POSITIVE_INFINITY
      ? "Infinity"
      : String(remainingRounds)
    : state.rounds;

  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: state.auto.kind === "running",
    isGracefulStopPending: state.auto.kind === "stopping",
    isInsufficientBalance:
      state.auto.kind === "failed" &&
      state.auto.reason === "insufficient-balance",
    isInterrupted:
      state.auto.kind === "failed" &&
      state.auto.reason !== "insufficient-balance",
    isPaused: state.auto.kind === "paused",
    rounds: state.rounds,
    roundsCompleted: state.metrics.roundsCompleted,
  });

  const fieldsDisabled = state.isVideoPlaying || isAutobetActive(state.auto);
  const sessionState = mapAutobetSessionState(state.auto, state.metrics);

  const config = {
    shell: {
      mode: state.mode,
      onModeChange: (mode) => {
        const current = stateRef.current;
        if (current.isVideoPlaying || current.mode === mode) return;
        if (isAutobetActive(current.auto)) stopAutoBet();
        const next = {
          ...current,
          mode,
          auto: { kind: "idle" as const },
          metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
        };
        stateRef.current = next;
        setState(next);
      },
      tabsDisabled: fieldsDisabled,
      autobetSession: {
        state: sessionState,
        totalWagered: formatWalletAmountLabel(
          formatWalletAmount(
            state.metrics.totalWagered,
            wallet.currencyId,
            true,
          ),
        ),
        netProfit: formatSignedAmountLabel(
          state.metrics.netProfit,
          wallet.currencyId,
          true,
        ),
        winRate: formatWinRate(state.metrics.wins, state.metrics.losses),
      },
      manualActionLabel: "Place Bet",
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: exceedsWallet,
      manualActionPending: state.isVideoPlaying,
      autoActionDisabled:
        (state.isVideoPlaying && autobetAction.variant !== "stop") ||
        (autobetAction.variant === "start" && exceedsWallet),
      theatreMode: theatreLayoutActive,
      onManualAction: placeManualBet,
      onAutoAction: handleAutoAction,
    },
    betAmount: {
      value: amountDisplay.displayValue,
      onChange: amountDisplay.onDisplayChange,
      conversionText: amountDisplay.conversionText,
      tooltip: coinflipStoryBetAmountTooltip,
      currencyIcon: <CurrencyIcon src={wallet.currentBalance.icon} size={20} />,
      precision: amountDisplay.precision,
      error:
        exceedsWallet && !isAutobetActive(state.auto)
          ? "Amount exceeds balance"
          : undefined,
      thresholdWarning: showThresholdWarning
        ? {
            title: "High payout warning",
            description: "This bet exceeds the recommended payout threshold.",
          }
        : null,
      quickActions: [
        { label: "½", onClick: () => scaleBetAmount(0.5) },
        { label: "2x", onClick: () => scaleBetAmount(2) },
      ],
    },
    rounds: {
      value: displayedRoundsValue,
      onChange: (rounds) => {
        const current = stateRef.current;
        if (current.isVideoPlaying || isAutobetActive(current.auto)) return;
        const edited = prepareAutobetEdit(current);
        if (
          rounds === edited.rounds &&
          edited.auto.kind === current.auto.kind
        ) {
          return;
        }
        const next = { ...current, ...edited, rounds };
        stateRef.current = next;
        setState(next);
      },
    },
    fieldsDisabled,
    selectSide: {
      value: state.side,
      onChange: (side) => applyAutobetEdit({ side }),
      options: coinflipStorySelectSideOptions,
      labels: { title: "Select Side" },
    },
    turboMode: {
      checked: state.turboMode,
      onCheckedChange: (turboMode) => applyAutobetEdit({ turboMode }),
    },
    stopConditions: {
      labels: coinflipStoryStopConditionsLabels,
      onWinValue: state.onWinValue,
      onLossValue: state.onLossValue,
      stopProfitValue: state.stopProfitValue,
      stopLossValue: state.stopLossValue,
      isActiveOnWin: state.isActiveOnWin,
      isActiveOnLoss: state.isActiveOnLoss,
      onWinChange: (onWinValue) => applyAutobetEdit({ onWinValue }),
      onLossChange: (onLossValue) => applyAutobetEdit({ onLossValue }),
      onStopProfitChange: (stopProfitValue) =>
        applyAutobetEdit({ stopProfitValue }),
      onStopLossChange: (stopLossValue) => applyAutobetEdit({ stopLossValue }),
      onWinToggle: (isActiveOnWin) => applyAutobetEdit({ isActiveOnWin }),
      onLossToggle: (isActiveOnLoss) => applyAutobetEdit({ isActiveOnLoss }),
    },
  } satisfies CoinflipConfigProps;

  const board = {
    videoSrc: state.videoSrc,
    isVideoPlaying: state.isVideoPlaying,
    onVideoEnd: handleVideoEnd,
    onPlaybackError: handlePlaybackError,
    theatreMode: state.theatreMode,
    turboMode: state.turboMode,
    volume: state.volume,
    lastResults: state.lastResults,
    lastResultsAssets: coinflipStoryLastResultsAssets,
    lastResultsLabels: coinflipStoryLastResultsLabels,
    lastResultsAriaLabel: coinflipStoryLastResultsAriaLabel,
    resultAnnouncement: state.resultAnnouncement,
    overlay: (
      <GameWinModal
        open={state.showWinModal}
        title="You win!"
        multiplierLabel="Multiplier"
        multiplier={state.winMultiplier}
        formattedWinAmount={state.winAmount}
        currencyIcon={
          <CurrencyIcon src={wallet.currentBalance.icon} size={32} />
        }
      />
    ),
  } satisfies CoinflipBoardProps;

  return (
    <div
      className={cn(
        "bg-ds-black p-ds-4 md:p-ds-8 w-full",
        theatreLayoutActive ? "h-full min-h-0 overflow-hidden" : "min-h-0 flex-1",
      )}
    >
      <TheatreModeSync
        theatreMode={state.theatreMode}
        onExitTheatre={() => patchState({ theatreMode: false })}
      />
      <div
        className={cn(
          "mx-auto flex w-full min-w-0 flex-col transition-[max-width] duration-ds-slow ease-ds-standard",
          theatreLayoutActive && "h-full min-h-0",
          theatreModeActive ? "max-w-[1750px]" : "max-w-[1400px]",
        )}
      >
        <OriginalsGameShell
          header={
            <GameHeader
              title="Coinflip"
              onBackClick={() => undefined}
              showVolumeControl
              volume={state.volume}
              onVolumeChange={(volume) => patchState({ volume })}
              isTheatreMode={state.theatreMode}
              onTheatreToggle={() =>
                patchState({ theatreMode: !state.theatreMode })
              }
            />
          }
          config={
            <CoinflipConfig
              shell={config.shell}
              betAmount={config.betAmount}
              rounds={config.rounds}
              stopConditions={config.stopConditions}
              fieldsDisabled={config.fieldsDisabled}
              selectSide={config.selectSide}
              turboMode={config.turboMode}
            />
          }
          board={
            <CoinflipBoard
              videoSrc={board.videoSrc}
              isVideoPlaying={board.isVideoPlaying}
              onVideoEnd={board.onVideoEnd}
              onPlaybackError={board.onPlaybackError}
              theatreMode={theatreLayoutActive}
              turboMode={board.turboMode}
              volume={board.volume}
              lastResults={board.lastResults}
              lastResultsAssets={board.lastResultsAssets}
              lastResultsLabels={board.lastResultsLabels}
              lastResultsAriaLabel={board.lastResultsAriaLabel}
              resultAnnouncement={board.resultAnnouncement}
              overlay={board.overlay}
            />
          }
          theatreMode={theatreLayoutActive}
        />
      </div>
    </div>
  );
}
