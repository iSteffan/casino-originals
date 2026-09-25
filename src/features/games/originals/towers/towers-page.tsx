'use client';

import { TowersOriginalsView } from '#ui/features/games/originals/towers/towers-originals-view';
import { useTowersOriginalsController } from '#ui/features/games/originals/towers/use-towers-originals-controller';
import { useTowersSession } from '#ui/features/games/originals/towers/use-towers-session';

export function TowersPage() {
  const session = useTowersSession();
  const view = useTowersOriginalsController(session);

  return (
    <TowersOriginalsView
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
