import type { ReactNode } from 'react';

import type { OriginalsGameConfigShellProps } from '#ui/features/games/originals/originals-config/originals-game-config.types';

export interface RouletteConfigChipOption {
  value: number;
  label?: string;
  src?: string;
}

export interface RouletteConfigLabels {
  chips: string;
  undo: string;
  clear: string;
  rounds: string;
  total?: string;
}

export interface RouletteConfigProps {
  shell: OriginalsGameConfigShellProps;
  chips: readonly RouletteConfigChipOption[];
  selectedChip: number;
  onSelectChip: (amount: number) => void;
  onUndo: () => void;
  onClear: () => void;
  fieldsDisabled?: boolean;
  totalLabel: string;
  rounds: string;
  onRoundsChange: (rounds: string) => void;
  undoIcon?: ReactNode;
  clearIcon?: ReactNode;
  labels?: Partial<RouletteConfigLabels>;
  className?: string;
}
