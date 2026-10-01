'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import { blackjackStoryLabels } from '#ui/features/games/originals/blackjack/blackjack-story-helpers';
import { useBlackjackGame } from '#ui/features/games/originals/blackjack/blackjack-session-context';
import {
  formatWalletAmount,
  formatWalletAmountLabel,
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

  const placeBet = () => {
    if (!canStart) return;
    const asNumber = Number.parseFloat(betAmountRef.current);
    if (!Number.isFinite(asNumber) || asNumber <= 0) return;
    if (!wallet.canAfford(betAmountRef.current)) return;
    game.setBetAmount(asNumber);
    settledHistoryLengthRef.current = game.betHistory.length;
    game.startGame();
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
    setTheatreMode,
    setVolume,
    commitCryptoBetAmount,
    scaleBetAmount,
    setInsuranceAccepted: game.setInsuranceAccepted,
  };
}

export type BlackjackSession = ReturnType<typeof useBlackjackSession>;