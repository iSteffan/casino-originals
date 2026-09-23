'use client';

import { KenoOriginalsView } from '#ui/features/games/originals/keno/keno-originals-view';
import { useKenoOriginalsController } from '#ui/features/games/originals/keno/use-keno-originals-controller';
import { useKenoSession } from '#ui/features/games/originals/keno/use-keno-session';

export function KenoPage() {
  const session = useKenoSession();
  const view = useKenoOriginalsController(session);

  return (
    <KenoOriginalsView
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
