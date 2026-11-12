'use client';

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps --
 * Faithful port of betstrike blackjack-context (125c36de). Effect-driven flip
 * arrays, bust checks, insurance, and dealer score mirror production timing;
 * do not "fix" into derived state without re-validating deal/hit/split flow.
 */

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { calculateScore, generateDeck } from './blackjack-helpers';
import {
  sendBlackjackActionCommand,
  sendBlackjackInsuranceCommand,
  sendBlackjackStartCommand,
  type BlackjackActionResult,
  type BlackjackSocketSettlement,
  type BlackjackStartResult,
} from './blackjack-socket';
import { useGameSocket } from '#ui/features/games/shared/socket/game-socket';

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'Jack'
  | 'Queen'
  | 'King'
  | 'Ace';

type HandResult = 'stand' | 'pending' | 'busted' | 'win' | 'lose' | 'push' | 'blackjack';

export interface Card {
  suit: Suit;
  rank: Rank;
  isGoldCard?: boolean;
  isGoldJoker?: boolean;
  hidden?: boolean;
}

interface BetHistoryItem {
  /** Round this entry belongs to (one entry per round; settle once per roundId). */
  roundId: number;
  betAmount: number;
  isSplit: boolean;
  handResults: HandResult[];
  insuranceTaken: boolean;
  insuranceResult?: 'win' | 'lose';
  blackjack: boolean;
  /** Net round profit (all hands + insurance); can be <= 0 on a split with a winning hand. */
  winAmount: number;
  /** Profit won by winning hands only (win = 1x, blackjack = 1.5x per hand). */
  handsWinAmount: number;
  /** At least one player hand won (betstrike win-modal rule: some win | blackjack). */
  isPlayerWin: boolean;
  serverSettlement?: BlackjackSocketSettlement;
}

interface BlackjackGameContextProps {
  playerHands: Card[][];
  activeHandIndex: number;
  flippedPlayerCards: boolean[];
  setFlippedPlayerCards: Dispatch<SetStateAction<boolean[]>>;
  localFlippedFirstHand: boolean[];
  setLocalFlippedFirstHand: Dispatch<SetStateAction<boolean[]>>;
  localFlippedSecondHand: boolean[];
  setLocalFlippedSecondHand: Dispatch<SetStateAction<boolean[]>>;
  playerScore: number;
  playerHandsScores: number[];
  handResults: HandResult[];

  dealerHand: Card[];
  flippedDealerCards: boolean[];
  setFlippedDealerCards: Dispatch<SetStateAction<boolean[]>>;
  revealDealerSecondCard: boolean;

  dealerScore: number;
  updateDealerScore: (cards: Card[]) => void;
  isFirstRoundEnded: boolean;

  isGameOver: boolean;

  startGame: (options?: { amount?: string; currencyId?: string }) => void;
  /** Storybook / demo helper: deal fixed player + dealer cards (legacy customStartGame). */
  customStartGame: (playerCards: Card[], dealerCards: Card[]) => void;
  hit: () => void;
  stand: () => void;
  doubleDown: () => void;
  split: () => void;
  checkInitialBlackjack: () => void;

  insuranceOffered: boolean;
  setInsuranceAccepted: Dispatch<SetStateAction<boolean | null>>;

  canSplit: boolean;
  isSplitDone: boolean;

  setBetAmount: Dispatch<SetStateAction<number>>;
  betHistory: BetHistoryItem[];

  isWin: boolean;
  isPush: boolean;
  isLose: boolean;

  isBtnActivated: boolean;
  isPendingAction: boolean;
  isGameRunning: boolean;
}

const BlackjackGameContext = createContext<BlackjackGameContextProps | undefined>(
  undefined,
);

