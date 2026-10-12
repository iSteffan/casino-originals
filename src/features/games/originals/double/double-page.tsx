'use client';

import { DoubleOriginalsView } from '#ui/features/games/originals/double/double-originals-view';
import { useDoubleOriginalsController } from '#ui/features/games/originals/double/use-double-originals-controller';
import { useDoubleSession } from '#ui/features/games/originals/double/use-double-session';

export function DoublePage() {
  const session = useDoubleSession();
  const view = useDoubleOriginalsController(session);

  return (
    <DoubleOriginalsView
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
