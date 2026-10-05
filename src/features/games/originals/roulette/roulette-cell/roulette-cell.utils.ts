import type { RouletteCellColor } from '../roulette.constants';
import type {
  RouletteCellAssets,
  RouletteCellSize,
  RouletteCellTileAssets,
} from './roulette-cell.types';

export function getRouletteCellTileAssets(
  assets: RouletteCellAssets,
  color: RouletteCellColor,
  size: RouletteCellSize,
): RouletteCellTileAssets {
  if (color === 'green') return assets.green;
  if (color === 'red') {
    return size === 'md' ? assets.redMd : assets.redSm;
  }
  if (size === 'lg') return assets.blackLg;
  if (size === 'md') return assets.blackMd;
  return assets.blackSm;
}
