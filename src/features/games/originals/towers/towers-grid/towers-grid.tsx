'use client';

import { type CSSProperties, useEffect } from 'react';

import type {
  TowersGridMultiplier,
  TowersGridProps,
  TowersGridRow,
} from './towers-grid.types';

import { TowersCell } from '#ui/features/games/originals/towers/towers-cell/towers-cell';
import type { TowersCellAssets } from '#ui/features/games/originals/towers/towers-cell/towers-cell.types';
import { TOWERS_DESKTOP_ART_MEDIA_QUERY } from '#ui/features/games/originals/towers/towers-cell/towers-cell.utils';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const MULTIPLIER_HIGHLIGHT_CLASS: Record<TowersGridMultiplier['highlight'], string> = {
  active: 'ds-towers-multiplier-active',
  passed: 'ds-towers-multiplier-passed',
  upcoming: 'ds-towers-multiplier-upcoming',
};

function getTowersCellAssetKey(assets?: TowersCellAssets): string {
  return assets ? [...new Set(Object.values(assets))].join('\n') : '';
}

function preloadTowersCellAssets(key: string): void {
  if (!key) return;

  for (const src of key.split('\n')) {
    const image = new window.Image();
    image.decoding = 'async';
    image.src = src;
    if (typeof image.decode === 'function') void image.decode().catch(() => undefined);
  }
}

function TowersMultiplierBadge({
  label,
  highlight,
  reducedMotion,
}: TowersGridMultiplier & { reducedMotion: boolean }) {
  return (
    <div
      className={cn('ds-towers-multiplier', MULTIPLIER_HIGHLIGHT_CLASS[highlight])}
      style={reducedMotion ? { transition: 'none' } : undefined}
    >
      <Typography as="p" kind="inherit-10-700" className="m-0">
        {label}
      </Typography>
    </div>
  );
}

function TowersGridRowComponent({
  row,
  rowIndex,
  assets,
  mobileAssets,
  reducedMotion,
  onCellClick,
}: {
  row: TowersGridRow;
  rowIndex: number;
  assets: TowersGridProps['assets'];
  mobileAssets?: TowersGridProps['mobileAssets'];
  reducedMotion: boolean;
  onCellClick?: (rowIndex: number, colIndex: number) => void;
}) {
  return (
    <div className="ds-towers-grid-row">
      <TowersMultiplierBadge
        label={row.multiplier.label}
        highlight={row.multiplier.highlight}
        reducedMotion={reducedMotion}
      />
      <div className="ds-towers-grid-cells">
        {row.cells.map((cell, colIndex) => (
          <TowersCell
            key={colIndex}
            state={cell.state}
            assets={assets}
            mobileAssets={mobileAssets}
            amountLabel={cell.amountLabel}
            potentialWin={cell.potentialWin}
            disabled={cell.disabled}
            reducedMotion={reducedMotion}
            onClick={
              onCellClick
                ? () => {
                    onCellClick(rowIndex, colIndex);
                  }
                : undefined
            }
            aria-label={cell['aria-label']}
          />
        ))}
      </div>
    </div>
  );
}

export function TowersGrid({
  rows,
  assets,
  mobileAssets,
  theatreMode = false,
  reducedMotion = false,
  onCellClick,
  className,
  'aria-label': ariaLabel,
  resultAnnouncement,
}: TowersGridProps) {
  const cols = rows[0]?.cells.length ?? 0;
  const rowCount = rows.length;
  const desktopAssetKey = getTowersCellAssetKey(assets);
  const mobileAssetKey = getTowersCellAssetKey(mobileAssets);

  useEffect(() => {
    if (!mobileAssetKey || typeof window.matchMedia !== 'function') {
      preloadTowersCellAssets(desktopAssetKey);
      return undefined;
    }

    const desktopQuery = window.matchMedia(TOWERS_DESKTOP_ART_MEDIA_QUERY);
    const preloadCurrentAssets = () => {
      preloadTowersCellAssets(desktopQuery.matches ? desktopAssetKey : mobileAssetKey);
    };

    preloadCurrentAssets();
    desktopQuery.addEventListener('change', preloadCurrentAssets);

    return () => desktopQuery.removeEventListener('change', preloadCurrentAssets);
  }, [desktopAssetKey, mobileAssetKey]);

  return (
    <div
      className={cn(
        'ds-towers-grid relative mx-auto flex h-full min-h-0 w-full items-center justify-center',
        theatreMode ? 'ds-towers-grid-theatre' : 'min-h-[280px]',
        className,
      )}
      role={ariaLabel ? 'group' : undefined}
      aria-label={ariaLabel}
      style={
        {
          '--towers-cols': cols,
          '--towers-rows': rowCount,
        } as CSSProperties
      }
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </span>
      <div className="ds-towers-grid-viewport">
        <div className="ds-towers-grid-stack">
          {rows.map((row, rowIndex) => (
            <TowersGridRowComponent
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              assets={assets}
              mobileAssets={mobileAssets}
              reducedMotion={reducedMotion}
              onCellClick={onCellClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export type {
  TowersGridCell,
  TowersGridMultiplier,
  TowersGridProps,
  TowersGridRow,
  TowersMultiplierHighlight,
  TowersResultAnnouncement,
} from './towers-grid.types';
