'use client';

import { DiceBoard } from '#ui/features/games/originals/dice/dice-board/dice-board';
import type { DiceBoardProps } from '#ui/features/games/originals/dice/dice-board/dice-board.types';
import { DiceConfig } from '#ui/features/games/originals/dice/dice-config/dice-config';
import type { DiceConfigProps } from '#ui/features/games/originals/dice/dice-config/dice-config.types';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import {
  GameWinModal,
  type GameWinModalProps,
} from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface DiceOriginalsViewProps {
  config: DiceConfigProps;
  board: DiceBoardProps;
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

export function DiceOriginalsView({
  config,
  board,
  winOverlay,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: DiceOriginalsViewProps) {
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
              <DiceConfig
                shell={config.shell}
                betAmount={config.betAmount}
                rounds={config.rounds}
                stopConditions={config.stopConditions}
                fieldsDisabled={config.fieldsDisabled}
                diceControls={config.diceControls}
              />
            }
            board={
              <DiceBoard
                displayValue={board.displayValue}
                rolledNumber={board.rolledNumber}
                markerValue={board.markerValue}
                markerState={board.markerState}
                isAnimating={board.isAnimating}
                animationDirection={board.animationDirection}
                labels={board.labels}
                lastResults={board.lastResults}
                lastResultsAssets={board.lastResultsAssets}
                lastResultsLabels={board.lastResultsLabels}
                lastResultsAriaLabel={board.lastResultsAriaLabel}
                resultAnnouncement={board.resultAnnouncement}
                sliderValue={board.sliderValue}
                onSliderValueChange={board.onSliderValueChange}
                sliderDisabled={board.sliderDisabled}
                direction={board.direction}
                theatreMode={board.theatreMode}
                overlay={
                  <GameWinModal
                    open={winOverlay.open}
                    title={winOverlay.title}
                    multiplierLabel={winOverlay.multiplierLabel}
                    multiplier={winOverlay.multiplier}
                    formattedWinAmount={winOverlay.formattedWinAmount}
                    currencyIcon={winOverlay.currencyIcon}
                    contentClassName={winOverlay.contentClassName}
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
