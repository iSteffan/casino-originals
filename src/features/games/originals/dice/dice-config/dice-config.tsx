'use client';

import type { DiceConfigProps } from './dice-config.types';

import { DiceControls } from '#ui/features/games/originals/dice/dice-controls/dice-controls';
import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';

export function DiceConfig({
  shell,
  betAmount,
  rounds,
  stopConditions,
  diceControls,
  fieldsDisabled = false,
}: DiceConfigProps) {
  return (
    <OriginalsGameConfig
      shell={shell}
      betAmount={betAmount}
      rounds={rounds}
      stopConditions={stopConditions}
      fieldsDisabled={fieldsDisabled}
    >
      <DiceControls
        direction={diceControls.direction}
        onDirectionToggle={diceControls.onDirectionToggle}
        displayValue={diceControls.displayValue}
        winChance={diceControls.winChance}
        multiplier={diceControls.multiplier}
        onDisplayValueChange={diceControls.onDisplayValueChange}
        onWinChanceChange={diceControls.onWinChanceChange}
        onMultiplierChange={diceControls.onMultiplierChange}
        activeField={diceControls.activeField}
        onActiveFieldChange={diceControls.onActiveFieldChange}
        disabled={fieldsDisabled}
        labels={diceControls.labels}
      />
    </OriginalsGameConfig>
  );
}

export type {
  DiceConfigAutobetSessionProps,
  DiceConfigControlsProps,
  DiceConfigProps,
  DiceConfigStopConditionsProps,
  DiceControlsActiveField,
  DiceControlsDirection,
  DiceControlsLabels,
  DiceDirection,
} from './dice-config.types';
export {
  getConfiguredMaxRounds,
  type OriginalsAutobetAction,
  resolveOriginalsAutobetAction,
  type ResolveOriginalsAutobetActionOptions,
} from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