export const BlackjackProvider = ({ children }: { children: ReactNode }) => {
  const [deck, setDeck] = useState<Card[]>([]);

  const [playerHands, setPlayerHands] = useState<Card[][]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState(0); // set active - first or second hand
  const [handResults, setHandResults] = useState<HandResult[]>([]);
  const [playerScore, setPlayerScore] = useState(0); // result for game with 1 hand
  const [playerHandsScores, setPlayerHandsScores] = useState<number[]>([]); // result for game with 2 hands(split)
  const [flippedPlayerCards, setFlippedPlayerCards] = useState<boolean[]>([]);
  const [localFlippedFirstHand, setLocalFlippedFirstHand] = useState<boolean[]>([]);
  const [localFlippedSecondHand, setLocalFlippedSecondHand] = useState<boolean[]>([]);

  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [dealerScore, setDealerScore] = useState(0);
  const [flippedDealerCards, setFlippedDealerCards] = useState<boolean[]>([]);
  const [revealDealerSecondCard, setRevealDealerSecondCard] = useState(false);

  const [insuranceOffered, setInsuranceOffered] = useState(false);
  const [insuranceAccepted, setInsuranceAccepted] = useState<boolean | null>(null);
  const [isWinInsurance, setIsWinInsurance] = useState(false);
  const [isLoseInsurance, setIsLoseInsurance] = useState(false);

  const [canSplit, setCanSplit] = useState(false);
  const [isSplitDone, setIsSplitDone] = useState(false);

  const [betAmount, setBetAmount] = useState(0);
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);

  const [isWin, setIsWin] = useState(false);
  const [isPush, setIsPush] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const [isFirstRoundEnded, setIsFirstRoundEnded] = useState(false);
  const [isBtnActivated, setIsBtnActivated] = useState(false);
  const [isPendingAction, setIsPendingAction] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const { socket, connected } = useGameSocket();

  /**
   * One dealer play-out per round. On split, stand() on the last hand and the split
   * bust/hand-switch effect both reach revealDealerAndFinishGame before isGameOver
   * flips, which ran the dealer twice and appended a duplicate betHistory entry.
   */
  const dealerPlayStartedRef = useRef(false);

  /**
   * Round bookkeeping for betHistory: bumped on every deal; the betHistory effect
   * records exactly one entry per round (the final handResults when isGameOver flips).
   * Without it, any later dep change after game over (stake edit, late handResults
   * update) appended extra entries, and the live session settled by array length.
   */
  const roundIdRef = useRef(0);
  const recordedRoundIdRef = useRef<number | null>(null);
  const roundTransportRef = useRef<'socket' | 'local'>('local');
  const pendingStartResultRef = useRef<BlackjackStartResult | null>(null);
  const serverSettlementRef = useRef<BlackjackSocketSettlement | null>(null);
  const insuranceDispatchedRoundRef = useRef<number | null>(null);
  const cancelSocketRef = useRef<(() => void) | null>(null);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  };

  const clearScheduledTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current.clear();
  };

  useEffect(() => {
    return () => {
      cancelSocketRef.current?.();
      cancelSocketRef.current = null;
      clearScheduledTimers();
    };
  }, []);

  const resetRoundState = () => {
    cancelSocketRef.current?.();
    cancelSocketRef.current = null;
    clearScheduledTimers();

    setIsGameRunning(true);
    setDeck([]);
    setPlayerHands([]);
    setPlayerHandsScores([]);
    setDealerHand([]);
    setHandResults([]);
    setPlayerScore(0);
    setDealerScore(0);

    setFlippedPlayerCards([]);
    setLocalFlippedFirstHand([]);
    setLocalFlippedSecondHand([]);
    setFlippedDealerCards([]);
    setRevealDealerSecondCard(false);
    setBetHistory([]);
    setCanSplit(false);
    setIsSplitDone(false);
    setIsGameOver(false);

    setIsWin(false);
    setIsLose(false);
    setIsPush(false);
    setIsFirstRoundEnded(false);

    setActiveHandIndex(0);

    setInsuranceOffered(false);
    setInsuranceAccepted(null);
    setIsWinInsurance(false);
    setIsLoseInsurance(false);
    setIsBtnActivated(false);
    setIsPendingAction(false);

    hasCheckedBlackjackRef.current = false;
    dealerPlayStartedRef.current = false;
    pendingStartResultRef.current = null;
    serverSettlementRef.current = null;
    insuranceDispatchedRoundRef.current = null;
    roundIdRef.current += 1;
  };

  const runStaggeredInitialDeal = (
    p1: Card,
    d1: Card,
    p2: Card,
    d2: Card,
    remainingDeck: Card[],
    activeRoundId: number,
  ) => {
    const player: Card[] = [];
    const dealer: Card[] = [];

    const dealCard = (toPlayer: boolean, card: Card) => {
      if (roundIdRef.current !== activeRoundId) return;
      if (toPlayer) {
        player.push(card);
        setPlayerHands([[...player]]);
        setHandResults(['pending']);
      } else {
        dealer.push(card);
        setDealerHand([...dealer]);
      }
    };

    scheduleTimer(() => {
      dealCard(true, p1);
      scheduleTimer(() => {
        dealCard(false, d1);
        scheduleTimer(() => {
          dealCard(true, p2);
          scheduleTimer(() => {
            dealCard(false, d2);
            if (roundIdRef.current === activeRoundId) {
              setDeck(remainingDeck);
            }
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const buildFallbackDeckExcluding = (usedCards: readonly Card[]): Card[] => {
    const fresh = generateDeck();
    return fresh.filter(
      (c) => !usedCards.some((u) => !u.hidden && u.rank === c.rank && u.suit === c.suit),
    );
  };

  const fallbackToLocalMidRound = () => {
    roundTransportRef.current = 'local';
    const usedCards = [...playerHands.flat(), ...dealerHand];
    const remaining = buildFallbackDeckExcluding(usedCards);
    if (dealerHand[1]?.hidden) {
      const replacementHole = remaining.shift() ?? dealerHand[1];
      setDealerHand([dealerHand[0], { ...replacementHole, hidden: false }]);
    }
    setDeck(remaining);
    setIsPendingAction(false);
    setIsBtnActivated(false);
  };

  const animateServerFinish = (
    res: {
      dealerHand?: Card[];
      handResults: HandResult[];
      isWin?: boolean;
      isLose?: boolean;
      isPush?: boolean;
      settlement?: BlackjackSocketSettlement;
    },
    activeRoundId: number,
  ) => {
    if (roundIdRef.current !== activeRoundId) return;
    const finalDealer = res.dealerHand ?? dealerHand;
    const initialTwo = finalDealer.slice(0, 2);
    const extraDealerCards = finalDealer.slice(2);

    setDealerHand(initialTwo);
    setRevealDealerSecondCard(true);

    const finalize = () => {
      if (roundIdRef.current !== activeRoundId) return;
      setHandResults(res.handResults);
      setIsWin(Boolean(res.isWin));
      setIsLose(Boolean(res.isLose));
      setIsPush(Boolean(res.isPush));
      serverSettlementRef.current = res.settlement ?? null;
      setIsGameOver(true);
      setIsGameRunning(false);
      setIsBtnActivated(false);
    };

    if (extraDealerCards.length === 0) {
      scheduleTimer(finalize, 600);
      return;
    }

    extraDealerCards.forEach((_, extraIdx) => {
      scheduleTimer(() => {
        if (roundIdRef.current !== activeRoundId) return;
        setDealerHand(finalDealer.slice(0, 2 + extraIdx + 1));
        if (extraIdx === extraDealerCards.length - 1) {
          scheduleTimer(finalize, 650);
        }
      }, (extraIdx + 1) * 1000);
    });
  };

  const startGame = (options?: { amount?: string; currencyId?: string }) => {
    if (isGameRunning || isPendingAction) return;

    resetRoundState();
    const activeRoundId = roundIdRef.current;

    const startLocalRound = () => {
      roundTransportRef.current = 'local';
      const freshDeck = generateDeck();
      const deckCopy = [...freshDeck];
      const p1 = deckCopy.shift()!;
      const d1 = deckCopy.shift()!;
      const p2 = deckCopy.shift()!;
      const d2 = deckCopy.shift()!;
      runStaggeredInitialDeal(p1, d1, p2, d2, deckCopy, activeRoundId);
    };

    const amountStr = options?.amount ?? String(betAmount);
    const amountNum = Number.parseFloat(amountStr);
    if (socket && connected && Number.isFinite(amountNum) && amountNum > 0) {
      setIsPendingAction(true);
      cancelSocketRef.current = sendBlackjackStartCommand(
        socket,
        {
          amount: amountStr,
          currencyId: options?.currencyId ?? 'btc',
        },
        {
          onResult: (res) => {
            if (roundIdRef.current !== activeRoundId) return;
            cancelSocketRef.current = null;
            setIsPendingAction(false);
            roundTransportRef.current = 'socket';
            pendingStartResultRef.current = res;
            const firstHand = res.playerHands[0] ?? [];
            const p1 = firstHand[0]!;
            const p2 = firstHand[1]!;
            const d1 = res.dealerUpCard;
            const d2Hidden: Card = {
              suit: d1.suit,
              rank: d1.rank,
              hidden: true,
            };
            runStaggeredInitialDeal(p1, d1, p2, d2Hidden, [], activeRoundId);
          },
          onError: (errMsg) => {
            if (roundIdRef.current !== activeRoundId) return;
            console.warn('[Blackjack] Socket start error, fallback to local:', errMsg);
            cancelSocketRef.current = null;
            setIsPendingAction(false);
            startLocalRound();
          },
        },
      );
      return;
    }

    startLocalRound();
  };


  // -------------------------------------------------------------------test---should be deleted after all checks------------
  const customStartGame = (playerCards: Card[], dealerCards: Card[]) => {
    if (isGameRunning || isPendingAction) return;

    resetRoundState();
    roundTransportRef.current = 'local';
    const activeRoundId = roundIdRef.current;

    const freshDeck = generateDeck();
    const deckCopy = [...freshDeck];

    const removeCard = (card: Card) => {
      const index = deckCopy.findIndex(
        (c) => c.rank === card.rank && c.suit === card.suit,
      );
      if (index !== -1) deckCopy.splice(index, 1);
    };
    [...playerCards, ...dealerCards].forEach(removeCard);

    runStaggeredInitialDeal(
      playerCards[0],
      dealerCards[0],
      playerCards[1],
      dealerCards[1],
      deckCopy,
      activeRoundId,
    );
  };
  // ------------------------------------------------------------------------------------------------------------------------

  // Add a new card face down for the first hand
  useEffect(() => {
    if (playerHands[0]?.length > localFlippedFirstHand.length) {
      setLocalFlippedFirstHand((prev) => [...prev, false]);
    }
  }, [playerHands[0]]);

  // Add a new card face down for the second hand
  useEffect(() => {
    if (playerHands[1]?.length > localFlippedSecondHand.length) {
      setLocalFlippedSecondHand((prev) => [...prev, false]);
    }
  }, [playerHands[1]]);

  // Dealer cards
  useEffect(() => {
    if (dealerHand.length > flippedDealerCards.length) {
      setFlippedDealerCards((prev) => [...prev, false]);
    }
  }, [dealerHand]);

  const applyHitCard = (card: Card, targetHandIndex: number) => {
    const handsCopy = [...playerHands];
    handsCopy[targetHandIndex] = [...(handsCopy[targetHandIndex] ?? []), card];
    setPlayerHands(handsCopy);

    if (targetHandIndex === 0) {
      setLocalFlippedFirstHand((prev) => [...prev, false]);
    } else {
      setLocalFlippedSecondHand((prev) => [...prev, false]);
    }
  };

  const hit = () => {
    if (isGameOver || isPendingAction || isBtnActivated) return;

    if (roundTransportRef.current === 'socket' && socket && connected) {
      const activeRoundId = roundIdRef.current;
      setIsBtnActivated(true);
      setIsPendingAction(true);
      setCanSplit(false);

      cancelSocketRef.current = sendBlackjackActionCommand(socket, 'hit', {
        onResult: (res: BlackjackActionResult) => {
          if (roundIdRef.current !== activeRoundId) return;
          cancelSocketRef.current = null;
          setIsPendingAction(false);
          if (res.card) {
            applyHitCard(res.card, res.handIndex);
          }

          if (res.status === 'finished') {
            scheduleTimer(() => {
              animateServerFinish(res, activeRoundId);
            }, 650);
          } else {
            scheduleTimer(() => {
              if (roundIdRef.current !== activeRoundId) return;
              setHandResults(res.handResults);
              setActiveHandIndex(res.activeHandIndex);
              setIsBtnActivated(false);
            }, 650);
          }
        },
        onError: (errMsg) => {
          if (roundIdRef.current !== activeRoundId) return;
          console.warn('[Blackjack] Socket hit error, fallback to local:', errMsg);
          cancelSocketRef.current = null;
          fallbackToLocalMidRound();
        },
      });
      return;
    }

    if (!deck.length) return;

    setIsBtnActivated(true);
    setCanSplit(false);

    const deckCopy = [...deck];
    const cardIndex = Math.floor(Math.random() * deckCopy.length);
    const card = deckCopy.splice(cardIndex, 1)[0];

    applyHitCard(card, activeHandIndex);
    setDeck(deckCopy);

    scheduleTimer(() => {
      setIsBtnActivated(false);
    }, 1000);
  };

  const stand = () => {
    if (isGameOver || isPendingAction || isBtnActivated) return;

    if (roundTransportRef.current === 'socket' && socket && connected) {
      const activeRoundId = roundIdRef.current;
      setIsBtnActivated(true);
      setIsPendingAction(true);
      setCanSplit(false);

      cancelSocketRef.current = sendBlackjackActionCommand(socket, 'stand', {
        onResult: (res: BlackjackActionResult) => {
          if (roundIdRef.current !== activeRoundId) return;
          cancelSocketRef.current = null;
          setIsPendingAction(false);
          setHandResults(res.handResults);
          if (res.status === 'playing') {
            setActiveHandIndex(res.activeHandIndex);
            setIsBtnActivated(false);
          } else {
            animateServerFinish(res, activeRoundId);
          }
        },
        onError: (errMsg) => {
          if (roundIdRef.current !== activeRoundId) return;
          console.warn('[Blackjack] Socket stand error, fallback to local:', errMsg);
          cancelSocketRef.current = null;
          fallbackToLocalMidRound();
        },
      });
      return;
    }

    setIsBtnActivated(true);

    const resultsCopy = [...handResults];
    if (resultsCopy[activeHandIndex] === 'pending') {
      resultsCopy[activeHandIndex] = 'stand';
      setHandResults(resultsCopy);
    }

    if (isSplitDone && activeHandIndex === 0) {
      setActiveHandIndex(1);
      setIsBtnActivated(false);
      return;
    }

    if (resultsCopy.every((r) => r !== 'pending')) {
      revealDealerAndFinishGame(resultsCopy);
    } else {
      setIsBtnActivated(false);
    }
  };

  const revealDealerAndFinishGame = (results: HandResult[] = handResults) => {
    if (isGameOver || dealerPlayStartedRef.current) return;
    dealerPlayStartedRef.current = true;
    setRevealDealerSecondCard(true);

    if (results.every((r) => r === 'busted')) {
      setIsGameOver(true);
      setIsLose(true);
      setIsGameRunning(false);

      return;
    }

    setTimeout(() => {
      const deckCopy = [...deck];
      const dealerCardsCopy = [...dealerHand];

      const playDealer = () => {
        const dealerScore = calculateScore(dealerCardsCopy);

        if (dealerScore < 17) {
          if (deckCopy.length === 0) {
            finishGame();
            return;
          }

          const card = deckCopy.shift();
          if (!card) {
            finishGame();
            return;
          }

          dealerCardsCopy.push(card);
          setDealerHand([...dealerCardsCopy]);
          setDeck(deckCopy);

          setTimeout(playDealer, 1000);
        } else {
          finishGame();
        }
      };

      const finishGame = () => {
        const resultsCopy = [...results];

        playerHands.forEach((hand, idx) => {
          if (resultsCopy[idx] === 'busted') return;

          const playerScore = calculateScore(
            hand.filter((_, i) => {
              return idx === 0 ? localFlippedFirstHand[i] : localFlippedSecondHand[i];
            }),
          );
          const dealerScoreFinal = calculateScore(dealerCardsCopy);

          if (playerScore > 21) {
            resultsCopy[idx] = 'busted';
          } else if (dealerScoreFinal > 21 || playerScore > dealerScoreFinal) {
            resultsCopy[idx] = 'win';
          } else if (playerScore === dealerScoreFinal) {
            resultsCopy[idx] = 'push';
          } else {
            resultsCopy[idx] = 'lose';
          }
        });

        setHandResults(resultsCopy);

        setIsGameOver(true);
        setIsGameRunning(false);

        setIsWin(resultsCopy.some((r) => r === 'win'));
        setIsLose(resultsCopy.every((r) => r === 'lose' || r === 'busted'));
        setIsPush(resultsCopy.some((r) => r === 'push'));
      };

      playDealer();
    }, 1000);
  };

  const doubleDown = () => {
    if (playerHands.length === 0 || playerHands[0].length !== 2) return;
    if (isSplitDone) return;
    if (isGameOver || isPendingAction || isBtnActivated) return;

    if (roundTransportRef.current === 'socket' && socket && connected) {
      const activeRoundId = roundIdRef.current;
      setIsBtnActivated(true);
      setIsPendingAction(true);
      setCanSplit(false);
      setBetAmount((prev) => prev * 2);

      cancelSocketRef.current = sendBlackjackActionCommand(socket, 'double', {
        onResult: (res: BlackjackActionResult) => {
          if (roundIdRef.current !== activeRoundId) return;
          cancelSocketRef.current = null;
          setIsPendingAction(false);
          if (res.card) {
            applyHitCard(res.card, 0);
          }
          scheduleTimer(() => {
            animateServerFinish(res, activeRoundId);
          }, 650);
        },
        onError: (errMsg) => {
          if (roundIdRef.current !== activeRoundId) return;
          console.warn('[Blackjack] Socket double error, fallback to local:', errMsg);
          cancelSocketRef.current = null;
          fallbackToLocalMidRound();
        },
      });
      return;
    }

    setIsBtnActivated(true);

    setBetAmount((prev) => prev * 2);

    const deckCopy = [...deck];
    const cardIndex = Math.floor(Math.random() * deckCopy.length);
    const card = deckCopy.splice(cardIndex, 1)[0];

    const handsCopy = [...playerHands];
    handsCopy[0] = [...handsCopy[0], card];

    setPlayerHands(handsCopy);
    setDeck(deckCopy);
    setLocalFlippedFirstHand((prev) => [...prev, false]);

    setTimeout(() => {
      setRevealDealerSecondCard(true);

      setTimeout(() => {
        const newHandCards = handsCopy[0];
        const newScore = calculateScore(newHandCards);

        if (newScore > 21) {
          setHandResults(['busted']);
          setIsLose(true);
          setIsGameOver(true);
          setIsGameRunning(false);
          setIsBtnActivated(false);
          return;
        }

        setHandResults(['stand']);

        const dealerCardsCopy = [...dealerHand];
        const dealerScore = calculateScore(dealerCardsCopy);

        if (dealerScore === 21 && newScore === 21) {
          setHandResults(['push']);
          setIsPush(true);
          setIsGameOver(true);
          setIsGameRunning(false);
          setIsBtnActivated(false);
        } else {
          const playDealer = () => {
            const currentDealerScore = calculateScore(dealerCardsCopy);

            if (currentDealerScore < 17) {
              if (deckCopy.length === 0) {
                finishGame();
                return;
              }

              const dealerCard = deckCopy.shift();
              if (!dealerCard) {
                finishGame();
                return;
              }

              dealerCardsCopy.push(dealerCard);
              setDealerHand([...dealerCardsCopy]);
              setDeck(deckCopy);

              setTimeout(playDealer, 1000);
            } else {
              finishGame();
            }
          };

          const finishGame = () => {
            const dealerScoreFinal = calculateScore(dealerCardsCopy);

            let result: HandResult;
            if (dealerScoreFinal > 21 || newScore > dealerScoreFinal) {
              result = 'win';
              setIsWin(true);
            } else if (newScore === dealerScoreFinal) {
              result = 'push';
              setIsPush(true);
            } else {
              result = 'lose';
              setIsLose(true);
            }

            setHandResults([result]);
            setIsGameOver(true);
            setIsGameRunning(false);
            setIsBtnActivated(false);
          };

          playDealer();
        }
      }, 500);
    }, 600);
  };

  const split = () => {
    if (!canSplit || isPendingAction || isBtnActivated || isSplitDone) return;

    const handsCopy = [...playerHands];
    const handToSplit = handsCopy[0];
    if (!handToSplit || handToSplit.length !== 2) return;

    const firstHand = [handToSplit[0]];
    const secondHand = [handToSplit[1]];

    if (roundTransportRef.current === 'socket' && socket && connected) {
      const activeRoundId = roundIdRef.current;
      setIsBtnActivated(true);
      setIsPendingAction(true);

      cancelSocketRef.current = sendBlackjackActionCommand(socket, 'split', {
        onResult: (res: BlackjackActionResult) => {
          if (roundIdRef.current !== activeRoundId) return;
          cancelSocketRef.current = null;
          setIsPendingAction(false);

          setIsSplitDone(true);
          setPlayerHands([firstHand, secondHand]);
          setPlayerHandsScores([
            calculateScore(firstHand),
            calculateScore(secondHand),
          ]);
          setHandResults(['pending', 'pending']);
          setLocalFlippedFirstHand([true]);
          setLocalFlippedSecondHand([true]);
          setActiveHandIndex(0);
          setCanSplit(false);

          scheduleTimer(() => {
            if (roundIdRef.current !== activeRoundId) return;
            setPlayerHands(res.playerHands);
            setLocalFlippedFirstHand((prev) => [...prev, false]);
            setLocalFlippedSecondHand((prev) => [...prev, false]);
            setFlippedPlayerCards((prev) => [...prev, false, false]);
            scheduleTimer(() => {
              if (roundIdRef.current !== activeRoundId) return;
              setIsBtnActivated(false);
            }, 600);
          }, 1000);
        },
        onError: (errMsg) => {
          if (roundIdRef.current !== activeRoundId) return;
          console.warn('[Blackjack] Socket split error, fallback to local:', errMsg);
          cancelSocketRef.current = null;
          fallbackToLocalMidRound();
        },
      });
      return;
    }

    setIsSplitDone(true);

    const newHands = [firstHand, secondHand];

    setPlayerHands(newHands);
    setPlayerHandsScores([calculateScore(firstHand), calculateScore(secondHand)]);

    setHandResults(newHands.map(() => 'pending'));

    setLocalFlippedFirstHand([true]);
    setLocalFlippedSecondHand([true]);

    setActiveHandIndex(0);
    setCanSplit(false);
  };

  // useEffect - check bust and change hands for split game
  useEffect(() => {
    if (roundTransportRef.current === 'socket') return;
    if (!isSplitDone) return;
    if (isGameOver) return;

    const checkHand = (handIdx: number) => {
      const currentHandFlipped =
        handIdx === 0 ? localFlippedFirstHand : localFlippedSecondHand;

      const currentHandCards = playerHands[handIdx].filter(
        (_, idx) => currentHandFlipped[idx],
      );

      return calculateScore(currentHandCards);
    };

    const resultsCopy = [...handResults];
    let updated = false;

    playerHands.forEach((hand, idx) => {
      if (resultsCopy[idx] === 'pending') {
        const score = checkHand(idx);

        if (score > 21) {
          resultsCopy[idx] = 'busted';
          updated = true;

          if (idx === 0) {
            setActiveHandIndex(1);
          }
        }
      }
    });

    if (updated) {
      setHandResults(resultsCopy);

      if (resultsCopy.every((r) => r === 'busted')) {
        setRevealDealerSecondCard(true);
        setIsGameOver(true);
        setIsGameRunning(false);

        setIsLose(true);
        return;
      }
    }

    if (resultsCopy.every((r) => r !== 'pending')) {
      revealDealerAndFinishGame(resultsCopy);
    }
  }, [
    localFlippedFirstHand,
    localFlippedSecondHand,
    playerHands,
    isSplitDone,
    handResults,
    isGameOver,
  ]);

  // useEffect - check bust for usual game
  useEffect(() => {
    if (roundTransportRef.current === 'socket') return;
    if (playerHands.length === 0 || isSplitDone) return;

    const currentHandCards = playerHands[0].filter(
      (_, idx) => localFlippedFirstHand[idx],
    );
    const score = calculateScore(currentHandCards);

    if (score > 21) {
      setHandResults(['busted']);
    }
  }, [localFlippedFirstHand, playerHands]);

  // add second cards for both hands after split
  useEffect(() => {
    if (roundTransportRef.current === 'socket') return;
    if (!isSplitDone) return;

    const timeout = setTimeout(() => {
      if (deck.length === 0) return;

      const handsCopy = [...playerHands];
      const deckCopy = [...deck];

      for (let i = 0; i < handsCopy.length; i++) {
        if (deckCopy.length === 0) break;

        const randomIndex = Math.floor(Math.random() * deckCopy.length);
        const card = deckCopy.splice(randomIndex, 1)[0];
        handsCopy[i] = [...handsCopy[i], card];

        if (i === 0) {
          setLocalFlippedFirstHand((prev) => [...prev, false]);
        } else if (i === 1) {
          setLocalFlippedSecondHand((prev) => [...prev, false]);
        }
      }

      setPlayerHands(handsCopy);
      setDeck(deckCopy);

      setFlippedPlayerCards((prev) => [...prev, false, false]);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isSplitDone]);

  // check blackjack
  const hasCheckedBlackjackRef = useRef(false);

  const checkInitialBlackjack = () => {
    if (hasCheckedBlackjackRef.current) return;
    hasCheckedBlackjackRef.current = true;

    if (isFirstRoundEnded) return;

    setIsFirstRoundEnded(true);

    if (roundTransportRef.current === 'socket') {
      const startRes = pendingStartResultRef.current;
      if (!startRes) return;
      setCanSplit(startRes.canSplit);

      if (startRes.status === 'insurance') {
        setInsuranceOffered(true);
        return;
      }

      if (startRes.status === 'finished') {
        if (startRes.dealerHand) {
          setDealerHand(startRes.dealerHand);
        }
        setRevealDealerSecondCard(true);
        if (startRes.handResults) {
          setHandResults(startRes.handResults);
        }
        setIsWin(Boolean(startRes.isWin));
        setIsLose(Boolean(startRes.isLose));
        setIsPush(Boolean(startRes.isPush));
        serverSettlementRef.current = startRes.settlement ?? null;
        setIsGameOver(true);
        setIsGameRunning(false);
        return;
      }

      return;
    }

    const dealerUpCard = dealerHand[0];
    const dealerScore = calculateScore(dealerHand);

    const playerScore = calculateScore(playerHands[0] || []);
    if (
      playerHands[0] &&
      playerHands[0].length === 2 &&
      playerHands[0][0].rank === playerHands[0][1].rank
    ) {
      setCanSplit(true);
    }

    const dealerHasBlackjack = dealerScore === 21;
    const playerHasBlackjack = playerScore === 21;

    if (dealerUpCard.rank === 'Ace') {
      setInsuranceOffered(true);
      return;
    }

    if (dealerHasBlackjack && playerHasBlackjack) {
      setRevealDealerSecondCard(true);
      setHandResults(['push']);
      setIsGameOver(true);
      setIsGameRunning(false);

      return;
    }

    if (dealerHasBlackjack) {
      setRevealDealerSecondCard(true);
      setIsGameOver(true);
      setIsGameRunning(false);

      setHandResults(['lose']);
      return;
    }

    if (playerHasBlackjack) {
      setHandResults(['blackjack']);
      setIsGameOver(true);
      setIsGameRunning(false);

      setRevealDealerSecondCard(true);
      return;
    }
  };

  // insurance
  useEffect(() => {
    if (!insuranceOffered || insuranceAccepted === null) return;

    if (roundTransportRef.current === 'socket' && socket && connected) {
      if (insuranceDispatchedRoundRef.current === roundIdRef.current) return;
      const activeRoundId = roundIdRef.current;
      insuranceDispatchedRoundRef.current = activeRoundId;
      setIsPendingAction(true);

      cancelSocketRef.current = sendBlackjackInsuranceCommand(
        socket,
        { accepted: insuranceAccepted },
        {
          onResult: (res) => {
            if (roundIdRef.current !== activeRoundId) return;
            cancelSocketRef.current = null;
            setIsPendingAction(false);
            setInsuranceOffered(false);
            if (res.insuranceResult === 'win') setIsWinInsurance(true);
            if (res.insuranceResult === 'lose') setIsLoseInsurance(true);

            if (res.status === 'finished') {
              if (res.dealerHand) {
                setDealerHand(res.dealerHand);
              }
              setRevealDealerSecondCard(true);
              if (res.handResults) {
                setHandResults(res.handResults);
              }
              setIsWin(Boolean(res.isWin));
              setIsLose(Boolean(res.isLose));
              setIsPush(Boolean(res.isPush));
              serverSettlementRef.current = res.settlement ?? null;
              setIsGameOver(true);
              setIsGameRunning(false);
            } else {
              setCanSplit(res.canSplit);
            }
          },
          onError: (errMsg) => {
            if (roundIdRef.current !== activeRoundId) return;
            console.warn(
              '[Blackjack] Socket insurance error, fallback to local:',
              errMsg,
            );
            cancelSocketRef.current = null;
            fallbackToLocalMidRound();
          },
        },
      );
      return;
    }

    const timeout = setTimeout(() => {
      if (dealerHand.length < 2 || playerHands[0].length < 2) return;

      const dealerScore = calculateScore(dealerHand);
      const playerScore = calculateScore(playerHands[0] || []);

      const playerHasBlackjack = playerScore === 21;
      const dealerHasBlackjack = dealerScore === 21;

      switch (insuranceAccepted) {
        case true:
          if (dealerHasBlackjack) {
            setRevealDealerSecondCard(true);
            setIsWinInsurance(true);
            setIsGameOver(true);
            setIsGameRunning(false);

            if (playerHasBlackjack) {
              setIsPush(true);
              setHandResults(['push']);
            } else {
              setIsLose(true);
              setHandResults(['lose']);
            }
          } else {
            setIsLoseInsurance(true);

            if (playerHasBlackjack) {
              setIsWin(true);
              setRevealDealerSecondCard(true);
              setHandResults(['blackjack']);
              setIsGameOver(true);
              setIsGameRunning(false);
            }
          }
          break;

        case false:
          if (dealerHasBlackjack) {
            setRevealDealerSecondCard(true);
            setIsGameOver(true);
            setIsGameRunning(false);

            if (playerHasBlackjack) {
              setIsPush(true);
              setHandResults(['push']);
            } else {
              setIsLose(true);
              setHandResults(['lose']);
            }
          } else if (playerHasBlackjack) {
            setIsWin(true);
            setRevealDealerSecondCard(true);
            setIsGameOver(true);
            setIsGameRunning(false);

            setHandResults(['blackjack']);
          }
          break;
      }

      setInsuranceOffered(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, [insuranceAccepted, insuranceOffered, dealerHand, playerHands]);

  const updateDealerScore = (cards: Card[]) => {
    setDealerScore(calculateScore(cards));
  };

  // update dealer score
  useEffect(() => {
    const visibleCards = revealDealerSecondCard
      ? dealerHand.filter((_, i) => flippedDealerCards[i])
      : dealerHand.slice(0, 1).filter((_, i) => flippedDealerCards[i]);

    updateDealerScore(visibleCards);
  }, [flippedDealerCards, revealDealerSecondCard, dealerHand, updateDealerScore]);

  // update player score
  useEffect(() => {
    if (playerHands.length === 0) return;

    if (!isSplitDone) {
      // one hand
      const visibleCards = playerHands[0].filter((_, idx) => flippedPlayerCards[idx]);
      const score = calculateScore(visibleCards);
      setPlayerScore(score);

      if (score > 21 && roundTransportRef.current !== 'socket') {
        setRevealDealerSecondCard(true);
        setIsLose(true);
        setIsGameOver(true);
        setIsGameRunning(false);

        setCanSplit(false);
      }
    } else {
      // Split
      const firstHandVisible = playerHands[0].filter(
        (_, idx) => localFlippedFirstHand[idx],
      );
      const secondHandVisible = playerHands[1].filter(
        (_, idx) => localFlippedSecondHand[idx],
      );

      setPlayerHandsScores([
        calculateScore(firstHandVisible),
        calculateScore(secondHandVisible),
      ]);

      if (roundTransportRef.current !== 'socket') {
        // Check for bust for each hand
        const resultsCopy = [...handResults];
        if (calculateScore(firstHandVisible) > 21) resultsCopy[0] = 'busted';
        if (calculateScore(secondHandVisible) > 21) resultsCopy[1] = 'busted';
        setHandResults(resultsCopy);
      }
    }
  }, [
    flippedPlayerCards,
    localFlippedFirstHand,
    localFlippedSecondHand,
    playerHands,
    isSplitDone,
  ]);

  const calculateWinAmount = (
    bet: number,
    results: HandResult[],
    insuranceTaken: boolean,
    insuranceWin: boolean,
  ): number => {
    let total = 0;

    results.forEach((res) => {
      switch (res) {
        case 'win':
          total += bet;
          break;
        case 'blackjack':
          total += bet * 1.5;
          break;
        case 'lose':
        case 'busted':
          total -= bet;
          break;
        case 'push':
          total += 0;
          break;
        case 'pending':
        case 'stand':
          break;
      }
    });

    if (insuranceTaken) {
      if (insuranceWin) total += bet / 2;
      else total -= bet / 2;
    }

    return total;
  };

  const calculateHandsWinAmount = (bet: number, results: HandResult[]): number =>
    results.reduce((total, res) => {
      if (res === 'win') return total + bet;
      if (res === 'blackjack') return total + bet * 1.5;
      return total;
    }, 0);

  // update betHistory
  useEffect(() => {
    if (!isGameOver) return;
    if (recordedRoundIdRef.current === roundIdRef.current) return;
    recordedRoundIdRef.current = roundIdRef.current;

    const winAmount = calculateWinAmount(
      betAmount,
      handResults,
      insuranceAccepted ?? false,
      isWinInsurance,
    );

    const newBetItem: BetHistoryItem = {
      roundId: roundIdRef.current,
      betAmount,
      isSplit: isSplitDone,
      handResults: [...handResults],
      insuranceTaken: insuranceAccepted ?? false,
      insuranceResult: isWinInsurance ? 'win' : isLoseInsurance ? 'lose' : undefined,
      blackjack: handResults.includes('blackjack'),
      winAmount,
      handsWinAmount: calculateHandsWinAmount(betAmount, handResults),
      isPlayerWin: handResults.some((r) => r === 'win' || r === 'blackjack'),
      serverSettlement: serverSettlementRef.current ?? undefined,
    };

    setBetHistory((prev) => [...prev, newBetItem]);
  }, [
    handResults,
    isSplitDone,
    insuranceAccepted,
    isWinInsurance,
    isLoseInsurance,
    betAmount,
    isGameOver,
  ]);

  return (
    <BlackjackGameContext.Provider
      value={{
        playerHands,
        handResults,

        activeHandIndex,

        dealerHand,
        flippedPlayerCards,
        setFlippedPlayerCards,
        localFlippedFirstHand,
        setLocalFlippedFirstHand,
        localFlippedSecondHand,
        setLocalFlippedSecondHand,

        flippedDealerCards,
        setFlippedDealerCards,
        revealDealerSecondCard,

        playerScore,
        dealerScore,
        playerHandsScores,
        updateDealerScore,

        startGame,
        customStartGame,
        hit,
        stand,
        doubleDown,
        split,

        insuranceOffered,
        setInsuranceAccepted,

        canSplit,
        isSplitDone,

        isFirstRoundEnded,
        checkInitialBlackjack,
        isGameOver,

        setBetAmount,
        betHistory,

        isWin,
        isPush,
        isLose,

        isBtnActivated,
        isPendingAction,
        isGameRunning,
      }}
    >
      {children}
    </BlackjackGameContext.Provider>
  );
};

export const useBlackjackGame = (): BlackjackGameContextProps => {
  const context = useContext(BlackjackGameContext);
  if (!context) {
    throw new Error('useBlackjackGame must be used within a BlackjackProvider');
  }
  return context;
};
