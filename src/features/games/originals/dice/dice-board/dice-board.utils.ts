import type { DiceCubeMarkerState } from '#ui/features/games/originals/dice/dice-cube/dice-cube.types';

export function getDiceBoardRolledNumberFlowStyles(state: DiceCubeMarkerState): {
  backgroundGradient: string;
  strokeColor: string;
} {
  switch (state) {
    case 'win':
      return {
        backgroundGradient:
          'linear-gradient(180deg, var(--ds-lime-300) 0%, var(--ds-lime-600) 50%, var(--ds-lime-300) 100%)',
        strokeColor: 'var(--ds-lime-400)',
      };
    case 'lose':
      return {
        backgroundGradient:
          'linear-gradient(180deg, var(--ds-error-500) 0%, var(--ds-error-800) 50%, var(--ds-error-500) 100%)',
        strokeColor: 'var(--ds-error-500)',
      };
    default:
      return {
        backgroundGradient:
          'linear-gradient(180deg, var(--ds-white) 0%, var(--ds-gray-550) 50%, var(--ds-white) 100%)',
        strokeColor: 'var(--ds-button-gray-foreground)',
      };
  }
}
