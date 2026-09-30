import type { Card } from '#ui/features/games/originals/blackjack/blackjack-session-context';

export interface BlackjackConfigExampleScenario {
  id: string;
  /** Short case name shown on the button (BJ / insurance / split). */
  title: string;
  /** Dealer cards + flags (natural BJ, insurance) — readable at a glance. */
  dealerLine: string;
  /** Player cards + outcome / split — readable at a glance. */
  playerLine: string;
  dealerTone?: 'yellow' | 'red' | 'white';
  playerTone?: 'yellow' | 'red' | 'white' | 'green';
  playerCards: Card[];
  dealerCards: Card[];
}

export interface BlackjackConfigExamplesProps {
  /** Called when a scenario button is pressed. */
  onScenario: (playerCards: Card[], dealerCards: Card[]) => void;
  /** Disables all scenario buttons (e.g. while a hand is running). */
  disabled?: boolean;
  /** Optional override of the default Storybook / demo scenarios. */
  scenarios?: readonly BlackjackConfigExampleScenario[];
  title?: string;
  /**
   * `horizontal` — wrap/scroll row under the board (Composition / Config).
   * `vertical` — stacked panel (standalone story).
   */
  layout?: 'horizontal' | 'vertical';
  className?: string;
}