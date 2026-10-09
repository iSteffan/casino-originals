'use client';

import { DoubleBoard } from './double-board/double-board';
import type { DoubleBoardProps } from './double-board/double-board.types';
import { DoubleConfig } from './double-config/double-config';
import type { DoubleConfigProps } from './double-config/double-config.types';

import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface DoubleOriginalsViewProps {
  config: DoubleConfigProps;
  board: DoubleBoardProps;
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

export function DoubleOriginalsView({
  config,
  board,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: DoubleOriginalsViewProps) {
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
              <DoubleConfig
                shell={config.shell}
                betAmount={config.betAmount}
                rounds={config.rounds}
                fieldsDisabled={config.fieldsDisabled}
                betTypes={config.betTypes}
              />
            }
            board={
              <DoubleBoard
                phase={board.phase}
                phaseEndsAt={board.phaseEndsAt}
                bettingDurationMs={board.bettingDurationMs}
                rollDurationMs={board.rollDurationMs}
                tileIndex={board.tileIndex}
                lastResults={board.lastResults}
                stats={board.stats}
                title={board.title}
                statusLabels={board.statusLabels}
                lastResultsLabels={board.lastResultsLabels}
                lastResultsAriaLabel={board.lastResultsAriaLabel}
                resultAnnouncement={board.resultAnnouncement}
                reducedMotion={board.reducedMotion}
                theatreMode={theatreMode}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
