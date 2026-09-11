'use client';

import type { KenoConfigProps } from './keno-config.types';

import { KenoRisk } from '#ui/features/games/originals/keno/keno-risk/keno-risk';
import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';
import { Button } from '#ui/primitives/actions/button/button';

export function KenoConfig({
  shell,
  betAmount,
  rounds,
  stopConditions,
  fieldsDisabled = false,
  risk,
  actions,
}: KenoConfigProps) {
  const { autoPick, clearTable } = actions;

  return (
    <OriginalsGameConfig
      shell={shell}
      betAmount={betAmount}
      rounds={rounds}
      stopConditions={stopConditions}
      fieldsDisabled={fieldsDisabled}
      actionPrefix={
        <div className="gap-ds-2 grid w-full grid-cols-2">
          <Button
            type="button"
            variant="gray"
            size="md"
            className="ds-originals-config-action rounded-ds-2xs"
            disabled={fieldsDisabled || autoPick.disabled}
            onClick={autoPick.onClick}
          >
            {autoPick.label}
          </Button>
          <Button
            type="button"
            variant="gray"
            size="md"
            className="ds-originals-config-action rounded-ds-2xs"
            disabled={fieldsDisabled || clearTable.disabled}
            onClick={clearTable.onClick}
          >
            {clearTable.label}
          </Button>
        </div>
      }
    >
      <KenoRisk
        value={risk.value}
        onChange={risk.onChange}
        options={risk.options}
        labels={risk.labels}
        disabled={fieldsDisabled}
      />
    </OriginalsGameConfig>
  );
}

export type {
  KenoConfigActionsProps,
  KenoConfigAutobetSessionProps,
  KenoConfigProps,
  KenoConfigRiskProps,
  KenoConfigStopConditionsProps,
  KenoRiskLabels,
  KenoRiskOption,
} from './keno-config.types';
export {
  getConfiguredMaxRounds,
  type OriginalsAutobetAction,
  resolveOriginalsAutobetAction,
  type ResolveOriginalsAutobetActionOptions,
} from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
