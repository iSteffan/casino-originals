'use client';

import type { DoubleConfigProps } from './double-config.types';

import { DoubleBetTypeSelector } from '#ui/features/games/originals/double/double-bet-type-selector/double-bet-type-selector';
import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';

/** Shared originals config (bet amount, manual/auto, rounds) plus the Double "Your bet" grid. */
export function DoubleConfig({
  shell,
  betAmount,
  rounds,
  fieldsDisabled = false,
  betTypes,
}: DoubleConfigProps) {
  return (
    <OriginalsGameConfig
      shell={shell}
      betAmount={betAmount}
      rounds={rounds}
      fieldsDisabled={fieldsDisabled}
    >
      <DoubleBetTypeSelector
        value={betTypes.value}
        onToggle={betTypes.onToggle}
        options={betTypes.options}
        label={betTypes.label}
        disabled={fieldsDisabled}
      />
    </OriginalsGameConfig>
  );
}

export type { DoubleConfigBetTypesProps, DoubleConfigProps } from './double-config.types';
