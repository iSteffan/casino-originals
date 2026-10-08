/** Betstrike `use-plinko-session` SOUNDS: drop on accepted bet, land on bucket hit. */
const PLINKO_SOUNDS = {
  drop: { src: '/sounds/games/plinko/drop.mp3', gain: 0.1 },
  land: { src: '/sounds/games/plinko/land.mp3', gain: 0.1 },
} as const;

export type PlinkoSoundName = keyof typeof PLINKO_SOUNDS;

const plinkoSoundTemplates = new Map<string, HTMLAudioElement>();
const plinkoSoundGains = new WeakMap<HTMLAudioElement, number>();

function getPlinkoSoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = plinkoSoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  plinkoSoundTemplates.set(src, template);
  return template;
}

export function preloadPlinkoSounds(): void {
  Object.values(PLINKO_SOUNDS).forEach((entry) => {
    getPlinkoSoundTemplate(entry.src);
  });
}

function getSafePlinkoMasterVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

export function setPlinkoSoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const master = getSafePlinkoMasterVolume(volume);
  for (const sound of sounds) {
    const gain = plinkoSoundGains.get(sound) ?? 1;
    sound.volume = master * gain;
  }
}

export function stopPlinkoSounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playPlinkoSound(
  name: PlinkoSoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const entry = PLINKO_SOUNDS[name];
  const safeVolume = getSafePlinkoMasterVolume(volume) * entry.gain;
  if (safeVolume <= 0) return null;

  const template = getPlinkoSoundTemplate(entry.src);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  plinkoSoundGains.set(audio, entry.gain);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}
