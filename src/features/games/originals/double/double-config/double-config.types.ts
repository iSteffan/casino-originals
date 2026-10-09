import type { DoubleBetTypeOption } from '#ui/features/games/originals/double/double-bet-type-selector/double-bet-type-selector.types';
import type { DoubleBetType } from '#ui/features/games/originals/double/double.types';
import type {
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';

export interface DoubleConfigBetTypesProps {
  value: readonly DoubleBetType[];
  onToggle: (type: DoubleBetType) => void;
  options: readonly DoubleBetTypeOption[];
  label?: string;
}

export interface DoubleConfigProps {
  shell: OriginalsGameConfigShellProps & { manualActionLabel: string };
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  /** Legacy disables the whole form outside BETTING and while autobet runs. */
  fieldsDisabled?: boolean;
  betTypes: DoubleConfigBetTypesProps;
}
