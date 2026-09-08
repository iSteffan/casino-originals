'use client';

import type { CoinflipConfigProps } from './coinflip-config.types';

import { CoinflipSelectSide } from '#ui/features/games/originals/coinflip/coinflip-select-side/coinflip-select-side';
import { OriginalsGameConfig } from '#ui/features/games/originals/originals-config/originals-game-config';
import { TurboMode } from '#ui/features/games/originals/shared/turbo-mode/turbo-mode';

export function CoinflipConfig({
  shell,
  betAmount,
  rounds,
  stopConditions,
  selectSide,
  turboMode,
  fieldsDisabled = false,
}: CoinflipConfigProps) {
  return (
    <OriginalsGameConfig
      shell={shell}
      betAmount={betAmount}
      rounds={rounds}
      stopConditions={stopConditions}
      fieldsDisabled={fieldsDisabled}
    >
      <CoinflipSelectSide
        value={selectSide.value}
        onChange={selectSide.onChange}
        options={selectSide.options}
        labels={selectSide.labels}
        disabled={fieldsDisabled}
      />

      <TurboMode
        checked={turboMode.checked}
        onCheckedChange={turboMode.onCheckedChange}
        label={turboMode.label}
        disabled={fieldsDisabled}
      />
    </OriginalsGameConfig>
  );
}

export type {
  CoinflipConfigAutobetSessionProps,
  CoinflipConfigProps,
  CoinflipConfigSelectSideProps,
  CoinflipConfigStopConditionsProps,
  CoinflipConfigTurboModeProps,
} from './coinflip-config.types';
