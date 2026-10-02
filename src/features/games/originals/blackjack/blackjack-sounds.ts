const BLACKJACK_SOUNDS = {
  deal: { src: '/sounds/games/blackjack/deal.wav', gain: 0.35 },
  flip: { src: '/sounds/games/blackjack/flip.wav', gain: 0.3 },
  split: { src: '/sounds/games/blackjack/split.wav', gain: 0.35 },
  blackjack: { src: '/sounds/games/blackjack/blackjack.wav', gain: 0.4 },
  insurance: { src: '/sounds/games/blackjack/insurance.wav', gain: 0.3 },
} as const;

export type BlackjackSoundName = keyof typeof BLACKJACK_SOUNDS;

const blackjackSoundTemplates = new Map<string, HTMLAudioElement>();
const blackjackSoundGains = new WeakMap<HTMLAudioElement, number>();

function getBlackjackSoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = blackjackSoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  blackjackSoundTemplates.set(src, template);
  return template;
}

export function preloadBlackjackSounds(): void {
  Object.values(BLACKJACK_SOUNDS).forEach((entry) => {
    getBlackjackSoundTemplate(entry.src);
  });
}

function getSafeBlackjackMasterVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

function getSafeBlackjackSoundVolume(volume: number, gain: number): number {
  const safeGain = Number.isFinite(gain) ? Math.min(1, Math.max(0, gain)) : 1;
  return getSafeBlackjackMasterVolume(volume) * safeGain;
}

export function setBlackjackSoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const master = getSafeBlackjackMasterVolume(volume);
  for (const sound of sounds) {
    const gain = blackjackSoundGains.get(sound) ?? 1;
    sound.volume = master * gain;
  }
}

export function stopBlackjackSounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playBlackjackSound(
  name: BlackjackSoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const entry = BLACKJACK_SOUNDS[name];
  const safeVolume = getSafeBlackjackSoundVolume(volume, entry.gain);
  if (safeVolume <= 0) return null;

  const template = getBlackjackSoundTemplate(entry.src);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  blackjackSoundGains.set(audio, entry.gain);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}
