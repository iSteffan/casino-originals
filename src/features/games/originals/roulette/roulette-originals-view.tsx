'use client';

import { RouletteBoard } from './roulette-board/roulette-board';
import type { RouletteBoardProps } from './roulette-board/roulette-board.types';
import { RouletteConfig } from './roulette-config/roulette-config';
import type { RouletteConfigProps } from './roulette-config/roulette-config.types';

import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import {
  GameWinModal,
  type GameWinModalProps,
} from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface RouletteOriginalsViewProps {
  config: RouletteConfigProps;
  board: RouletteBoardProps;
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

export function RouletteOriginalsView({
  config,
  board,
  winOverlay,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: RouletteOriginalsViewProps) {
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
            config={
              <RouletteConfig
                shell={config.shell}
                chips={config.chips}
                selectedChip={config.selectedChip}
                onSelectChip={config.onSelectChip}
                onUndo={config.onUndo}
                onClear={config.onClear}
                fieldsDisabled={config.fieldsDisabled}
                totalLabel={config.totalLabel}
                rounds={config.rounds}
                onRoundsChange={config.onRoundsChange}
                undoIcon={config.undoIcon}
                clearIcon={config.clearIcon}
                labels={config.labels}
              />
            }
            board={
              <RouletteBoard
                theatreMode={theatreMode}
                lastResults={board.lastResults}
                wheel={board.wheel}
                field={board.field}
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
