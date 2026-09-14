'use client';

import type { TowersConfigProps } from './towers-config.types';

import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';
import { TowersDifficulty } from '#ui/features/games/originals/towers/towers-difficulty/towers-difficulty';

export function TowersConfig(props: TowersConfigProps) {
  const { shell, betAmount, rounds, stopConditions, fieldsDisabled = false } = props;
  const { clearSelection, random } = props.actions;
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
        value={props.difficulty.value}
        onChange={props.difficulty.onChange}
        options={props.difficulty.options}
        labels={props.difficulty.labels}
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
