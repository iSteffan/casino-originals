import type {
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';
import type {
  PlinkoRiskLabels,
  PlinkoRiskOption,
} from '#ui/features/games/originals/plinko/plinko-risk/plinko-risk';
import type {
  PlinkoRowsLabels,
  PlinkoRowsOption,
} from '#ui/features/games/originals/plinko/plinko-rows/plinko-rows';

export interface PlinkoConfigRiskProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly PlinkoRiskOption[];
  labels: PlinkoRiskLabels;
}

export interface PlinkoConfigRowsProps {
  value: number;
  onChange: (value: number) => void;
  options: readonly PlinkoRowsOption[];
  labels: PlinkoRowsLabels;
}

export interface PlinkoConfigTurboModeProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

export interface PlinkoConfigProps {
  shell: OriginalsGameConfigShellProps & { manualActionLabel: string };
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  fieldsDisabled?: boolean;
  risk: PlinkoConfigRiskProps;
  rows: PlinkoConfigRowsProps;
  turboMode: PlinkoConfigTurboModeProps;
}

export type {
  PlinkoRiskLabels,
  PlinkoRiskOption,
} from '#ui/features/games/originals/plinko/plinko-risk/plinko-risk';
export type {
  PlinkoRowsLabels,
  PlinkoRowsOption,
} from '#ui/features/games/originals/plinko/plinko-rows/plinko-rows';
