'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import { blackjackStoryLabels } from '#ui/features/games/originals/blackjack/blackjack-story-helpers';
import {
  playBlackjackSound,
  preloadBlackjackSounds,
  setBlackjackSoundsVolume,
  stopBlackjackSounds,
  type BlackjackSoundName,
} from '#ui/features/games/originals/blackjack/blackjack-sounds';
import {
  useBlackjackGame,
  type Card,
} from '#ui/features/games/originals/blackjack/blackjack-session-context';
import {
  formatWalletAmount,
  formatWalletAmountLabel,
  getDefaultCryptoBetAmount,
  getFiatStakeUsd,
  SINGLE_BET_THRESHOLD_USD,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from '#ui/features/wallet/wallet-balances';
import { useWallet } from '#ui/features/wallet/wallet-provider';

/**
 * App-side Blackjack session: theatre/volume/stake + demo-wallet settlement.
 * Core deal/hit/stand/split/insurance lives in BlackjackProvider (betstrike port).
 */
export function useBlackjackSession() {
  const game = useBlackjackGame();
  const wallet = useWallet();

  const [theatreMode, setTheatreMode] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const volumeRef = useRef(volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const prevInsuranceOfferedRef = useRef(false);
  const prevSplitDoneRef = useRef(false);
  const prevNaturalBlackjackRef = useRef(false);

  volumeRef.current = volume;

  const playSound = (name: BlackjackSoundName) => {
    const audio = playBlackjackSound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  useEffect(() => {
    preloadBlackjackSounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      stopBlackjackSounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setBlackjackSoundsVolume(activeSoundsRef.current, volume);
  }, [volume]);

  // Insurance offer appear SFX (rising edge).
  useEffect(() => {
    if (game.insuranceOffered && !prevInsuranceOfferedRef.current) {
      playSound('insurance');
    }
    prevInsuranceOfferedRef.current = game.insuranceOffered;
  }, [game.insuranceOffered]);

  // Split SFX (rising edge).
  useEffect(() => {
    if (game.isSplitDone && !prevSplitDoneRef.current) {
      playSound('split');
    }
    prevSplitDoneRef.current = game.isSplitDone;
  }, [game.isSplitDone]);

  // Natural blackjack win SFX (rising edge on handResults).
  useEffect(() => {
    const isNatural = game.handResults.includes('blackjack');
    if (isNatural && !prevNaturalBlackjackRef.current) {
      playSound('blackjack');
    }
    prevNaturalBlackjackRef.current = isNatural;
  }, [game.handResults]);
  /** Always stored in selected-currency crypto units. */
  const [betAmount, setBetAmountCrypto] = useState('0');
  const [winOverlay, setWinOverlay] = useState({
    open: false,
    profitLabel: '+0.00',
    formattedWinAmount: '0.00',
  });

  const settledHistoryLengthRef = useRef(0);
  const betAmountRef = useRef(betAmount);
  betAmountRef.current = betAmount;

  const commitCryptoBetAmount = (cryptoAmount: string) => {
    if (game.isGameRunning) return betAmountRef.current;
    const amount = cryptoAmount || '0';
    setBetAmountCrypto(amount);
    betAmountRef.current = amount;
    const asNumber = Number.parseFloat(amount);
    if (Number.isFinite(asNumber) && asNumber >= 0) {
      game.setBetAmount(asNumber);
    }
    return amount;
  };

  const scaleBetAmount = (factor: number) => {
    if (game.isGameRunning) return;
    const next = new BigNumber(betAmountRef.current).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const available = new BigNumber(wallet.balances[wallet.currencyId]);
    const capped = BigNumber.min(next, available);
    const digits = WALLET_CRYPTO_FRACTION_DIGITS[wallet.currencyId];
    commitCryptoBetAmount(capped.toFixed(digits));
  };

  // Reset stake when cashier currency changes (same as Mines/Keno peers).
  useEffect(() => {
    if (game.isGameRunning) return;
    commitCryptoBetAmount('0');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currency switch only
  }, [wallet.currencyId]);

  // Settle demo wallet once per finished hand from betHistory.
  useEffect(() => {
    if (!game.isGameOver) {
      if (!game.isGameRunning) {
        settledHistoryLengthRef.current = game.betHistory.length;
      }
      return;
    }

    if (game.betHistory.length <= settledHistoryLengthRef.current) return;

    const lastBet = game.betHistory[game.betHistory.length - 1];
    settledHistoryLengthRef.current = game.betHistory.length;
    if (!lastBet) return;

    const unitBet = new BigNumber(lastBet.betAmount);
    if (!unitBet.isFinite() || unitBet.lte(0)) return;

    const handsStake = lastBet.isSplit ? unitBet.times(2) : unitBet;
    const insuranceStake = lastBet.insuranceTaken ? unitBet.div(2) : new BigNumber(0);
    const totalStake = handsStake.plus(insuranceStake);
    const profit = new BigNumber(lastBet.winAmount);
    const payoutAmount = totalStake.plus(profit);

    wallet.applyRound({
      betAmount: totalStake.toFixed(),
      payoutAmount: payoutAmount.isFinite() ? payoutAmount.toFixed() : '0',
    });

    const isWin = lastBet.winAmount > 0;
    if (isWin) {
      const profitCrypto = profit.toFixed();
      const formatted = formatWalletAmountLabel(
        formatWalletAmount(profitCrypto, wallet.currencyId, wallet.displayFiat),
      );
      setWinOverlay({
        open: true,
        profitLabel: `+${formatted}`,
        formattedWinAmount: formatted,
      });
    } else {
      setWinOverlay({
        open: false,
        profitLabel: '+0.00',
        formattedWinAmount: '0.00',
      });
    }
  }, [
    game.isGameOver,
    game.isGameRunning,
    game.betHistory,
    wallet,
  ]);

  // Clear win modal when a new deal starts.
  useEffect(() => {
    if (game.isGameRunning && !game.isGameOver) {
      setWinOverlay((current) =>
        current.open
          ? { open: false, profitLabel: '+0.00', formattedWinAmount: '0.00' }
          : current,
      );
    }
  }, [game.isGameRunning, game.isGameOver]);

  const hasStake = new BigNumber(betAmount).gt(0);
  const exceedsWallet = hasStake && !wallet.canAfford(betAmount);
  const showThresholdWarning = getFiatStakeUsd(betAmount, wallet.currencyId).gt(
    SINGLE_BET_THRESHOLD_USD,
  );

  const stakeNumber = Number.parseFloat(betAmount);
  const canStart =
    !game.isGameRunning &&
    hasStake &&
    !exceedsWallet &&
    Number.isFinite(stakeNumber) &&
    stakeNumber > 0;

  const beginDeal = (deal: () => void) => {
    if (!canStart) return;
    const asNumber = Number.parseFloat(betAmountRef.current);
    if (!Number.isFinite(asNumber) || asNumber <= 0) return;
    if (!wallet.canAfford(betAmountRef.current)) return;
    game.setBetAmount(asNumber);
    settledHistoryLengthRef.current = game.betHistory.length;
    deal();
  };

  const placeBet = () => {
    beginDeal(() => game.startGame());
  };

  /**
   * Demo / QA helper: forced player + dealer cards via BlackjackProvider.customStartGame.
   * Mirrors Storybook Composition (default stake, no silent canStart no-op): only blocks
   * while a hand is running; seeds an affordable default when bet is 0 / unaffordable.
   */
  const startScenario = (playerCards: Card[], dealerCards: Card[]) => {
    if (game.isGameRunning) return;

    let crypto = betAmountRef.current;
    const stakeBn = new BigNumber(crypto);
    if (!stakeBn.isFinite() || !stakeBn.gt(0) || !wallet.canAfford(crypto)) {
      const digits = WALLET_CRYPTO_FRACTION_DIGITS[wallet.currencyId];
      const available = new BigNumber(wallet.balances[wallet.currencyId]);
      const fallback = new BigNumber(getDefaultCryptoBetAmount(wallet.currencyId));
      const next = BigNumber.min(fallback, available);
      if (!next.isFinite() || !next.gt(0)) return;
      crypto = commitCryptoBetAmount(next.toFixed(digits));
    }

    const asNumber = Number.parseFloat(crypto);
    if (!Number.isFinite(asNumber) || asNumber <= 0) return;
    if (!wallet.canAfford(crypto)) return;

    game.setBetAmount(asNumber);
    settledHistoryLengthRef.current = game.betHistory.length;
    game.customStartGame(playerCards, dealerCards);
  };

  const actionsLocked =
    !game.isGameRunning ||
    !game.isFirstRoundEnded ||
    game.insuranceOffered ||
    game.isGameOver;

  const actions = useMemo(
    () => [
      {
        id: 'hit',
        label: blackjackStoryLabels.hit,
        disabled: actionsLocked || game.isBtnActivated,
        onClick: game.hit,
      },
      {
        id: 'stand',
        label: blackjackStoryLabels.stand,
        disabled: actionsLocked || game.isBtnActivated,
        onClick: game.stand,
      },
      {
        id: 'double',
        label: blackjackStoryLabels.double,
        disabled: actionsLocked || game.isBtnActivated || game.isSplitDone,
        onClick: game.doubleDown,
      },
      {
        id: 'split',
        label: blackjackStoryLabels.split,
        disabled: actionsLocked || game.isBtnActivated || !game.canSplit,
        onClick: game.split,
      },
    ],
    [
      actionsLocked,
      game.isBtnActivated,
      game.isSplitDone,
      game.canSplit,
      game.hit,
      game.stand,
      game.doubleDown,
      game.split,
    ],
  );

  return {
    game,
    wallet,
    theatreMode,
    volume,
    betAmount,
    winOverlay,
    hasStake,
    exceedsWallet,
    showThresholdWarning,
    canStart,
    actions,
    fieldsDisabled: game.isGameRunning,
    placeBet,
    startScenario,
    setTheatreMode,
    setVolume,
    commitCryptoBetAmount,
    scaleBetAmount,
    setInsuranceAccepted: game.setInsuranceAccepted,
  };
}

export type BlackjackSession = ReturnType<typeof useBlackjackSession>;