const ROULETTE_SOUNDS = {
  ballSpin: { src: '/sounds/games/roulette/ball_spin.wav', gain: 0.28 },
} as const;

export type RouletteSoundName = keyof typeof ROULETTE_SOUNDS;

const rouletteSoundTemplates = new Map<string, HTMLAudioElement>();
const rouletteSoundGains = new WeakMap<HTMLAudioElement, number>();

function getRouletteSoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = rouletteSoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  rouletteSoundTemplates.set(src, template);
  return template;
}

export function preloadRouletteSounds(): void {
  Object.values(ROULETTE_SOUNDS).forEach((entry) => {
    getRouletteSoundTemplate(entry.src);
  });
}

function getSafeRouletteMasterVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

function getSafeRouletteSoundVolume(volume: number, gain: number): number {
  const safeGain = Number.isFinite(gain) ? Math.min(1, Math.max(0, gain)) : 1;
  return getSafeRouletteMasterVolume(volume) * safeGain;
}

export function setRouletteSoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const master = getSafeRouletteMasterVolume(volume);
  for (const sound of sounds) {
    const gain = rouletteSoundGains.get(sound) ?? 1;
    sound.volume = master * gain;
  }
}

export function stopRouletteSounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playRouletteSound(
  name: RouletteSoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const entry = ROULETTE_SOUNDS[name];
  const safeVolume = getSafeRouletteSoundVolume(volume, entry.gain);
  if (safeVolume <= 0) return null;

  const template = getRouletteSoundTemplate(entry.src);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  rouletteSoundGains.set(audio, entry.gain);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}
