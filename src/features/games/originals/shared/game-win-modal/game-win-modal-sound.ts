const GAME_WIN_MODAL_SOUND = {
  src: '/sounds/games/shared/win.wav',
  gain: 0.1,
} as const;

let gameWinModalSoundTemplate: HTMLAudioElement | null = null;

function getGameWinModalSoundTemplate(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (gameWinModalSoundTemplate) return gameWinModalSoundTemplate;

  const template = new Audio(GAME_WIN_MODAL_SOUND.src);
  template.preload = 'auto';
  gameWinModalSoundTemplate = template;
  return template;
}

export function preloadGameWinModalSound(): void {
  getGameWinModalSoundTemplate();
}

function getSafeVolume(volume: number): number {
  const master = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
  return master * GAME_WIN_MODAL_SOUND.gain;
}

export function playGameWinModalSound(volume = 1): HTMLAudioElement | null {
  const safeVolume = getSafeVolume(volume);
  if (safeVolume <= 0) return null;

  const template = getGameWinModalSoundTemplate();
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  audio.volume = safeVolume;
  void audio.play().catch(() => undefined);
  return audio;
}
