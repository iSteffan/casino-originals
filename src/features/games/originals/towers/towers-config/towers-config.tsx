'use client';

import type { TowersConfigProps } from './towers-config.types';

import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';
import { TowersDifficulty } from '#ui/features/games/originals/towers/towers-difficulty/towers-difficulty';

export function TowersConfig({
  shell,
  betAmount,
  rounds,
  stopConditions,
  fieldsDisabled = false,
  actions,
  difficulty,
}: TowersConfigProps) {
  const { clearSelection, random } = actions;
  const shellWithGameActions = {
    ...shell,
    autoSecondaryActionLabel: clearSelection.label,
    onAutoSecondaryAction: clearSelection.onClick,
    autoSecondaryActionDisabled: clearSelection.disabled,
    manualSecondaryActionLabel: random.label,
    onManualSecondaryAction: random.onClick,
    manualSecondaryActionVisible: random.visible,
    manualSecondaryActionDisabled: random.disabled,
  };

  return (
    <OriginalsGameConfig
      shell={shellWithGameActions}
      betAmount={betAmount}
      rounds={rounds}
      stopConditions={stopConditions}
      fieldsDisabled={fieldsDisabled}
    >
      <TowersDifficulty
        value={difficulty.value}
        onChange={difficulty.onChange}
        options={difficulty.options}
        labels={difficulty.labels}
        disabled={fieldsDisabled}
      />
    </OriginalsGameConfig>
  );
}

export type {
  TowersConfigAutobetSessionProps,
  TowersConfigDifficultyProps,
  TowersConfigProps,
  TowersConfigStopConditionsProps,
  TowersDifficultyLabels,
  TowersDifficultyOption,
} from './towers-config.types';
export {
  getConfiguredMaxRounds,
  type OriginalsAutobetAction,
  resolveOriginalsAutobetAction,
  type ResolveOriginalsAutobetActionOptions,
} from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
