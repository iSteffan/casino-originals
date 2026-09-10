import type {
  MinesCellAssets,
  MinesCellContent,
  MinesCellGridSize,
} from './mines-cell.types';

export function getMinesCellLogoClassName(gridSize: MinesCellGridSize): string {
  // Percent of cell width — matches the recessed mark in tile.png and legacy
  // fixed px logos at the 597px board (~28–30% of each cell).
  switch (gridSize) {
    case 4:
      return 'w-[29%]';
    case 5:
      return 'w-[30%]';
    case 6:
      return 'w-[28%]';
    case 8:
      return 'w-[29%]';
  }
}

export function getMinesCellOuterRadiusClassName(gridSize: MinesCellGridSize): string {
  switch (gridSize) {
    case 4:
    case 5:
      return 'rounded-ds-2px lg:rounded-ds-2xs';
    case 6:
      return 'rounded-ds-2px lg:rounded-ds-5px';
    case 8:
      return 'rounded-ds-2px lg:rounded-ds-3xs';
  }
}

export function getMinesCellRevealedFaceSrc({
  assets,
  content,
  revealStyle,
}: {
  assets: MinesCellAssets;
  content: MinesCellContent;
  revealStyle: 'player' | 'board';
}): string {
  if (content === 'mine') {
    return revealStyle === 'player' ? assets.lose : assets.loseTile;
  }

  return revealStyle === 'player' ? assets.win : assets.winTile;
}
