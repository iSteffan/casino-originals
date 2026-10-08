'use client';

import type { PlinkoConfigProps } from './plinko-config.types';

import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';
import { PlinkoRisk } from '#ui/features/games/originals/plinko/plinko-risk/plinko-risk';
import { PlinkoRows } from '#ui/features/games/originals/plinko/plinko-rows/plinko-rows';
import { TurboMode } from '#ui/features/games/originals/shared/turbo-mode/turbo-mode';

export function PlinkoConfig({
  shell,
  betAmount,
  rounds,
  fieldsDisabled = false,
  risk,
  rows,
  turboMode,
}: PlinkoConfigProps) {
  return (
    <OriginalsGameConfig
      shell={shell}
      betAmount={betAmount}
      rounds={rounds}
      fieldsDisabled={fieldsDisabled}
    >
      <PlinkoRisk
        value={risk.value}
        onChange={risk.onChange}
        options={risk.options}
        labels={risk.labels}
        disabled={fieldsDisabled}
      />

      <PlinkoRows
        value={rows.value}
        onChange={rows.onChange}
        options={rows.options}
        labels={rows.labels}
        disabled={fieldsDisabled}
      />

      <TurboMode
        label={turboMode.label}
        checked={turboMode.checked}
        onCheckedChange={turboMode.onCheckedChange}
        disabled={fieldsDisabled}
      />
    </OriginalsGameConfig>
  );
}

export type {
  PlinkoConfigProps,
  PlinkoConfigRiskProps,
  PlinkoConfigRowsProps,
  PlinkoConfigTurboModeProps,
  PlinkoRiskLabels,
  PlinkoRiskOption,
  PlinkoRowsLabels,
  PlinkoRowsOption,
} from './plinko-config.types';
export {
  getConfiguredMaxRounds,
  type OriginalsAutobetAction,
  resolveOriginalsAutobetAction,
  type ResolveOriginalsAutobetActionOptions,
} from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
