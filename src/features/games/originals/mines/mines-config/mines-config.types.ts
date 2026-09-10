import type { MinesGridSizeValue } from './mines-config.utils';

import type { MinesSliderAssets } from '#ui/features/games/originals/mines/mines-slider/mines-slider';
import type {
  OriginalsGameConfigAutobetSessionProps,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
  OriginalsGameConfigStopConditionsProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';

export type MinesConfigStopConditionsProps = OriginalsGameConfigStopConditionsProps;
export type MinesConfigAutobetSessionProps = OriginalsGameConfigAutobetSessionProps;

export interface MinesConfigProps {
  shell: OriginalsGameConfigShellProps;
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  fieldsDisabled?: boolean;
  board: {
    gridSize: MinesGridSizeValue;
    onGridSizeChange: (value: MinesGridSizeValue) => void;
    gridSizeLabel: string;
    numberOfMines: number;
    minNumberOfMines: number;
    maxNumberOfMines: number;
    totalCells: number;
    onNumberOfMinesChange: (value: number) => void;
    minesSliderLabel: string;
    sliderAssets: MinesSliderAssets;
  };
  clearSelection: { label: string; onClick: () => void; disabled?: boolean };
}
