/**
 * Betstrike legacy Double sounds (`lib/sounds.ts`): start when the roll begins,
 * scroll ticks while the strip moves, win when the round pays the player.
 */
const DOUBLE_SOUNDS = {
  start: { src: '/sounds/games/double/start.wav', gain: 1 },
  scroll: { src: '/sounds/games/double/scroll.wav', gain: 1 },
  win: { src: '/sounds/games/double/win.wav', gain: 1 },
} as const;

export type DoubleSoundName = keyof typeof DOUBLE_SOUNDS;

const doubleSoundTemplates = new Map<string, HTMLAudioElement>();
const doubleSoundGains = new WeakMap<HTMLAudioElement, number>();

function getDoubleSoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = doubleSoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  doubleSoundTemplates.set(src, template);
  return template;
}

export function preloadDoubleSounds(): void {
  Object.values(DOUBLE_SOUNDS).forEach((entry) => {
    getDoubleSoundTemplate(entry.src);
  });
}

function getSafeDoubleMasterVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

export function setDoubleSoundsVolume(sounds: Iterable<HTMLAudioElement>, volume: number): void {
  const master = getSafeDoubleMasterVolume(volume);
  for (const sound of sounds) {
    const gain = doubleSoundGains.get(sound) ?? 1;
    sound.volume = master * gain;
  }
}

export function stopDoubleSounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playDoubleSound(
  name: DoubleSoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const entry = DOUBLE_SOUNDS[name];
  const safeVolume = getSafeDoubleMasterVolume(volume) * entry.gain;
  if (safeVolume <= 0) return null;

  const template = getDoubleSoundTemplate(entry.src);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  doubleSoundGains.set(audio, entry.gain);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}

/**
 * Legacy `playScrollSoundEffect` timeline: ticks speed up (150 ms -> 30 ms) until 2 s,
 * hold 100 ms until 5 s, then slow down (+20.5 ms per tick) until `totalDuration`.
 * Returns a cancel function.
 */
export function scheduleDoubleScrollSounds(
  playTick: () => void,
  { totalDuration = 9_700, transitionStart = 2_000, transitionEnd = 5_000 } = {},
): () => void {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const at = (time: number) => timeouts.push(setTimeout(playTick, time));

  let time = 0;
  let interval = 150;
  while (time + interval < transitionStart) {
    at(time);
    time += interval;
    interval = Math.max(30, interval - 4);
  }

  time = transitionStart;
  while (time < transitionEnd) {
    at(time);
    time += 100;
  }

  interval = 150;
  time = transitionEnd;
  while (time < totalDuration) {
    at(time);
    time += interval;
    interval += 20.5;
  }

  return () => {
    timeouts.forEach(clearTimeout);
  };
}
