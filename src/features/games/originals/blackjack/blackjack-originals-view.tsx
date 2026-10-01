'use client';

import { BlackjackConfig } from '#ui/features/games/originals/blackjack/blackjack-config/blackjack-config';
import type { BlackjackConfigProps } from '#ui/features/games/originals/blackjack/blackjack-config/blackjack-config.types';
import { BlackjackTable } from '#ui/features/games/originals/blackjack/blackjack-table';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import {
  GameWinModal,
  type GameWinModalProps,
} from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';

export interface BlackjackOriginalsViewProps {
  config: BlackjackConfigProps;
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

export function BlackjackOriginalsView({
  config,
  winOverlay,
  header,
  theatreMode,
  theatreModeActive,
  theatreLayoutActive,
  theatreSync,
}: BlackjackOriginalsViewProps) {
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
              <BlackjackConfig
                amount={config.amount}
                onAmountChange={config.onAmountChange}
                amountLabel={config.amountLabel}
                amountTooltip={config.amountTooltip}
                conversionText={config.conversionText}
                currencyIcon={config.currencyIcon}
                amountQuickActions={config.amountQuickActions}
                amountError={config.amountError}
                amountLoading={config.amountLoading}
                thresholdWarning={config.thresholdWarning}
                startLabel={config.startLabel}
                onStart={config.onStart}
                startDisabled={config.startDisabled}
                playing={config.playing}
                insurance={config.insurance}
                actions={config.actions}
              />
            }
            board={
              <BlackjackTable
                theatreMode={theatreMode}
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