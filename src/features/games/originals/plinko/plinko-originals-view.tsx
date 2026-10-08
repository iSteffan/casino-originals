'use client';

import { PlinkoBoard } from './plinko-board/plinko-board';
import type { PlinkoBoardProps } from './plinko-board/plinko-board.types';
import { PlinkoConfig } from './plinko-config/plinko-config';
import type { PlinkoConfigProps } from './plinko-config/plinko-config.types';

import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import {
  GameWinModal,
  type GameWinModalProps,
} from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface PlinkoOriginalsViewProps {
  config: PlinkoConfigProps;
  board: PlinkoBoardProps;
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

export function PlinkoOriginalsView({
  config,
  board,
  winOverlay,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: PlinkoOriginalsViewProps) {
  return (
    <div
      className={cn(
        'bg-ds-black px-ds-4 py-ds-2 md:px-ds-8 md:py-ds-4 w-full',
        theatreLayoutActive ? 'h-full min-h-0 overflow-hidden' : 'min-h-0 flex-1',
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
            theatreModeActive || theatreLayoutActive ? 'max-w-[1750px]' : 'max-w-[1400px]',
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
            className={theatreMode ? 'h-full' : undefined}
            config={
              <PlinkoConfig
                shell={config.shell}
                betAmount={config.betAmount}
                rounds={config.rounds}
                fieldsDisabled={config.fieldsDisabled}
                risk={config.risk}
                rows={config.rows}
                turboMode={config.turboMode}
              />
            }
            board={
              <PlinkoBoard
                rows={board.rows}
                multipliers={board.multipliers}
                drops={board.drops}
                onBallLand={board.onBallLand}
                turboMode={board.turboMode}
                reducedMotion={board.reducedMotion}
                theatreMode={theatreMode}
                lastResults={board.lastResults}
                lastResultsAriaLabel={board.lastResultsAriaLabel}
                resultAnnouncement={board.resultAnnouncement}
                overlay={
                  <GameWinModal
                    open={winOverlay.open}
                    title={winOverlay.title}
                    multiplierLabel={winOverlay.multiplierLabel}
                    multiplier={winOverlay.multiplier}
                    formattedWinAmount={winOverlay.formattedWinAmount}
                    currencyIcon={winOverlay.currencyIcon}
                    volume={winOverlay.volume}
                    reducedMotion={winOverlay.reducedMotion}
                    contentClassName={winOverlay.contentClassName}
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
