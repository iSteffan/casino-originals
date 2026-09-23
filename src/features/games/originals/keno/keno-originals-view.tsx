'use client';

import { KenoBoard } from '#ui/features/games/originals/keno/keno-board/keno-board';
import type { KenoBoardProps } from '#ui/features/games/originals/keno/keno-board/keno-board.types';
import { KenoConfig } from '#ui/features/games/originals/keno/keno-config/keno-config';
import type { KenoConfigProps } from '#ui/features/games/originals/keno/keno-config/keno-config.types';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import {
  GameWinModal,
  type GameWinModalProps,
} from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface KenoOriginalsViewProps {
  config: KenoConfigProps;
  board: KenoBoardProps;
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

export function KenoOriginalsView({
  config,
  board,
  winOverlay,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: KenoOriginalsViewProps) {
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
              <KenoConfig
                shell={config.shell}
                betAmount={config.betAmount}
                rounds={config.rounds}
                stopConditions={config.stopConditions}
                fieldsDisabled={config.fieldsDisabled}
                risk={config.risk}
                actions={config.actions}
              />
            }
            board={
              <KenoBoard
                cells={board.cells}
                assets={board.assets}
                theatreMode={board.theatreMode}
                reducedMotion={board.reducedMotion}
                disabled={board.disabled}
                gridAriaLabel={board.gridAriaLabel}
                getCellAriaLabel={board.getCellAriaLabel}
                paytable={board.paytable}
                resultAnnouncement={board.resultAnnouncement}
                onCellClick={board.onCellClick}
                overlay={
                  <GameWinModal
                    open={winOverlay.open}
                    title={winOverlay.title}
                    multiplierLabel={winOverlay.multiplierLabel}
                    multiplier={winOverlay.multiplier}
                    formattedWinAmount={winOverlay.formattedWinAmount}
                    currencyIcon={winOverlay.currencyIcon}
                    volume={winOverlay.volume}
                  />
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
