'use client';

import { DiceOriginalsView } from '#ui/features/games/originals/dice/dice-originals-view';
import { useDiceOriginalsController } from '#ui/features/games/originals/dice/use-dice-originals-controller';
import { useDiceSession } from '#ui/features/games/originals/dice/use-dice-session';

export function DicePage() {
  const session = useDiceSession();
  const view = useDiceOriginalsController(session);

  return (
    <DiceOriginalsView
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
