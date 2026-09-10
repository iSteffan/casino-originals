'use client';

import { useId } from 'react';

import type { MinesConfigProps } from './mines-config.types';

import { MinesGridSize } from '#ui/features/games/originals/mines/mines-grid-size/mines-grid-size';
import { MinesSlider } from '#ui/features/games/originals/mines/mines-slider/mines-slider';
import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';
import { Label } from '#ui/primitives/inputs/label/label';

export function MinesConfig({
  shell,
  betAmount,
  rounds,
  stopConditions,
  fieldsDisabled = false,
  board,
  clearSelection,
}: MinesConfigProps) {
  const {
    gridSize,
    onGridSizeChange,
    gridSizeLabel,
    numberOfMines,
    minNumberOfMines,
    maxNumberOfMines,
    totalCells,
    onNumberOfMinesChange,
    minesSliderLabel,
    sliderAssets,
  } = board;
  const minesSliderLabelId = useId();

  const shellWithClearSelection = {
    ...shell,
    autoSecondaryActionLabel: clearSelection.label,
    onAutoSecondaryAction: clearSelection.onClick,
    autoSecondaryActionDisabled: clearSelection.disabled,
  };

  return (
    <OriginalsGameConfig
      shell={shellWithClearSelection}
      betAmount={betAmount}
      rounds={rounds}
      stopConditions={stopConditions}
      fieldsDisabled={fieldsDisabled}
    >
      <div className="flex w-full shrink-0 flex-col">
        <Label id={minesSliderLabelId} className="mb-ds-1 min-w-0">
          {minesSliderLabel}
        </Label>
        <MinesSlider
          assets={sliderAssets}
          min={minNumberOfMines}
          max={maxNumberOfMines}
          totalCells={totalCells}
          value={[numberOfMines]}
          onValueChange={(values) => onNumberOfMinesChange(values[0] ?? numberOfMines)}
          aria-labelledby={minesSliderLabelId}
          disabled={fieldsDisabled}
        />
      </div>

      <MinesGridSize
        label={gridSizeLabel}
        value={gridSize}
        onChange={(value) => onGridSizeChange(value as typeof gridSize)}
        disabled={fieldsDisabled}
      />
    </OriginalsGameConfig>
  );
}

export type {
  MinesConfigAutobetSessionProps,
  MinesConfigProps,
  MinesConfigStopConditionsProps,
} from './mines-config.types';
export { MINES_GRID_SIZE_OPTIONS, type MinesGridSizeValue } from './mines-config.utils';
export {
  getConfiguredMaxRounds,
  type OriginalsAutobetAction,
  resolveOriginalsAutobetAction,
  type ResolveOriginalsAutobetActionOptions,
} from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
