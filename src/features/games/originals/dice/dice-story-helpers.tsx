import type { ReactNode } from 'react';

import type { DiceBoardLabels } from './dice-board/dice-board.types';
import type { DiceControlsLabels } from './dice-controls/dice-controls.types';
import type {
  DiceLastResultColor,
  DiceLastResultItem,
  DiceLastResultsAssets,
  DiceLastResultsLabels,
} from './dice-last-results/dice-last-results.types';

import { Image } from '#ui/primitives/data-display/image/image';

let nextStoryResultId = 1;

export const diceStoryCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    wrapperClassName="size-5 shrink-0 rounded-ds-full"
    className="size-5 object-contain"
    showSkeleton={false}
  />
);

export const diceStoryWinCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={32}
    height={32}
    wrapperClassName="size-8 shrink-0 rounded-ds-full"
    className="size-8 object-contain"
    showSkeleton={false}
  />
);

export const diceStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export const diceStoryStopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

export const diceStoryControlsLabels: DiceControlsLabels = {
  rollUnder: 'Roll Under',
  rollOver: 'Roll Over',
  multiplier: 'Multiplier',
  winChance: 'Win Chance',
  toggleDirection: 'Toggle roll direction',
  decrease: 'Decrease',
  increase: 'Increase',
};

export const diceStoryBoardLabels: DiceBoardLabels = {
  yourNumber: 'Your number',
  rolledNumber: 'Rolled number',
  sliderAriaLabel: 'Dice target value',
};

export const diceStoryLastResultsAssets: DiceLastResultsAssets = {
  green: '/img/games/dice/green-tile.svg',
  red: '/img/games/dice/red-tile.svg',
  lead: '/img/games/dice/undefined-result.svg',
};

export const diceStoryLastResultsLabels: DiceLastResultsLabels = {
  green: 'Win',
  red: 'Loss',
};

export const diceStoryLastResultsAriaLabel = 'Dice last results';

/** Legacy dice board offset: modal sits above the slider, not centered on it. */
export const diceStoryWinModalContentClassName = 'translate-y-[-170%]';

const DICE_STORY_SOUNDS = {
  scroll: { src: '/sounds/games/dice/odds_scroll.wav', gain: 0.1 },
  roll: { src: '/sounds/games/dice/roll.wav', gain: 0.1 },
} as const;

export type DiceStorySoundName = keyof typeof DICE_STORY_SOUNDS;

const diceStorySoundTemplates = new Map<string, HTMLAudioElement>();
const diceStorySoundGains = new WeakMap<HTMLAudioElement, number>();

function getDiceStorySoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = diceStorySoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  diceStorySoundTemplates.set(src, template);
  return template;
}

export function preloadDiceStorySounds(): void {
  Object.values(DICE_STORY_SOUNDS).forEach((entry) => {
    getDiceStorySoundTemplate(entry.src);
  });
}

function getSafeDiceMasterVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

function getSafeDiceStorySoundVolume(volume: number, gain: number): number {
  const safeGain = Number.isFinite(gain) ? Math.min(1, Math.max(0, gain)) : 1;
  return getSafeDiceMasterVolume(volume) * safeGain;
}

export function setDiceStorySoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const master = getSafeDiceMasterVolume(volume);
  for (const sound of sounds) {
    const gain = diceStorySoundGains.get(sound) ?? 1;
    sound.volume = master * gain;
  }
}

export function stopDiceStorySounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playDiceStorySound(
  name: DiceStorySoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const entry = DICE_STORY_SOUNDS[name];
  const safeVolume = getSafeDiceStorySoundVolume(volume, entry.gain);
  if (safeVolume <= 0) return null;

  const template = getDiceStorySoundTemplate(entry.src);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  diceStorySoundGains.set(audio, entry.gain);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}

export function createDiceStoryLastResult(
  value: number,
  color: DiceLastResultColor,
  id?: string,
): DiceLastResultItem {
  const nextId = id ?? `dice-story-${nextStoryResultId}`;
  nextStoryResultId += 1;

  return { id: nextId, value, color };
}

export const diceStoryLastResults: DiceLastResultItem[] = [
  createDiceStoryLastResult(42.18, 'green', 'dice-1'),
  createDiceStoryLastResult(71.04, 'red', 'dice-2'),
  createDiceStoryLastResult(19.55, 'green', 'dice-3'),
  createDiceStoryLastResult(88.2, 'red', 'dice-4'),
];
