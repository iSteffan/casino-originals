'use client';

import { MinesOriginalsView } from '#ui/features/games/originals/mines/mines-originals-view';
import { useMinesOriginalsController } from '#ui/features/games/originals/mines/use-mines-originals-controller';
import { useMinesSession } from '#ui/features/games/originals/mines/use-mines-session';

export function MinesPage() {
  const session = useMinesSession();
  const view = useMinesOriginalsController(session);

  return (
    <MinesOriginalsView
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
