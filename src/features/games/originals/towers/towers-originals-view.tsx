'use client';

import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import {
  GameWinModal,
  type GameWinModalProps,
} from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { TowersConfig } from '#ui/features/games/originals/towers/towers-config/towers-config';
import type { TowersConfigProps } from '#ui/features/games/originals/towers/towers-config/towers-config.types';
import { TowersGrid } from '#ui/features/games/originals/towers/towers-grid/towers-grid';
import type { TowersGridProps } from '#ui/features/games/originals/towers/towers-grid/towers-grid.types';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface TowersOriginalsViewProps {
  config: TowersConfigProps;
  board: TowersGridProps;
  winOverlay: GameWinModalProps;
  header: {
    title: string;
    volume: number;
    isTheatreMode: boolean;
    onVolumeChange: (volume: number) => void;
    onTheatreToggle: () => void;
    onBackClick: () => void;
  };
  theatreMode: boolean;
  theatreModeActive: boolean;
  theatreLayoutActive: boolean;
  theatreSync: {
    theatreMode: boolean;
    onExitTheatre: () => void;
  };
}

export function TowersOriginalsView({
  config,
  board,
  winOverlay,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: TowersOriginalsViewProps) {
  return (
    <div
      className={cn(
        'bg-ds-black px-ds-4 py-ds-2 md:px-ds-8 md:py-ds-4 w-full',
        theatreLayoutActive
          ? 'h-full min-h-0 overflow-hidden'
          : 'min-h-0 flex-1',
      )}
    >
      <TheatreModeSync
        theatreMode={theatreSync.theatreMode}
        onExitTheatre={theatreSync.onExitTheatre}
      />
      <div
        className={cn(
          'relative flex w-full min-w-0 flex-col',
          theatreLayoutActive && 'h-full min-h-0',
        )}
      >
        <div
          className={cn(
            'mx-auto flex w-full min-w-0 flex-col transition-[max-width] duration-ds-slow ease-ds-standard',
            theatreLayoutActive && 'h-full min-h-0 flex-1',
            theatreModeActive || theatreLayoutActive
              ? 'max-w-[1750px]'
              : 'max-w-[1400px]',
          )}
        >
          <GameHeader
            title={header.title}
            onBackClick={header.onBackClick}
            showVolumeControl
            volume={header.volume}
            onVolumeChange={header.onVolumeChange}
            isTheatreMode={header.isTheatreMode}
            onTheatreToggle={header.onTheatreToggle}
            className="pr-[4.5rem]"
            actionsClassName="absolute top-0 right-0 z-10 md:min-h-ds-14"
          />
          <OriginalsGameShell
            theatreMode={theatreMode}
            config={
              <TowersConfig
                shell={config.shell}
                betAmount={config.betAmount}
                rounds={config.rounds}
                stopConditions={config.stopConditions}
                fieldsDisabled={config.fieldsDisabled}
                difficulty={config.difficulty}
                actions={config.actions}
              />
            }
            board={
              <div
                className={cn(
                  'bg-ds-black rounded-ds-sm relative flex min-h-0 w-full flex-1 flex-col',
                  theatreMode && 'h-full',
                )}
              >
                <TowersGrid
                  rows={board.rows}
                  assets={board.assets}
                  mobileAssets={board.mobileAssets}
                  theatreMode={board.theatreMode}
                  reducedMotion={board.reducedMotion}
                  className="min-h-0 flex-1"
                  aria-label={board['aria-label']}
                  resultAnnouncement={board.resultAnnouncement}
                  onCellClick={board.onCellClick}
                />
                <GameWinModal
                  open={winOverlay.open}
                  title={winOverlay.title}
                  multiplierLabel={winOverlay.multiplierLabel}
                  multiplier={winOverlay.multiplier}
                  formattedWinAmount={winOverlay.formattedWinAmount}
                  currencyIcon={winOverlay.currencyIcon}
                  volume={winOverlay.volume}
                />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
