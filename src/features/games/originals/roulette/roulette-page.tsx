'use client';

import { RouletteOriginalsView } from '#ui/features/games/originals/roulette/roulette-originals-view';
import { useRouletteOriginalsController } from '#ui/features/games/originals/roulette/use-roulette-originals-controller';
import { useRouletteSession } from '#ui/features/games/originals/roulette/use-roulette-session';

export function RoulettePage() {
  const session = useRouletteSession();
  const view = useRouletteOriginalsController(session);

  return (
    <RouletteOriginalsView
      config={view.config}
      board={view.board}
      winOverlay={view.winOverlay}
      header={view.header}
      theatreMode={view.theatreMode}
      theatreModeActive={view.theatreModeActive}
      theatreLayoutActive={view.theatreLayoutActive}
      theatreSync={view.theatreSync}
    />
  );
}