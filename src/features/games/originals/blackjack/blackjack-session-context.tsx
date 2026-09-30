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
}

interface BetHistoryItem {
  betAmount: number;
  isSplit: boolean;
  handResults: HandResult[];
  insuranceTaken: boolean;
  insuranceResult?: 'win' | 'lose';
  blackjack: boolean;
  winAmount: number;
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

  startGame: () => void;
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
  const [isGameRunning, setIsGameRunning] = useState(false);

  const startGame = () => {
    if (isGameRunning) return;

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

    hasCheckedBlackjackRef.current = false;

    const freshDeck = generateDeck();
    const deckCopy = [...freshDeck];
    const player: Card[] = [];
    const dealer: Card[] = [];

    const dealCard = (toPlayer: boolean) => {
      const card = deckCopy.shift();
      if (!card) return;

      if (toPlayer) {
        player.push(card);
        setPlayerHands([[...player]]);
        setHandResults(['pending']);
      } else {
        dealer.push(card);
        setDealerHand([...dealer]);
      }
    };

    setTimeout(() => {
      dealCard(true); // P1
      setTimeout(() => {
        dealCard(false); // D1
        setTimeout(() => {
          dealCard(true); // P2
          setTimeout(() => {
            dealCard(false); // D2
            setDeck(deckCopy);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };


  // -------------------------------------------------------------------test---should be deleted after all checks------------
  const customStartGame = (playerCards: Card[], dealerCards: Card[]) => {
    if (isGameRunning) return;

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

    hasCheckedBlackjackRef.current = false;

    const freshDeck = generateDeck();
    const deckCopy = [...freshDeck];

    const removeCard = (card: Card) => {
      const index = deckCopy.findIndex(
        (c) => c.rank === card.rank && c.suit === card.suit,
      );
      if (index !== -1) deckCopy.splice(index, 1);
    };
    [...playerCards, ...dealerCards].forEach(removeCard);

    const player: Card[] = [];
    const dealer: Card[] = [];

    const dealCard = (toPlayer: boolean, card: Card) => {
      if (toPlayer) {
        player.push(card);
        setPlayerHands([[...player]]);
        setHandResults(['pending']);
      } else {
        dealer.push(card);
        setDealerHand([...dealer]);
      }
    };

    setTimeout(() => {
      dealCard(true, playerCards[0]);
      setTimeout(() => {
        dealCard(false, dealerCards[0]);
        setTimeout(() => {
          dealCard(true, playerCards[1]);
          setTimeout(() => {
            dealCard(false, dealerCards[1]);
            setDeck(deckCopy);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
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

  const hit = () => {
    if (!deck.length) return;
    if (isGameOver || deck.length === 0) return;

    setIsBtnActivated(true);

    setCanSplit(false);

    const deckCopy = [...deck];
    const cardIndex = Math.floor(Math.random() * deckCopy.length);
    const card = deckCopy.splice(cardIndex, 1)[0];

    const handsCopy = [...playerHands];
    handsCopy[activeHandIndex] = [...handsCopy[activeHandIndex], card];

    setPlayerHands(handsCopy);
    setDeck(deckCopy);

    if (activeHandIndex === 0) {
      setLocalFlippedFirstHand((prev) => [...prev, false]);
    } else {
      setLocalFlippedSecondHand((prev) => [...prev, false]);
    }

    setTimeout(() => {
      setIsBtnActivated(false);
    }, 1000);
  };

  const stand = () => {
    if (isGameOver) return;

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
      revealDealerAndFinishGame();
    } else {
      setIsBtnActivated(false);
    }
  };

  const revealDealerAndFinishGame = (results: HandResult[] = handResults) => {
    if (isGameOver) return;
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
    if (isGameOver) return;

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
    if (!canSplit) return;

    setIsSplitDone(true);

    const handsCopy = [...playerHands];
    const handToSplit = handsCopy[0];
    if (!handToSplit || handToSplit.length !== 2) return;

    const firstHand = [handToSplit[0]];
    const secondHand = [handToSplit[1]];

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

      if (score > 21) {
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

      // Check for bust for each hand
      const resultsCopy = [...handResults];
      if (calculateScore(firstHandVisible) > 21) resultsCopy[0] = 'busted';
      if (calculateScore(secondHandVisible) > 21) resultsCopy[1] = 'busted';
      setHandResults(resultsCopy);
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

  // update betHistory
  useEffect(() => {
    if (!isGameOver) return;

    const winAmount = calculateWinAmount(
      betAmount,
      handResults,
      insuranceAccepted ?? false,
      isWinInsurance,
    );

    const newBetItem: BetHistoryItem = {
      betAmount,
      isSplit: isSplitDone,
      handResults: [...handResults],
      insuranceTaken: insuranceAccepted ?? false,
      insuranceResult: isWinInsurance ? 'win' : isLoseInsurance ? 'lose' : undefined,
      blackjack: handResults.includes('blackjack'),
      winAmount,
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
