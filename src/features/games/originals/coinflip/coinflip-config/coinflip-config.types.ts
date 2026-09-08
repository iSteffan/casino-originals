import type {
  CoinflipSelectSideLabels,
  CoinflipSelectSideOption,
  CoinflipSide,
} from '#ui/features/games/originals/coinflip/coinflip-select-side/coinflip-select-side.types';
import type {
  OriginalsGameConfigAutobetSessionProps,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
  OriginalsGameConfigStopConditionsProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';

export type CoinflipConfigStopConditionsProps = OriginalsGameConfigStopConditionsProps;
export type CoinflipConfigAutobetSessionProps = OriginalsGameConfigAutobetSessionProps;

export interface CoinflipConfigSelectSideProps {
  value: CoinflipSide;
  onChange: (value: CoinflipSide) => void;
  options: readonly [CoinflipSelectSideOption, CoinflipSelectSideOption];
  labels: CoinflipSelectSideLabels;
}

export interface CoinflipConfigTurboModeProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

/** Explicit controlled configuration for the Coinflip config panel. */
export interface CoinflipConfigProps {
  shell: OriginalsGameConfigShellProps;
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  fieldsDisabled?: boolean;
  selectSide: CoinflipConfigSelectSideProps;
  turboMode: CoinflipConfigTurboModeProps;
}
